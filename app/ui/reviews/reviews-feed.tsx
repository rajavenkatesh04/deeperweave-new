'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Archive, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
// You will create this card component separately to keep things clean
import { ReviewCard } from './review-card';

interface ReviewsFeedProps {
    username: string;
    isOwnProfile: boolean;
    initialReviews: any[]; // Replace 'any' with your Review type from definitions
}

export function ReviewsFeed({ username, isOwnProfile, initialReviews }: ReviewsFeedProps) {
    const [entries, setEntries] = useState(initialReviews);
    const [visibleCount, setVisibleCount] = useState(10);

    const visibleEntries = entries.slice(0, visibleCount);
    const hasMore = visibleCount < entries.length;

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 10, entries.length));
    };

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* --- HEADER: The "Reviews (Count) --- + " Section --- */}
            <div className="flex items-center justify-between mb-8 pb-4">
                <div className="flex items-baseline gap-3">
                    <h2 className="text-2xl font-bold tracking-tight">Reviews</h2>
                    <span className="text-lg text-muted-foreground font-mono">
                        ({entries.length})
                    </span>
                </div>

                {isOwnProfile && (
                    <Link href={`/profile/${username}/reviews/create`}>
                        <Button size="sm" className="rounded-full gap-2 font-bold">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Log Entry</span>
                        </Button>
                    </Link>
                )}
            </div>

            {/* --- THE LIST --- */}
            {entries.length > 0 ? (
                <div className="space-y-6">
                    {visibleEntries.map((review, index) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            isOwnProfile={isOwnProfile}
                        />
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
                        <Link href={`/profile/${username}/reviews/create`} className="mt-6">
                            <Button variant="link">Log your first film &rarr;</Button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}