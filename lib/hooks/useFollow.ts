import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleFollowAction, getFollowStatusAction } from '@/lib/actions/social-actions';
import { toast } from 'sonner';

export const useFollow = (targetUserId: string, initialIsFollowing: boolean) => {
    const queryClient = useQueryClient();
    const queryKey = ['follow-status', targetUserId];

    // 1. READ: Get the current status
    // uses 'initialData' to skip the first fetch and show UI instantly
    const { data: isFollowing } = useQuery({
        queryKey,
        queryFn: () => getFollowStatusAction(targetUserId),
        initialData: initialIsFollowing,
        staleTime: Infinity, // Trust the cache unless we explicitly invalidate
    });

    // 2. WRITE: The Optimistic Mutation
    const { mutate, isPending } = useMutation({
        mutationFn: () => toggleFollowAction(targetUserId),

        // ⚡ OPTIMISTIC UPDATE
        onMutate: async () => {
            // Stop background fetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousStatus = queryClient.getQueryData<boolean>(queryKey);

            // Instantly update the UI to the OPPOSITE value
            queryClient.setQueryData(queryKey, !previousStatus);

            // Return snapshot for potential rollback
            return { previousStatus };
        },

        // ❌ ERROR: Rollback
        onError: (err, newTodo, context) => {
            if (context?.previousStatus !== undefined) {
                queryClient.setQueryData(queryKey, context.previousStatus);
            }
            toast.error("Failed to update follow status");
        },

        // ✅ SETTLED: Sync with server to be sure
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return { isFollowing, mutate, isPending };
};