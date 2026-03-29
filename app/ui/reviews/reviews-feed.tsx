'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Archive, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './review-card';
import {Review} from "@/lib/definitions";
import { cn } from '@/lib/utils';

interface ReviewsFeedProps {
    username: string;
    isOwnProfile: boolean;
    initialReviews: any[];
    highlightId?: string;
}

export function ReviewsFeed({ username, isOwnProfile, initialReviews, highlightId }: ReviewsFeedProps) {
    const [entries, setEntries] = useState(initialReviews);
    const [visibleCount, setVisibleCount] = useState(10);
    const highlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (highlightId && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 400);
        }
    }, [highlightId]);

    const visibleEntries = entries.slice(0, visibleCount);
    const hasMore = visibleCount < entries.length;

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 10, entries.length));
    };

    const handleDelete = (id: string) => {
        setEntries((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- HEADER: The "Reviews (Count) --- + " Section --- */}
            <div className="flex items-center justify-between mb-8 pb-4">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Review {entries.length > 0 && `(${entries.length})`}
                    </h2>
                </div>

                {isOwnProfile && (
                    <Link href={`/profile/reviews/create`}>
                        <Button size="sm" className="rounded-full gap-2 font-bold">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Log Entry</span>
                        </Button>
                    </Link>
                )}
            </div>

            {/* --- THE LIST --- */}
            {entries.length > 0 ? (
                <div className="space-y-3">
                    {visibleEntries.map((review) => (
                        <div
                            key={review.id}
                            id={`review-${review.id}`}
                            ref={review.id === highlightId ? highlightRef : null}
                            className={cn(
                                'rounded-xl transition-all duration-700',
                                review.id === highlightId && 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950'
                            )}
                        >
                            <ReviewCard
                                review={review}
                                isOwnProfile={isOwnProfile}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center pt-8">
                            <Button
                                variant="outline"
                                onClick={loadMore}
                                className="gap-2 font-mono text-xs uppercase tracking-widest"
                            >
                                Show More
                                <span className="text-muted-foreground">
                                    [{entries.length - visibleCount}]
                                </span>
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                /* --- EMPTY STATE --- */
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/30">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Archive className="w-8 h-8 text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-base font-bold">No reviews yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                        {isOwnProfile
                            ? "You haven't logged any films or shows yet."
                            : `@${username} hasn't posted any reviews yet.`}
                    </p>
                    {isOwnProfile && (
                        <Link href={`/profile/reviews/create`} className="mt-6">
                            <Button variant="link">Log your first film &rarr;</Button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}