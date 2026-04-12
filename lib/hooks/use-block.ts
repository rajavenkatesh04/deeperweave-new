'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useBlock(targetUserId: string, initialIsBlocked = false) {
    const [isBlocked, setIsBlocked] = useState(initialIsBlocked);
    const [isPending, setIsPending] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const getUserId = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id ?? null;
    }, [supabase]);

    const block = useCallback(async () => {
        if (isPending) return;
        const prev = isBlocked;
        setIsBlocked(true); // optimistic
        setIsPending(true);

        try {
            const userId = await getUserId();
            if (!userId) { setIsBlocked(prev); return; }

            const { error } = await supabase.rpc('block_user', {
                p_blocker_id: userId,
                p_blocked_id: targetUserId,
            });

            if (error) throw error;
            toast.success('User blocked.');
        } catch {
            setIsBlocked(prev);
            toast.error('Failed to block user. Try again.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, isBlocked, supabase, targetUserId, getUserId]);

    const unblock = useCallback(async () => {
        if (isPending) return;
        const prev = isBlocked;
        setIsBlocked(false); // optimistic
        setIsPending(true);

        try {
            const userId = await getUserId();
            if (!userId) { setIsBlocked(prev); return; }

            const { error } = await supabase.rpc('unblock_user', {
                p_blocker_id: userId,
                p_blocked_id: targetUserId,
            });

            if (error) throw error;
            toast.success('User unblocked.');
        } catch {
            setIsBlocked(prev);
            toast.error('Failed to unblock user. Try again.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, isBlocked, supabase, targetUserId, getUserId]);

    return { isBlocked, isPending, block, unblock };
}
