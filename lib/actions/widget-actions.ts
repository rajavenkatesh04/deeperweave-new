'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mirrorMovie, mirrorTV } from './media-actions';
import { TierType } from '@/lib/definitions';

type MediaType = 'movie' | 'tv';

function invalidate(username: string) {
    revalidatePath(`/profile/${username}/home`);
}

async function assertPaidTier() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, error: 'Unauthorized' as const };

    const tier = (user.app_metadata?.tier ?? 'free') as TierType;
    if (tier === 'free') return { user: null, error: 'Widgets are a paid feature. Upgrade to Auteur or Cineaste.' as const };

    return { user, supabase, error: null };
}

// ── Currently Watching ───────────────────────────────────────────────────────

export async function setCurrentlyWatching(
    mediaType: MediaType,
    mediaId: number,
): Promise<{ error?: string }> {
    const { user, supabase, error: authError } = await assertPaidTier();
    if (authError || !user || !supabase) return { error: authError ?? 'Unauthorized' };

    // Lazy Mirror — ensure the entity exists in our DB before referencing it
    const mirrored = mediaType === 'movie' ? await mirrorMovie(mediaId) : await mirrorTV(mediaId);
    if (!mirrored) return { error: 'Could not resolve media. Try again.' };

    const { error } = await supabase
        .from('currently_watching')
        .upsert({ user_id: user.id, media_type: mediaType, media_id: mediaId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) return { error: error.message };

    invalidate(user.app_metadata?.username);
    return {};
}

export async function clearCurrentlyWatching(): Promise<{ error?: string }> {
    const { user, supabase, error: authError } = await assertPaidTier();
    if (authError || !user || !supabase) return { error: authError ?? 'Unauthorized' };

    const { error } = await supabase.from('currently_watching').delete().eq('user_id', user.id);
    if (error) return { error: error.message };

    invalidate(user.app_metadata?.username);
    return {};
}

// ── Up Next ──────────────────────────────────────────────────────────────────

export async function setUpNext(
    mediaType: MediaType,
    mediaId: number,
): Promise<{ error?: string }> {
    const { user, supabase, error: authError } = await assertPaidTier();
    if (authError || !user || !supabase) return { error: authError ?? 'Unauthorized' };

    const mirrored = mediaType === 'movie' ? await mirrorMovie(mediaId) : await mirrorTV(mediaId);
    if (!mirrored) return { error: 'Could not resolve media. Try again.' };

    // One row per user — delete existing, then insert
    await supabase.from('watch_queue').delete().eq('user_id', user.id);

    const { error } = await supabase
        .from('watch_queue')
        .insert({ user_id: user.id, media_type: mediaType, media_id: mediaId, rank: 0 });

    if (error) return { error: error.message };

    invalidate(user.app_metadata?.username);
    return {};
}

export async function clearUpNext(): Promise<{ error?: string }> {
    const { user, supabase, error: authError } = await assertPaidTier();
    if (authError || !user || !supabase) return { error: authError ?? 'Unauthorized' };

    const { error } = await supabase.from('watch_queue').delete().eq('user_id', user.id);
    if (error) return { error: error.message };

    invalidate(user.app_metadata?.username);
    return {};
}
