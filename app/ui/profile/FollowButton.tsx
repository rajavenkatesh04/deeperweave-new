'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, Check } from 'lucide-react';
import { useFollow } from '@/lib/hooks/use-follow';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    className?: string;
}

export default function FollowButton({
                                         targetUserId,
                                         initialIsFollowing,
                                         className
                                     }: FollowButtonProps) {

    // Use our custom hook
    const { isFollowing, mutate } = useFollow(targetUserId, initialIsFollowing);

    return (
        <Button
            onClick={(e) => {
                e.preventDefault(); // Prevent navigation if inside a link
                mutate();
            }}
            // Visual Styles based on status
            variant={isFollowing ? "secondary" : "default"}
            size="sm"
            className={cn(
                "transition-all duration-200 min-w-[100px]",
                isFollowing
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    : "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200",
                className
            )}
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