import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfileMetadata } from '@/lib/data/profile-data';
import {ReviewsFeed} from "@/app/ui/reviews/reviews-feed";

export default async function ReviewsPage({
                                              params
                                          }: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params;
    const supabase = await createClient();

    // 1. Parallel Data Fetching (Fast)
    const [authResponse, profile] = await Promise.all([
        supabase.auth.getUser(),
        getProfileMetadata(username)
    ]);

    if (!profile) notFound();

    // 2. Check Ownership (Cheap)
    const user = authResponse.data.user;
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
        />
    );
}