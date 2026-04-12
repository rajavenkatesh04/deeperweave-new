'use client';

import { Heart } from 'lucide-react';
import { useLike } from '@/lib/hooks/use-like';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
    reviewId:     string;
    initialLiked: boolean;
    initialCount: number;
    className?:   string;
}

export function LikeButton({ reviewId, initialLiked, initialCount, className }: LikeButtonProps) {
    const { liked, count, isPending, toggle } = useLike(reviewId, initialLiked, initialCount);

    return (
        <button
            onClick={toggle}
            disabled={isPending}
            aria-label={liked ? 'Unlike review' : 'Like review'}
            className={cn(
                'flex items-center gap-1.5 text-sm transition-colors',
                liked
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-zinc-400 hover:text-red-500',
                isPending && 'opacity-50 cursor-not-allowed',
                className
            )}
        >
            <Heart
                className={cn('w-4 h-4 transition-all', liked && 'fill-current')}
            />
            <span className="tabular-nums">{count}</span>
        </button>
    );
}
