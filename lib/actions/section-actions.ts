'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { mirrorMovie, mirrorTV, mirrorPerson } from './media-actions';
import { TierType, TIER_LIMITS } from '@/lib/definitions';

/* ─── Helpers ───────────────────────────────────────────────────── */

function invalidate(username: string) {
    const cleanUsername = username.toLowerCase();

    revalidateTag(`user-profile-${cleanUsername}`, 'max');
    revalidatePath(`/profile/${cleanUsername}/home`);
    revalidatePath('/profile/edit');
}

/* ─── Section CRUD ──────────────────────────────────────────────── */

export async function createSection(title: string): Promise<{ id: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: '', error: 'Unauthorized' };

    // 🔥 Zero DB Reads: Fetch tier directly from verified JWT metadata
    const tier = (user.app_metadata?.tier ?? 'free') as TierType;
    const username = user.app_metadata?.username as string;
    const limit = TIER_LIMITS[tier]?.sections ?? 3;

    // Count existing sections to enforce limits at the application level
    const { count } = await supabase
        .from('profile_sections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if ((count ?? 0) >= limit) {
        return { id: '', error: `Your plan allows up to ${limit} sections. Upgrade to add more.` };
    }

    const { data, error } = await supabase
        .from('profile_sections')
        .insert({ user_id: user.id, title: title.trim(), rank: (count ?? 0) + 1, type: 'custom' })
        .select('id')
        .single();

    if (error) return { id: '', error: error.message };

    invalidate(username);
    return { id: data.id };
}

export async function updateSectionTitle(sectionId: string, title: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const username = user.app_metadata?.username as string;

    const { error } = await supabase
        .from('profile_sections')
        .update({ title: title.trim() })
        .eq('id', sectionId)
        .eq('user_id', user.id); // Ownership check built into the update

    if (error) return { error: error.message };

    invalidate(username);
    return {};
}

export async function deleteSection(sectionId: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const username = user.app_metadata?.username as string;

    // Delete items first to prevent orphans (since schema lacked cascade here)
    await supabase.from('section_items').delete().eq('section_id', sectionId);

    const { error } = await supabase
        .from('profile_sections')
        .delete()
        .eq('id', sectionId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    invalidate(username);
    return {};
}

export async function reorderSections(orderedIds: string[]): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const username = user.app_metadata?.username as string;

    await Promise.all(
        orderedIds.map((id, i) =>
            supabase
                .from('profile_sections')
                .update({ rank: i + 1 })
                .eq('id', id)
                .eq('user_id', user.id)
        )
    );

    invalidate(username);
    return {};
}

/* ─── Batch Save ────────────────────────────────────────────────── */

export interface ItemDraft {
    id: string; // real UUID or 'tmp_xxx' for new items
    media_type: 'movie' | 'tv' | 'person';
    media_id: number;
    rank: number;
}

export interface SectionDraft {
    id: string; // real UUID or 'tmp_xxx' for new sections
    title: string;
    rank: number;
    items: ItemDraft[];
}

