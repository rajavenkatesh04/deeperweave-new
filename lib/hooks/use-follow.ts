'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RelationshipStatus } from '@/lib/definitions';
import { toast } from 'sonner';

export function useFollow(targetUserId: string, initialStatus: RelationshipStatus) {
    const [status, setStatus] = useState<RelationshipStatus>(initialStatus);
    const [isPending, setIsPending] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const getUserId = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? null;
    }, [supabase]);

    // Follow (or send request for private accounts)
    const follow = useCallback(async () => {
        if (isPending) return;
        const prev = status;
        setStatus('accepted'); // optimistic — server corrects to 'pending' if needed
        setIsPending(true);

        try {
            const userId = await getUserId();
            if (!userId) { setStatus(prev); return; }

            const { data, error } = await supabase.rpc('send_follow_request', {
                p_follower_id: userId,
                p_target_id: targetUserId,
            });

            if (error) throw error;
            // Server returns actual status: 'accepted', 'pending', 'blocked', 'self'
            setStatus((data as RelationshipStatus) ?? prev);
        } catch {
            setStatus(prev);
            toast.error('Failed to follow. Try again.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, status, supabase, targetUserId, getUserId]);

    // Unfollow (also cancels a pending request)
    const unfollow = useCallback(async () => {
        if (isPending) return;
        const prev = status;
        setStatus('none'); // optimistic
        setIsPending(true);

        try {
            const userId = await getUserId();
            if (!userId) { setStatus(prev); return; }

            const { error } = await supabase.rpc('remove_follow', {
                p_follower_id: userId,
                p_target_id:   targetUserId,
            });

            if (error) {
                console.error('remove_follow error:', JSON.stringify(error));
                throw error;
            }
        } catch {
            setStatus(prev);
            toast.error('Failed to unfollow. Try again.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, status, supabase, targetUserId, getUserId]);

    // Accept an incoming follow request
    // DB signature: accept_follow_request(p_recipient_id uuid, p_follower_id uuid)
    const acceptRequest = useCallback(async (followerId: string) => {
        if (isPending) return;
        setIsPending(true);

        try {
            const userId = await getUserId();
            if (!userId) return;

            const { error } = await supabase.rpc('accept_follow_request', {
                p_recipient_id: userId,
                p_follower_id:  followerId,
            });

            if (error) {
                console.error('accept_follow_request error:', JSON.stringify(error));
                throw error;
            }
            toast.success('Follow request accepted.');
        } catch {
            toast.error('Failed to accept request.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, supabase, getUserId]);

    // Reject an incoming follow request
    // DB signature: reject_follow_request(p_recipient_id uuid, p_follower_id uuid)
    const rejectRequest = useCallback(async (followerId: string) => {
        if (isPending) return;
        setIsPending(true);

        try {
            const userId = await getUserId();
            if (!userId) return;

            const { error } = await supabase.rpc('reject_follow_request', {
                p_recipient_id: userId,
                p_follower_id:  followerId,
            });

            if (error) {
                console.error('reject_follow_request error:', JSON.stringify(error));
                throw error;
            }
            toast.success('Request declined.');
        } catch {
            toast.error('Failed to decline request.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, supabase, getUserId]);

    return { status, isPending, follow, unfollow, acceptRequest, rejectRequest };
}
