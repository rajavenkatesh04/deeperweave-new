'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Plus, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard, ReviewCardSkeleton } from './review-card';
import { cn } from '@/lib/utils';

interface ReviewsFeedProps {
    username: string;
    isOwnProfile: boolean;
    initialReviews: any[];
    highlightId?: string;
}

interface YearGroup {
    year: string;
    months: { month: string; reviews: any[] }[];
}

function groupByYearMonth(reviews: any[]): YearGroup[] {
    const result: YearGroup[] = [];
    for (const review of reviews) {
        const date = new Date(review.watched_on);
        const year = format(date, 'yyyy');
        const month = format(date, 'MMMM');

        let yg = result.find(g => g.year === year);
        if (!yg) { yg = { year, months: [] }; result.push(yg); }

        let mg = yg.months.find(m => m.month === month);
        if (!mg) { mg = { month, reviews: [] }; yg.months.push(mg); }

        mg.reviews.push(review);
    }
    return result;
}

const INITIAL_COUNT = 5;
const LOAD_MORE = 5;
const LOAD_DELAY = 350;

export function ReviewsFeed({ username, isOwnProfile, initialReviews, highlightId }: ReviewsFeedProps) {
    const [entries, setEntries] = useState(() =>
        [...initialReviews].sort(
            (a, b) => new Date(b.watched_on).getTime() - new Date(a.watched_on).getTime()
        )
    );
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const highlightRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    const visibleEntries = entries.slice(0, visibleCount);
    const hasMore = visibleCount < entries.length;
    const grouped = groupByYearMonth(visibleEntries);

    useEffect(() => {
        if (highlightId && highlightRef.current) {
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 400);
        }
    }, [highlightId]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loadingRef.current) {
                    loadingRef.current = true;
                    setIsLoadingMore(true);
                    setTimeout(() => {
                        setVisibleCount(prev => prev + LOAD_MORE);
                        setIsLoadingMore(false);
                        loadingRef.current = false;
                    }, LOAD_DELAY);
                }
            },
            { rootMargin: '150px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, visibleCount]);

    const handleDelete = (id: string) => setEntries(prev => prev.filter(r => r.id !== id));

    if (entries.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Reviews</h2>
                    {isOwnProfile && (
                        <Link href="/profile/reviews/create">
                            <Button size="sm" className="rounded-full gap-2 font-bold">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Log Entry</span>
                            </Button>
                        </Link>
                    )}
                </div>
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/30">
                    <div className="w-16 h-16 bg-background border shadow-sm rounded-full flex items-center justify-center mb-4">
                        <Archive className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">No entries found</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
                        {isOwnProfile
                            ? 'Your timeline is empty. Start logging what you watch.'
                            : `@${username} hasn't logged any reviews yet.`}
                    </p>
                    {isOwnProfile && (
                        <Link href="/profile/reviews/create" className="mt-6">
                            <Button variant="default" className="rounded-full shadow-sm">Log your first film</Button>
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Reviews
                    <span className="ml-2 text-sm font-normal text-zinc-400">({entries.length})</span>
                </h2>
                {isOwnProfile && (
                    <Link href="/profile/reviews/create">
                        <Button size="sm" className="rounded-full gap-2 font-bold">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Log Entry</span>
                        </Button>
                    </Link>
                )}
            </div>

            {/* Grouped list */}
            <div className="space-y-10">
                {grouped.map(({ year, months }, yi) => (
                    <div key={year}>
                        {/* Year — acts as a section anchor */}
                        <div className={cn('flex items-center gap-4 mb-6', yi > 0 && 'pt-2')}>
                            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums leading-none">
                                {year}
                            </span>
                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                        </div>

                        <div className="space-y-5">
                            {months.map(({ month, reviews }) => (
                                <div key={month}>
                                    {/* Month label */}
                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500 mb-2 pl-1">
                                        {month}
                                    </p>

                                    {/* Cards */}
                                    <div className="space-y-1">
                                        {reviews.map(review => (
                                            <div
                                                key={review.id}
                                                id={`review-${review.id}`}
                                                ref={review.id === highlightId ? highlightRef : null}
                                                className={cn(
                                                    review.id === highlightId &&
                                                        'ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg'
                                                )}
                                            >
                                                <ReviewCard
                                                    review={review}
                                                    isOwnProfile={isOwnProfile}
                                                    onDelete={handleDelete}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Scroll sentinel */}
            {hasMore && <div ref={sentinelRef} className="h-px mt-4" />}

            {/* Loading skeletons */}
            {isLoadingMore && (
                <div className="space-y-1 mt-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <ReviewCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* End of list */}
            {!hasMore && entries.length > INITIAL_COUNT && (
                <p className="text-center text-xs text-zinc-300 dark:text-zinc-700 tracking-widest mt-8">
                    · · ·
                </p>
            )}
        </div>
    );
}
