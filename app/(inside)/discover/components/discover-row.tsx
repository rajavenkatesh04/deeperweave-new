'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon, FilmIcon, TvIcon, StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';
import type { DiscoverItem } from '@/lib/types/tmdb';
import { GENRE_MAP } from '@/lib/tmdb/genres';

const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
function getLanguageName(code: string): string {
    try { return langNames.of(code) ?? code.toUpperCase(); }
    catch { return code.toUpperCase(); }
}

interface DiscoverRowProps {
    title: string;
    subtitle?: string;
    badge?: string;
    items: DiscoverItem[];
    viewAllHref?: string;
}

export function DiscoverRow({ title, subtitle, badge, items, viewAllHref }: DiscoverRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (!items || items.length === 0) return null;

    return (
        <section className="space-y-3">
            {/* Section header */}
            <div className="flex items-end justify-between px-6 md:px-14">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className="text-[10px] uppercase tracking-widest text-amber-500 dark:text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-sm">
                                {badge}
                            </span>
                        )}
                        <h2 className="text-base md:text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
                    </div>
                    {subtitle && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-600">{subtitle}</p>
                    )}
                </div>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-xs text-zinc-500 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                        View All
                        <ChevronRightIcon className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {/* Scroll row */}
            <div className="relative group/row">
                {/* Edge gradient fades — match page background per theme */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 pointer-events-none" />

                {/* Scroll nav buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-3 top-[45%] -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white shadow-xl opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-3 top-[45%] -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white shadow-xl opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    aria-label="Scroll right"
                >
                    <ChevronRightIcon className="w-4 h-4" />
                </button>

                {/* Cards */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-3 pb-3 snap-x snap-mandatory px-6 md:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {items.map(item => {
                        const isMovie = item.media_type === 'movie';
                        const label = item.title || item.name || '';
                        const date = item.release_date || item.first_air_date || '';
                        const year = date.split('-')[0];
                        const topGenre = item.genre_ids?.[0] ? GENRE_MAP[item.genre_ids[0]] : null;

                        return (
                            <Link
                                key={item.id}
                                href={`/discover/${item.media_type}/${item.id}`}
                                className="snap-start shrink-0 w-[130px] md:w-[150px] group/card"
                            >
                                {/* Poster */}
                                <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/50 shadow-sm group-hover/card:shadow-xl group-hover/card:border-zinc-300 dark:group-hover/card:border-zinc-700 transition-all duration-300 mb-2.5">
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                            alt={label}
                                            fill
                                            className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-700">
                                            {isMovie ? <FilmIcon className="w-8 h-8" /> : <TvIcon className="w-8 h-8" />}
                                        </div>
                                    )}

                                    {/* Rating badge — dark overlay works on any image */}
                                    {item.vote_average > 0 && (
                                        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                                            <StarIcon className="w-2.5 h-2.5 text-amber-400" />
                                            <span className="text-[10px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Language badge — all languages */}
                                    {item.original_language && (
                                        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                                            <span className="text-[9px] font-bold text-white/80">{getLanguageName(item.original_language)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Below poster */}
                                <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-1 group-hover/card:text-zinc-950 dark:group-hover/card:text-white transition-colors">
                                    {label}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-600 mt-0.5">
                                    {topGenre ? `${year} · ${topGenre}` : year || 'TBA'}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}