// lib/data/profile-data.ts
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { Profile } from '@/lib/definitions';
import { createClient as createSSRClient } from '@/lib/supabase/server';

// 1. PROFILE METADATA (Cached for 24 hours)
export const getProfileMetadata = async (username: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            );

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio, country, created_at, role, tier, content_preference, visibility')
                .ilike('username', username)
                .single();

            if (error) {
                console.error("Profile fetch error:", error.message);
                return null;
            }

            return data as Profile;
        },
        [`profile-meta-v3-${username}`],
        {
            revalidate: 86400, // 24 hours
            tags: [`profile-${username}`]
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
            revalidate: 300, // 5 minutes
            tags: [`profile-counts-${userId}`]
        }
    )();
};

// 3. CHECK FOLLOW STATUS (Always fresh - this is user-specific)
export const getFollowStatus = async (targetUserId: string) => {
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    return !!data;
};