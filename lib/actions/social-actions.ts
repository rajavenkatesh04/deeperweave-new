'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag } from "next/cache";

// 1. TOGGLE FOLLOW (Write)
export async function toggleFollowAction(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // Check current status
    const { data: existingFollow } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    if (existingFollow) {
        // UNFOLLOW (Delete)
        await supabase
            .from('follows')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetUserId);

        // Revalidate the viewer's profile so their "following" count updates
        // Note: In a real app, you might also want to revalidate the target's profile
        revalidateTag(`profile-${user.user_metadata.username}`, { expire: 0 });

        return { isFollowing: false };
    } else {
        // FOLLOW (Insert)
        await supabase
            .from('follows')
            .insert({
                follower_id: user.id,
                following_id: targetUserId,
                status: 'accepted'
            });

        revalidateTag(`profile-${user.user_metadata.username}`, { expire: 0 });

        return { isFollowing: true };
    }
}

// 2. GET STATUS (Read)
// This is used by React Query to double-check status in the background
export async function getFollowStatusAction(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
        .from('follows')
        .select('status')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

    return !!data; // Returns true if row exists
}