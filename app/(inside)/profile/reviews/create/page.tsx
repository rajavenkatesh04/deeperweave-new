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
                const movie = await getMovieDetails(id);
                if (movie) initialMedia = { ...movie, media_type: 'movie' as const };
            } else if (params.type === 'tv') {
                const tv = await getTVDetails(id);
                if (tv) initialMedia = { ...tv, media_type: 'tv' as const };
            }
        }
    }

    // Generate a unique key so React completely resets the form when the URL changes
    const formKey = initialMedia?.id ? `${initialMedia.media_type}-${initialMedia.id}` : 'new-review';

    return (
        <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Polka dot — light */}
            <div
                className="dark:hidden absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Polka dot — dark */}
            <div
                className="hidden dark:block absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            <div className="relative z-10">
                <CreateReviewForm
                    key={formKey}
                    initialMedia={initialMedia}
                    username={username}
                    tier={tier}
                />
            </div>
        </div>
    );
}