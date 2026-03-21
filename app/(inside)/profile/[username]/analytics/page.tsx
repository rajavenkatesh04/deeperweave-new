import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfileMetadata } from '@/lib/data/profile-data';
import { AnalyticsDashboard } from './analytics-dashboard';

export default async function AnalyticsPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const supabase = await createClient();

    const [authResponse, profile] = await Promise.all([
        supabase.auth.getUser(),
        getProfileMetadata(username),
    ]);

    if (!profile) notFound();

    const isOwnProfile = authResponse.data.user?.id === profile.id;

    // Single query — all analytics computed client-side from this payload
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            id,
            watched_on,
            rating,
            viewing_method,
            viewing_service,
            is_rewatch,
            movie_id,
            tv_show_id,
            created_at,
            movie:movies(title, poster_path, runtime, original_language),
            tv:tv_shows(name, poster_path)
        `)
        .eq('user_id', profile.id)
        .order('watched_on', { ascending: false });

    return (
        <AnalyticsDashboard
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            reviews={(reviews ?? []) as any}
            username={username}
            isOwnProfile={isOwnProfile}
        />
    );
}