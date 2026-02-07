'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toggleFollowAction } from '@/lib/actions/social-actions';
import { UserPlus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing?: boolean;
    className?: string;
}

export default function FollowButton({
                                         targetUserId,
                                         initialIsFollowing = false,
                                         className
                                     }: FollowButtonProps) {
    // Local state is sufficient for initial load, but we sync with Query
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const queryClient = useQueryClient();
    const queryKey = ['follow-status', targetUserId];

    const { mutate, isPending } = useMutation({
        mutationFn: async () => await toggleFollowAction(targetUserId),

        // ⚡ OPTIMISTIC UPDATE (The Magic)
        onMutate: async () => {
            // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey });

            // 2. Snapshot the previous value
            const previousStatus = isFollowing;

            // 3. Optimistically update to the new value
            setIsFollowing((prev) => !prev);

            // Return a context object with the snapshotted value
            return { previousStatus };
        },

        // If the server errors, roll back to the snapshot
        onError: (err, newTodo, context) => {
            if (context?.previousStatus !== undefined) {
                setIsFollowing(context.previousStatus);
            }
            toast.error("Failed to update follow status");
        },

        // Always refetch after error or success to ensure sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return (
        <Button
            onClick={() => mutate()}
            disabled={isPending}
            variant={isFollowing ? "secondary" : "default"}
            className={className}
            size="sm"
        >
            {isFollowing ? (
                <>
                    <Check className="w-4 h-4 mr-2" />
                    Following
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                </>
            )}
        </Button>
    );
}