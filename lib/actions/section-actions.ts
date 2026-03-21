'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { mirrorMovie, mirrorTV, mirrorPerson } from './media-actions';
import { TierType, TIER_LIMITS } from '@/lib/definitions';

/* ─── Helpers ───────────────────────────────────────────────────── */

function invalidate(username: string, userId: string) {
    revalidatePath(`/profile/${username}/home`);
    revalidateTag(`profile-sections-${userId}`, 'max');
}

/* ─── Section CRUD ──────────────────────────────────────────────── */

export async function createSection(title: string): Promise<{ id: string; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { id: '', error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('tier, username')
        .eq('id', user.id)
        .single();

    const tier = (profile?.tier ?? 'free') as TierType;
    const username = profile?.username as string;
    const limit = TIER_LIMITS[tier].sections;

    const { count } = await supabase
        .from('profile_sections')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

    if ((count ?? 0) >= limit) {
        return { id: '', error: `Your plan allows up to ${limit} section${limit === 1 ? '' : 's'}. Upgrade to add more.` };
    }

    const { data, error } = await supabase
        .from('profile_sections')
        .insert({ user_id: user.id, title: title.trim(), rank: (count ?? 0) + 1, type: 'custom' })
        .select('id')
        .single();

    if (error) return { id: '', error: error.message };
    invalidate(username, user.id);
    return { id: data.id };
}

export async function updateSectionTitle(sectionId: string, title: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    const { error } = await supabase
        .from('profile_sections')
        .update({ title: title.trim() })
        .eq('id', sectionId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    invalidate(profile?.username as string, user.id);
    return {};
}

export async function deleteSection(sectionId: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    // Delete items first (no cascade defined in schema)
    await supabase.from('section_items').delete().eq('section_id', sectionId);

    const { error } = await supabase
        .from('profile_sections')
        .delete()
        .eq('id', sectionId)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    invalidate(profile?.username as string, user.id);
    return {};
}

export async function reorderSections(orderedIds: string[]): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    await Promise.all(
        orderedIds.map((id, i) =>
            supabase
                .from('profile_sections')
                .update({ rank: i + 1 })
                .eq('id', id)
                .eq('user_id', user.id)
        )
    );

    invalidate(profile?.username as string, user.id);
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('tier, username')
        .eq('id', user.id)
        .single();

    const tier = (profile?.tier ?? 'free') as TierType;
    const username = profile?.username as string;
    const itemLimit = TIER_LIMITS[tier].items;

    // Ownership check
    const { data: section } = await supabase
        .from('profile_sections')
        .select('user_id')
        .eq('id', sectionId)
        .single();

    if (section?.user_id !== user.id) return { id: '', error: 'Forbidden' };

    // Count existing items
    const { count } = await supabase
        .from('section_items')
        .select('id', { count: 'exact', head: true })
        .eq('section_id', sectionId);

    if ((count ?? 0) >= itemLimit) {
        return { id: '', error: `Your plan allows up to ${itemLimit} item${itemLimit === 1 ? '' : 's'} per section.` };
    }

    // Duplicate check
    const { data: existing } = await supabase
        .from('section_items')
        .select('id')
        .eq('section_id', sectionId)
        .eq('media_type', mediaType)
        .eq('media_id', mediaId)
        .maybeSingle();

    if (existing) return { id: existing.id, error: 'Already in this section' };

    // Mirror to local DB (lazy pattern)
    if (mediaType === 'movie') await mirrorMovie(mediaId);
    else if (mediaType === 'tv') await mirrorTV(mediaId);
    else await mirrorPerson(mediaId);

    const { data, error } = await supabase
        .from('section_items')
        .insert({ section_id: sectionId, media_type: mediaType, media_id: mediaId, rank: (count ?? 0) + 1 })
        .select('id')
        .single();

    if (error) return { id: '', error: error.message };
    invalidate(username, user.id);
    return { id: data.id };
}

export async function deleteSectionItem(itemId: string): Promise<{ error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    // Verify ownership via section
    const { data: item } = await supabase
        .from('section_items')
        .select('id, section_id')
        .eq('id', itemId)
        .single();

    if (!item) return { error: 'Not found' };

    const { data: section } = await supabase
        .from('profile_sections')
        .select('user_id')
        .eq('id', item.section_id)
        .single();

    if (section?.user_id !== user.id) return { error: 'Forbidden' };

    const { error } = await supabase.from('section_items').delete().eq('id', itemId);
    if (error) return { error: error.message };

    invalidate(profile?.username as string, user.id);
    return {};
}