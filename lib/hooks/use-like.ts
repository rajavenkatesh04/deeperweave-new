'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useLike(reviewId: string, initialLiked: boolean, initialCount: number) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [isPending, setIsPending] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const toggle = useCallback(async () => {
        if (isPending) return;

        const prevLiked = liked;
        const prevCount = count;

        // Optimistic update
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);
        setIsPending(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLiked(prevLiked);
                setCount(prevCount);
                return;
            }

            const { error } = await supabase.rpc('toggle_like', {
                p_user_id:   user.id,
                p_review_id: reviewId,
            });

            if (error) throw error;
        } catch {
            setLiked(prevLiked);
            setCount(prevCount);
            toast.error('Action failed. Try again.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, liked, count, supabase, reviewId]);

    return { liked, count, isPending, toggle };
}
