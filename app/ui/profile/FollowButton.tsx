'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, Check, Clock, UserMinus } from 'lucide-react';
import { useFollow } from '@/lib/hooks/use-follow';
import { RelationshipStatus } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
    targetUserId: string;
    initialStatus: RelationshipStatus;
    className?: string;
}

export default function FollowButton({ targetUserId, initialStatus, className }: FollowButtonProps) {
    const { status, isPending, follow, unfollow } = useFollow(targetUserId, initialStatus);

    // Hidden for self and blocked states
    if (status === 'self' || status === 'blocked_by_you' || status === 'blocked_by_them') {
        return null;
    }

    const config = {
        none: {
            label:   'Follow',
            icon:    <UserPlus className="w-4 h-4 mr-2" />,
            action:  follow,
            variant: 'default' as const,
            cls:     'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200',
        },
        pending: {
            label:   'Requested',
            icon:    <Clock className="w-4 h-4 mr-2" />,
            action:  unfollow, // clicking "Requested" cancels the request
            variant: 'secondary' as const,
            cls:     'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700',
        },
        accepted: {
            label:   'Following',
            icon:    <Check className="w-4 h-4 mr-2" />,
            action:  unfollow,
            variant: 'secondary' as const,
            cls:     'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600',
        },
    }[status] ?? {
        label:   'Follow',
        icon:    <UserPlus className="w-4 h-4 mr-2" />,
        action:  follow,
        variant: 'default' as const,
        cls:     'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200',
    };

    return (
        <Button
            onClick={(e) => {
                e.preventDefault();
                config.action();
            }}
            disabled={isPending}
            variant={config.variant}
            size="sm"
            className={cn('transition-all duration-200 min-w-[100px]', config.cls, className)}
        >
            {config.icon}
            {config.label}
        </Button>
    );
}
