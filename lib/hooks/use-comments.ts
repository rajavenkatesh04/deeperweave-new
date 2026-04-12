'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CommentWithAuthor } from '@/lib/definitions';
import { toast } from 'sonner';

export function useComments(reviewId: string, initialComments: CommentWithAuthor[] = []) {
    const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
    const [isPending, setIsPending] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const addComment = useCallback(async (content: string) => {
        if (isPending || !content.trim()) return;
        setIsPending(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { toast.error('You must be signed in to comment.'); return; }

            // Fetch the actor's profile for optimistic display
            const { data: profile } = await supabase
                .from('profiles')
                .select('username, full_name, avatar_url')
                .eq('id', user.id)
                .single();

            const { data: commentId, error } = await supabase.rpc('add_comment', {
                p_user_id:   user.id,
                p_review_id: reviewId,
                p_content:   content.trim(),
            });

            if (error) throw error;

            // Append optimistically with real ID from server
            const newComment: CommentWithAuthor = {
                id:         commentId as string,
                user_id:    user.id,
                review_id:  reviewId,
                content:    content.trim(),
                like_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                author: {
                    username:   profile?.username ?? null,
                    full_name:  profile?.full_name ?? null,
                    avatar_url: profile?.avatar_url ?? null,
                },
            };
            setComments(prev => [...prev, newComment]);
        } catch {
            toast.error('Failed to post comment. Try again.');
        } finally {
            setIsPending(false);
        }
    }, [isPending, supabase, reviewId]);

    const deleteComment = useCallback(async (commentId: string) => {
        // Optimistically remove
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.rpc('delete_comment', {
                p_user_id:    user.id,
                p_comment_id: commentId,
            });

            if (error) throw error;
        } catch {
            // Revert is hard without the removed item — just show error
            toast.error('Failed to delete comment. Try again.');
        }
    }, [supabase]);

    return { comments, isPending, addComment, deleteComment };
}