export async function saveSections(drafts: SectionDraft[]): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const tier = (user.app_metadata?.tier ?? 'free') as TierType;
    const username = user.app_metadata?.username as string;
    const limits = TIER_LIMITS[tier];

    if (drafts.length > limits.sections) {
        return { error: `Your plan allows up to ${limits.sections} sections.` };
    }

    // Fetch current DB state to reconcile
    const { data: currentSections } = await supabase
        .from('profile_sections')
        .select('id, section_items(id)')
        .eq('user_id', user.id);

    const dbSections = (currentSections ?? []) as { id: string; section_items: { id: string }[] }[];
    const draftExistingIds = new Set(drafts.filter(d => !d.id.startsWith('tmp_')).map(d => d.id));

    // 1. Delete sections that were removed
    for (const s of dbSections.filter(s => !draftExistingIds.has(s.id))) {
        await supabase.from('section_items').delete().eq('section_id', s.id);
        await supabase.from('profile_sections').delete().eq('id', s.id).eq('user_id', user.id);
    }

    // 2. Create or update each section + sync its items
    for (const draft of drafts) {
        const isNew = draft.id.startsWith('tmp_');
        const title = draft.title.trim() || 'Untitled';
        let sectionId: string;

        if (isNew) {
            const { data, error } = await supabase
                .from('profile_sections')
                .insert({ user_id: user.id, title, rank: draft.rank, type: 'custom' })
                .select('id')
                .single();
            if (error || !data) return { error: error?.message ?? 'Failed to create section' };
            sectionId = data.id;
        } else {
            sectionId = draft.id;
            await supabase
                .from('profile_sections')
                .update({ title, rank: draft.rank })
                .eq('id', sectionId)
                .eq('user_id', user.id);
        }

        // Sync items for this section
        const dbSection = dbSections.find(s => s.id === draft.id);
        const dbItemIds = new Set((dbSection?.section_items ?? []).map(i => i.id));
        const draftItemRealIds = new Set(draft.items.filter(i => !i.id.startsWith('tmp_')).map(i => i.id));

        if (!isNew) {
            for (const itemId of dbItemIds) {
                if (!draftItemRealIds.has(itemId)) {
                    await supabase.from('section_items').delete().eq('id', itemId);
                }
            }
        }

        for (const item of draft.items.slice(0, limits.items)) {
            if (item.id.startsWith('tmp_')) {
                if (item.media_type === 'movie') await mirrorMovie(item.media_id);
                else if (item.media_type === 'tv') await mirrorTV(item.media_id);
                else await mirrorPerson(item.media_id);
                await supabase.from('section_items').insert({
                    section_id: sectionId,
                    media_type: item.media_type,
                    media_id: item.media_id,
                    rank: item.rank,
                });
            } else if (!isNew) {
                await supabase.from('section_items').update({ rank: item.rank }).eq('id', item.id);
            }
        }
    }

    invalidate(username);
    return {};
}

/* ─── Section Item CRUD ─────────────────────────────────────────── */

export async function addSectionItem(
    sectionId: string,
    mediaType: 'movie' | 'tv' | 'person',
    mediaId: number,
): Promise<{ id: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: '', error: 'Unauthorized' };

    // 🔥 Zero DB Reads: Extract limits directly from app_metadata
    const tier = (user.app_metadata?.tier ?? 'free') as TierType;
    const username = user.app_metadata?.username as string;
    const itemLimit = TIER_LIMITS[tier]?.items ?? 10;

    // Verify section ownership (Crucial security step)
    const { data: section } = await supabase
        .from('profile_sections')
        .select('user_id')
        .eq('id', sectionId)
        .single();

    if (section?.user_id !== user.id) return { id: '', error: 'Forbidden' };

    // Enforce Item Limit
    const { count } = await supabase
        .from('section_items')
        .select('id', { count: 'exact', head: true })
        .eq('section_id', sectionId);

    if ((count ?? 0) >= itemLimit) {
        return { id: '', error: `Your plan allows up to ${itemLimit} items per section.` };
    }

    // Duplicate Check
    const { data: existing } = await supabase
        .from('section_items')
        .select('id')
        .eq('section_id', sectionId)
        .eq('media_type', mediaType)
        .eq('media_id', mediaId)
        .maybeSingle();

    if (existing) return { id: existing.id, error: 'Already in this section' };

    // Trigger lazy DB mirror (as defined in your checklist)
    if (mediaType === 'movie') await mirrorMovie(mediaId);
    else if (mediaType === 'tv') await mirrorTV(mediaId);
    else await mirrorPerson(mediaId);

    const { data, error } = await supabase
        .from('section_items')
        .insert({ section_id: sectionId, media_type: mediaType, media_id: mediaId, rank: (count ?? 0) + 1 })
        .select('id')
        .single();

    if (error) return { id: '', error: error.message };

    invalidate(username);
    return { id: data.id };
}

export async function deleteSectionItem(itemId: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const username = user.app_metadata?.username as string;

    const { data: item } = await supabase
        .from('section_items')
        .select('id, section_id')
        .eq('id', itemId)
        .single();

    if (!item) return { error: 'Not found' };

    // Verify ownership of the section this item belongs to
    const { data: section } = await supabase
        .from('profile_sections')
        .select('user_id')
        .eq('id', item.section_id)
        .single();

    if (section?.user_id !== user.id) return { error: 'Forbidden' };

    const { error } = await supabase.from('section_items').delete().eq('id', itemId);
    if (error) return { error: error.message };

    invalidate(username);
    return {};
}