'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag } from "next/cache";

export async function toggleFollowAction(targetUserId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    // 1. Check current status
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

        // ✅ FIX: Added second argument '{ expire: 0 }' for Next.js 16
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

        // ✅ FIX: Added second argument '{ expire: 0 }' for Next.js 16
        revalidateTag(`profile-${user.user_metadata.username}`, { expire: 0 });
        return { isFollowing: true };
    }
}