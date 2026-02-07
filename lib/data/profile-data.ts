// lib/data/profile-data.ts
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { Profile } from '@/lib/definitions';
import { createClient as createSSRClient } from '@/lib/supabase/server';

// 1. THE STATIC SHELL (Cached for 24 hours)
export const getProfileMetadata = async (username: string) => {
    return await unstable_cache(
        async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            );

            console.log(`🔍 Fetching: ${username}`);

            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, bio, country, created_at, role, tier, content_preference')
                .ilike('username', username)
                .single();

            if (error) console.error("DB Error:", error.message);
            if (!data) console.error("No Data Found");

            return data as Profile;
        },
        [`profile-meta-v2-${username}`],
        { revalidate: 86400, tags: [`profile-${username}`] }
    )();
};

// 2. THE DYNAMIC HOLE (Live or Short Cache)
export const getProfileCounts = async (userId: string) => {
    // ✅ CORRECT: Using the SSR client here
    const supabase = await createSSRClient();

    const [followers, following, logs] = await Promise.all([
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId).eq('status', 'accepted'),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('status', 'accepted'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);

    return {
        followers: followers.count || 0,
        following: following.count || 0,
        logs: logs.count || 0
    };
};

// 3. CHECK FOLLOW STATUS
export const getFollowStatus = async (targetUserId: string) => {
    // ✅ FIX: Changed 'createClient()' to 'createSSRClient()'
    // This allows it to read the user's cookies to see "Am I following this person?"
    const supabase = await createSSRClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    return !!data; // Returns true if row exists
};