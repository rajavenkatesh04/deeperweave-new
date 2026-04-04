import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/get-user';
import { getProfileMetadata } from '@/lib/data/profile-data';
import {ReviewsFeed} from "@/app/ui/reviews/reviews-feed";

export default async function ReviewsPage({
    params,
    searchParams,
}: {
    params: Promise<{ username: string }>;
    searchParams: Promise<{ review?: string }>;
}) {
    const { username } = await params;
    const { review: highlightId } = await searchParams;
    const supabase = await createClient();

    // 1. Parallel Data Fetching (Fast)
    const [user, profile] = await Promise.all([
        getUser(),
        getProfileMetadata(username)
    ]);

    if (!profile) notFound();
    const isOwnProfile = user?.id === profile.id;

    // 3. Fetch Reviews (Server Side)
    // We join with movies/tv_shows to get the poster/title for the card
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            *,
            movie:movies(title, poster_path, release_date),
            tv:tv_shows(name, poster_path, first_air_date)
        `)
        .eq('user_id', profile.id)
        .order('watched_on', { ascending: false });

    // 4. Render the Feed
    return (
        <ReviewsFeed
            username={username}
            isOwnProfile={isOwnProfile}
            initialReviews={reviews || []}
            highlightId={highlightId}
        />
    );
}