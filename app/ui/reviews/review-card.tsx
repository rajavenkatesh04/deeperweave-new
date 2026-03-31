'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Ticket, Tv, Star } from 'lucide-react';
import Image from 'next/image';

import { Review } from '@/lib/definitions';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ReviewDrawer } from './review-drawer';

// Same star path used in create-review-form
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function StarDisplay({ value, size = 12 }: { value: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
                const fillPercent =
                    value >= star ? '100%' : value >= star - 0.5 ? '50%' : '0%';
                return (
                    <div key={star} className="relative shrink-0" style={{ width: size, height: size }}>
                        <svg viewBox="0 0 24 24" className="absolute inset-0 fill-current text-zinc-200 dark:text-zinc-700" style={{ width: size, height: size }}>
                            <path d={STAR_PATH} />
                        </svg>
                        <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: fillPercent }}>
                            <svg viewBox="0 0 24 24" className="fill-current text-zinc-800 dark:text-zinc-200 shrink-0" style={{ width: size, height: size }}>
                                <path d={STAR_PATH} />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export interface ReviewCardProps {
    review: Review & {
        movie: { title: string; poster_path: string | null; release_date: string | null } | null;
        tv: { name: string; poster_path: string | null; first_air_date: string | null } | null;
    };
    isOwnProfile: boolean;
    onDelete?: (id: string) => void;
}

export function ReviewCard({ review, isOwnProfile, onDelete }: ReviewCardProps) {
    const [open, setOpen] = useState(false);

    const isMovie = !!review.movie;
    const title = isMovie ? review.movie?.title : review.tv?.name;
    const posterPath = isMovie ? review.movie?.poster_path : review.tv?.poster_path;
    const releaseDate = isMovie ? review.movie?.release_date : review.tv?.first_air_date;
    const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';

    const watchedDate = new Date(review.watched_on);
    const day = format(watchedDate, 'd');
    const monthShort = format(watchedDate, 'MMM');

    const rating = Number(review.rating || 0);

    const handleDelete = (id: string) => {
        setOpen(false);
        onDelete?.(id);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <button
                onClick={() => setOpen(true)}
                id={`entry-${review.id}`}
                className="group w-full flex items-center gap-4 px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all duration-150 text-left"
            >
                {/* Date column */}
                <div className="w-9 shrink-0 text-right select-none">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 leading-none mb-0.5">
                        {monthShort}
                    </p>
                    <p className="text-[22px] font-black text-zinc-800 dark:text-zinc-200 leading-none tabular-nums">
                        {day}
                    </p>
                </div>

                {/* Poster */}
                <div
                    className="relative shrink-0 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm"
                    style={{ width: 44, height: 66 }}
                >
                    {posterPath ? (
                        <Image
                            src={`https://image.tmdb.org/t/p/w185${posterPath}`}
                            alt={title || ''}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="44px"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            {isMovie ? <Ticket className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                        </div>
                    )}
                </div>

                {/* Title + year */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate leading-snug">
                        {title}
                    </p>
                    {releaseYear && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {releaseYear}
                        </p>
                    )}
                </div>

                {/* Rating — far right */}
                {rating > 0 && (
                    <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-zinc-400 dark:text-zinc-600 fill-zinc-400 dark:fill-zinc-600" />
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                            {rating % 1 === 0 ? rating.toString() : rating.toFixed(1)}
                        </span>
                    </div>
                )}
            </button>

            <SheetContent className="sm:max-w-md w-full p-0 gap-0 flex flex-col" showCloseButton={false}>
                <ReviewDrawer
                    review={review}
                    isOwnProfile={isOwnProfile}
                    onDelete={handleDelete}
                />
            </SheetContent>
        </Sheet>
    );
}

export function ReviewCardSkeleton() {
    return (
        <div className="w-full flex items-center gap-4 px-4 py-3 bg-white dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 rounded-lg animate-pulse">
            {/* Date */}
            <div className="w-9 shrink-0 text-right space-y-1">
                <div className="h-2 w-6 bg-zinc-200 dark:bg-zinc-700 rounded ml-auto" />
                <div className="h-5 w-7 bg-zinc-200 dark:bg-zinc-700 rounded ml-auto" />
            </div>
            {/* Poster */}
            <div className="shrink-0 rounded bg-zinc-200 dark:bg-zinc-700" style={{ width: 44, height: 66 }} />
            {/* Title + year + stars */}
            <div className="flex-1 space-y-2 min-w-0">
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
            </div>
        </div>
    );
}

export { StarDisplay, STAR_PATH };
