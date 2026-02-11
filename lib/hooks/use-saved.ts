import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIsSaved, toggleSave } from '@/lib/actions/save-actions';
import { toast } from 'sonner';

export function useSaved(mediaType: 'movie' | 'tv' | 'person', tmdbId: number) {
    const queryClient = useQueryClient();
    const queryKey = ['saved', mediaType, tmdbId];

    // 1. FETCH STATUS (Client Side)
    const { data: isSaved, isLoading } = useQuery({
        queryKey,
        queryFn: () => getIsSaved(mediaType, tmdbId),
    });

    // 2. MUTATION (Toggle)
    const { mutate } = useMutation({
        mutationFn: async () => {
            // We pass a dummy path because TanStack handles the UI update now
            return toggleSave(mediaType, tmdbId, '/');
        },
        onMutate: async () => {
            // OPTIMISTIC UPDATE: Cancel outgoing fetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousSaved = queryClient.getQueryData(queryKey);

            // Optimistically set to the new value
            queryClient.setQueryData(queryKey, (old: boolean) => !old);

            return { previousSaved };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            queryClient.setQueryData(queryKey, context?.previousSaved);
            toast.error("Failed to save item.");
        },
        onSettled: () => {
            // Sync with server state
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return { isSaved, isLoading, toggle: mutate };
}