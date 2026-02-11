'use client';

import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSaved } from '@/lib/hooks/use-saved';
import { Loader2 } from 'lucide-react';
import {Spinner} from "@/components/ui/spinner";

interface Props {
    itemType: 'movie' | 'tv' | 'person';
    itemId: number;
    className?: string;
    iconSize?: string;
}

export default function SaveButton({ itemType, itemId, className, iconSize = "w-5 h-5" }: Props) {
    const { isSaved, isLoading, toggle } = useSaved(itemType, itemId);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => toggle()}
            disabled={isLoading}
            className={cn("rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors", className)}
            title={isSaved ? "Remove from Saved" : "Save for later"}
        >
            {isLoading ? (
                <Spinner />
            ) : isSaved ? (
                <BookmarkSolid className={cn("text-primary animate-in zoom-in duration-200", iconSize)} />
            ) : (
                <BookmarkIcon className={cn("text-zinc-500", iconSize)} />
            )}
        </Button>
    );
}