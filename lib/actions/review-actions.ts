'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { reviewSchema } from '@/lib/validations/review';
import { mirrorMovie, mirrorTV } from '@/lib/actions/media-actions';

export type ActionState = {
    message: string | null;
    errors?: Record<string, string[]>;
};

export async function createReview(
    prevState: ActionState,
    formData: FormData
): Promise<ActionState> {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { message: 'Unauthorized' };
    }

    // 2. Validate
    const rawData = Object.fromEntries(formData);
    const validated = reviewSchema.safeParse({
        ...rawData,
        contains_spoilers: formData.get('contains_spoilers') === 'on',
        watched_with: formData.getAll('watched_with').join(','),
    });

    if (!validated.success) {
        return { message: 'Validation failed', errors: validated.error.flatten().fieldErrors };
    }

    const data = validated.data;

    // 3. Lazy Mirror
    // We log this to ensure it's not the slow part
    console.log(`[Review] Mirroring ${data.media_type} ${data.tmdb_id}...`);
    const mirrorSuccess = data.media_type === 'movie'
        ? await mirrorMovie(data.tmdb_id)
        : await mirrorTV(data.tmdb_id);

    if (!mirrorSuccess) {
        return { message: 'Sync failed. Media not found.' };
    }

    // 4. Automatic Rewatch Calculation (ROBUST VERSION)
    // Replaced 'head: true' with a standard select to avoid empty errors
    const idColumn = data.media_type === 'movie' ? 'movie_id' : 'tv_show_id';

    const { count, error: countError } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: false }) // changed head: false
        .eq('user_id', user.id)
        .eq(idColumn, data.tmdb_id);

    if (countError) {
        console.error('[Review] Count Error:', JSON.stringify(countError, null, 2));
        // Fallback: Assume 0 if check fails, don't block the user
        // return { message: 'Database error' };
    }

    const previousWatches = count || 0;
    const isRewatch = previousWatches > 0;
    const rewatchCount = previousWatches + 1;

    // 5. Storage
    let attachmentUrl: string | null = null;
    if (data.photo && data.photo.size > 0 && data.photo.name !== 'undefined') {
        const fileExt = data.photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${user.id}/timeline/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('user_uploads')
            .upload(filePath, data.photo);

        if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
                .from('user_uploads')
                .getPublicUrl(filePath);
            attachmentUrl = publicUrlData.publicUrl;
        }
    }

    // 6. Database Write
    console.log(`[Review] Inserting review for ${data.tmdb_id}...`);
    const { data: review, error: insertError } = await supabase
        .from('reviews')
        .insert({
            user_id: user.id,
            movie_id: data.media_type === 'movie' ? data.tmdb_id : null,
            tv_show_id: data.media_type === 'tv' ? data.tmdb_id : null,
            rating: data.rating,
            content: data.content,
            watched_on: data.watched_on,
            contains_spoilers: data.contains_spoilers,
            viewing_method: data.viewing_method,
            viewing_service: data.viewing_service,
            is_rewatch: isRewatch,
            rewatch_count: rewatchCount,
            attachments: attachmentUrl ? [attachmentUrl] : [],
        })
        .select('id')
        .single();

    if (insertError) {
        console.error('[Review] Insert Error:', JSON.stringify(insertError, null, 2));
        return { message: `Save failed: ${insertError.message}` };
    }

    // 7. Mentions
    if (data.watched_with && review) {
        const friendIds = data.watched_with.split(',').filter(Boolean);
        if (friendIds.length > 0) {
            await supabase.from('review_mentions').insert(
                friendIds.map(fid => ({ review_id: review.id, user_id: fid }))
            );
        }
    }

    revalidatePath(`/profile/${user.user_metadata.username}`);
    return { message: 'Success' };
}