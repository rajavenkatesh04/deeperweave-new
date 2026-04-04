// lib/data/profile-data.ts
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { Profile, ProfileSectionResolved } from '@/lib/definitions';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUser } from '@/lib/supabase/get-user';

// 1. PROFILE METADATA (Cached for 24 hours)
export const getProfileMetadata = async (username: string) => {
    // 1. FORCE LOWERCASE HERE
    // This ensures consistency. Whether I type "Sana" or "sana",
    // the system always looks for the tag "profile-sana".
    const tag = `profile-${username.toLowerCase()}`;

    return await unstable_cache(
        async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            );

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio, country, created_at, role, tier, content_preference, visibility')
                .eq('username', username.toLowerCase())
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Profile fetch error:", error.message);
                return null;
            }

            return data as Profile;
        },
        [`profile-meta-v3-${username.toLowerCase()}`],
        {
            revalidate: 86400, // 24 hours
            tags: [tag]
        }
    )();
};

// 2. PROFILE COUNTS (Cached for 5 minutes)
export const getProfileCounts = async (userId: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            );

            // ⚡ Parallel count queries
            const [followers, following, logs] = await Promise.all([
                supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('following_id', userId)
                    .eq('status', 'accepted'),
                supabase
                    .from('follows')
                    .select('*', { count: 'exact', head: true })
                    .eq('follower_id', userId)
                    .eq('status', 'accepted'),
                supabase
                    .from('reviews')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
            ]);

            return {
                followers: followers.count || 0,
                following: following.count || 0,
                logs: logs.count || 0
            };
        },
        [`profile-counts-${userId}`],
        {
            revalidate: 3600, // 1 hour
            tags: [`profile-counts-${userId}`]
        }
    )();
};

// 3. PROFILE SECTIONS (Cached 1 hour, invalidated on section mutations)
export const getProfileSections = async (userId: string): Promise<ProfileSectionResolved[]> => {
    return unstable_cache(
        async () => _fetchProfileSections(userId),
        [`profile-sections-${userId}`],
        { revalidate: 3600, tags: [`profile-sections-${userId}`] }
    )();
};

async function _fetchProfileSections(userId: string): Promise<ProfileSectionResolved[]> {
    // Use admin client for all reads: sections may have RLS scoped to auth.uid(),
    // but this function serves public profile pages that any visitor can view.
    const admin = await createAdminClient();

    const { data: sections, error } = await admin
        .from('profile_sections')
        .select('id, user_id, title, rank, type, linked_list_id, created_at, section_items(id, section_id, media_type, media_id, rank, is_private, created_at)')
        .eq('user_id', userId)
        .order('rank', { ascending: true });

    if (error || !sections || sections.length === 0) return [];

    const movieIds: number[] = [];
    const tvIds: number[] = [];
    const personIds: number[] = [];

    for (const s of sections) {
        for (const item of (s.section_items ?? []) as any[]) {
            if (item.media_type === 'movie') movieIds.push(item.media_id);
            else if (item.media_type === 'tv') tvIds.push(item.media_id);
            else if (item.media_type === 'person') personIds.push(item.media_id);
        }
    }

    // Use admin client to bypass RLS on mirror tables — these are internal cache tables
    const [movies, tvShows, people] = await Promise.all([
        movieIds.length ? admin.from('movies').select('tmdb_id, title, poster_path').in('tmdb_id', movieIds).then(r => r.data ?? []) : Promise.resolve([]),
        tvIds.length ? admin.from('tv_shows').select('tmdb_id, name, poster_path').in('tmdb_id', tvIds).then(r => r.data ?? []) : Promise.resolve([]),
        personIds.length ? admin.from('people').select('tmdb_id, name, profile_path').in('tmdb_id', personIds).then(r => r.data ?? []) : Promise.resolve([]),
    ]);

    const movieMap  = new Map((movies as any[]).map(m => [m.tmdb_id, { title: m.title, poster_path: m.poster_path }]));
    const tvMap     = new Map((tvShows as any[]).map(t => [t.tmdb_id, { title: t.name, poster_path: t.poster_path }]));
    const personMap = new Map((people as any[]).map(p => [p.tmdb_id, { title: p.name, poster_path: p.profile_path }]));

    return sections.map(s => ({
        ...s,
        items: ((s.section_items ?? []) as any[])
            .filter(item => !item.is_private)
            .sort((a: any, b: any) => a.rank - b.rank)
            .map((item: any) => {
                const media = item.media_type === 'movie' ? movieMap.get(item.media_id)
                    : item.media_type === 'tv'     ? tvMap.get(item.media_id)
                        : personMap.get(item.media_id);
                return {
                    ...item,
                    title:       media?.title ?? '',
                    poster_path: media?.poster_path ?? null,
                };
            }),
    })) as ProfileSectionResolved[];
}

// 4. CHECK FOLLOW STATUS (Always fresh - this is user-specific)
export const getFollowStatus = async (targetUserId: string) => {
    const user = await getUser();

    if (!user) return false;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    return !!data;
};