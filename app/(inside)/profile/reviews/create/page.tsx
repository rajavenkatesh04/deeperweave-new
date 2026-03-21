import { CreateReviewForm } from '@/app/(inside)/profile/reviews/create/create-review-form';
import { createClient } from '@/lib/supabase/server';
import { getMovieDetails, getTVDetails } from '@/lib/tmdb/client';
import { Movie, TV } from '@/lib/types/tmdb';

export default async function CreateReviewPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string; type?: string }>;
}) {
    const params = await searchParams;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const username = (user?.app_metadata?.username ?? user?.user_metadata?.username) as string | undefined;
    const tier = (user?.app_metadata?.tier ?? user?.app_metadata?.plan ?? 'free') as string;

    let initialMedia: Movie | TV | null = null;
    if (params.id && params.type) {
        const id = parseInt(params.id);
        if (!isNaN(id)) {
            if (params.type === 'movie') {
                initialMedia = await getMovieDetails(id) ?? null;
            } else if (params.type === 'tv') {
                initialMedia = await getTVDetails(id) ?? null;
            }
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <CreateReviewForm initialMedia={initialMedia} username={username} tier={tier} />
        </div>
    );
}