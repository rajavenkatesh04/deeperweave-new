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

type LabelColor = 'red' | 'violet' | 'blue' | 'emerald' | 'amber' | 'orange' | 'rose';

interface AdultRowProps {
    title: string;
    subtitle?: string;
    label?: string;
    labelColor?: LabelColor;
    items: DiscoverItem[];
    id?: string;
}

const labelStyles: Record<LabelColor, string> = {
    red: 'text-red-400 bg-red-500/10 border-red-500/25',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
};

export function AdultRow({ title, subtitle, label, labelColor = 'red', items, id }: AdultRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    if (!items || items.length === 0) return null;

    return (
        <section className="space-y-3" id={id}>
            <div className="flex items-end justify-between px-6 md:px-14">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        {label && (
                            <span className={cn(
                                'text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm border',
                                labelStyles[labelColor]
                            )}>
                                {label}
                            </span>
                        )}
                        <h2 className="text-base md:text-lg font-semibold text-white">{title}</h2>
                    </div>
                    {subtitle && (
                        <p className="text-[11px] text-zinc-600">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="relative group/row">
                {/* Edge fades */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

                {/* Scroll buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute left-3 top-[45%] -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-zinc-900/90 border border-zinc-700 text-white shadow-xl opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-zinc-800"
                    aria-label="Scroll left"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute right-3 top-[45%] -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full bg-zinc-900/90 border border-zinc-700 text-white shadow-xl opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-zinc-800"
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
                        const itemLabel = item.title || item.name || '';
                        const date = item.release_date || item.first_air_date || '';
                        const year = date.split('-')[0];
                        const topGenre = item.genre_ids?.[0] ? GENRE_MAP[item.genre_ids[0]] : null;

                        return (
                            <Link
                                key={item.id}
                                href={`/discover/${item.media_type}/${item.id}`}
                                className="snap-start shrink-0 w-[130px] md:w-[150px] group/card"
                            >
                                <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden bg-zinc-900 border border-zinc-800/50 group-hover/card:border-red-500/30 group-hover/card:shadow-lg group-hover/card:shadow-red-950/40 transition-all duration-300 mb-2.5">
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                            alt={itemLabel}
                                            fill
                                            className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                            {isMovie ? <FilmIcon className="w-8 h-8" /> : <TvIcon className="w-8 h-8" />}
                                        </div>
                                    )}

                                    {/* Rating */}
                                    {item.vote_average > 0 && (
                                        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                                            <StarIcon className="w-2.5 h-2.5 text-red-400" />
                                            <span className="text-[10px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Language */}
                                    {item.original_language && (
                                        <div className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                                            <span className="text-[9px] font-bold text-white/80">
                                                {getLanguageName(item.original_language)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs font-semibold text-zinc-300 line-clamp-1 group-hover/card:text-white transition-colors">
                                    {itemLabel}
                                </p>
                                <p className="text-[11px] text-zinc-600 mt-0.5">
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