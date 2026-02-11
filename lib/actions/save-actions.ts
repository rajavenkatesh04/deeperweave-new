'use server'

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { mirrorMovie, mirrorTV, mirrorPerson } from '@/lib/actions/media-actions';

/**
 * TOGGLE SAVE (Optimized)
 * 1. Mirrors the media to DB (if missing).
 * 2. Toggles the saved status.
 */
export async function toggleSave(
    mediaType: 'movie' | 'tv' | 'person',
    tmdbId: number,
    path: string
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Fire-and-forget mirror
    try {
        if (mediaType === 'movie') await mirrorMovie(tmdbId);
        else if (mediaType === 'tv') await mirrorTV(tmdbId);
        else await mirrorPerson(tmdbId);
    } catch (e) {
        console.error('Mirror failed:', e);
    }

    const { data: existing, error: checkError } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('media_type', mediaType)
        .eq('tmdb_id', tmdbId)
        .maybeSingle();

    if (checkError) {
        console.error('Save check failed:', checkError);
        return { error: checkError.message };
    }

    if (existing) {
        const { error } = await supabase
            .from('saved_items')
            .delete()
            .eq('user_id', user.id)
            .eq('media_type', mediaType)
            .eq('tmdb_id', tmdbId);

        if (error) return { error: error.message };

        revalidatePath(path);
        return { saved: false };
    }

    const { error } = await supabase
        .from('saved_items')
        .insert({
            user_id: user.id,
            media_type: mediaType,
            tmdb_id: tmdbId,
        });

    if (error) return { error: error.message };

    revalidatePath(path);
    return { saved: true };
}

/**
 * CHECK IS SAVED
 * Used by the client component to fetch initial state
 */
export async function getIsSaved(mediaType: 'movie' | 'tv' | 'person', tmdbId: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('saved_items')
        .select('tmdb_id')
        .eq('user_id', user.id)
        .eq('media_type', mediaType)
        .eq('tmdb_id', tmdbId)
        .single();

    return !!data;
}