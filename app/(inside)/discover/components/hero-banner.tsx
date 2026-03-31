'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import type { DiscoverItem } from '@/lib/types/tmdb';
import { GENRE_MAP } from '@/lib/tmdb/genres';

interface HeroBannerProps {
    items: DiscoverItem[];
}

export function HeroBanner({ items }: HeroBannerProps) {
    const [curr, setCurr] = useState(0);
    const [prev, setPrev] = useState<number | null>(null);
    const [paused, setPaused] = useState(false);

    const goTo = useCallback((next: number) => {
        setPrev(curr);
        setCurr(next);
    }, [curr]);

    // Auto-advance every 7 seconds
    useEffect(() => {
        if (paused || items.length <= 1) return;
        const t = setTimeout(() => goTo((curr + 1) % items.length), 7000);
        return () => clearTimeout(t);
    }, [curr, paused, items.length, goTo]);

    if (!items.length) return null;

    const item = items[curr];
    const prevItem = prev !== null ? items[prev] : null;
    const title = item.title || item.name || '';
    const year = (item.release_date || item.first_air_date || '').split('-')[0];
    const genres = (item.genre_ids || []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);

    return (
        <div
            className="relative h-[62vh] md:h-[72vh] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 group"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* ── BACKDROP LAYER ── */}
            {/* Previous image: static, sits behind for crossfade */}
            {prevItem?.backdrop_path && (
                <Image
                    key={`prev-${prev}`}
                    src={`https://image.tmdb.org/t/p/original${prevItem.backdrop_path}`}
                    alt=""
                    fill
                    className="object-cover object-center"
                    unoptimized
                    aria-hidden
                />
            )}
            {/* Current image: fades in over previous */}
            {item.backdrop_path ? (
                <motion.div
                    key={`curr-${curr}`}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                        alt={title}
                        fill
                        className="object-cover object-center scale-[1.02]"
                        priority
                        unoptimized
                    />
                </motion.div>
            ) : (
                <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-900" />
            )}

            {/* ── GRADIENT OVERLAYS ──
                Kept intentionally dark in both modes — text is white and needs
                a dark backdrop to stay legible over any image. Bottom gradient
                fades to the page background (white in light, zinc-950 in dark). */}
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

            {/* ── TEXT CONTENT ── */}
            <div className="absolute inset-0 flex items-end px-4 md:px-12 pb-10 md:pb-8 pointer-events-none">
                <div className="max-w-[560px] space-y-2.5 pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={curr}
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="space-y-2.5"
                        >
                            {/* Genre tags */}
                            {genres.length > 0 && (
                                <div className="flex items-center gap-2.5">
                                    {genres.map((g, i) => (
                                        <span key={g} className="flex items-center gap-2.5">
                                            {i > 0 && <span className="w-0.5 h-0.5 rounded-full bg-white/35 inline-block" />}
                                            <span className="text-[11px] uppercase tracking-widest text-white/50 font-semibold">{g}</span>
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Title — clicking navigates to detail page */}
                            <Link href={`/discover/${item.media_type}/${item.id}`}>
                                <h1 className="text-3xl md:text-5xl lg:text-[3.5rem] font-light tracking-tight text-white leading-[1.07] drop-shadow-md hover:text-white/80 transition-colors cursor-pointer">
                                    {title}
                                </h1>
                            </Link>

                            {/* Meta row */}
                            <div className="flex items-center gap-2 text-sm text-white/50">
                                {year && <span className="font-semibold text-white/80">{year}</span>}
                                {item.vote_average > 0 && (
                                    <>
                                        <span>·</span>
                                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                                            <StarIcon className="w-3.5 h-3.5" />
                                            {item.vote_average.toFixed(1)}
                                        </span>
                                    </>
                                )}
                                {item.original_language && item.original_language !== 'en' && (
                                    <>
                                        <span>·</span>
                                        <span className="uppercase text-[10px] tracking-wider bg-white/10 border border-white/15 px-2 py-0.5 rounded font-semibold text-white/70">
                                            {item.original_language}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Overview */}
                            {item.overview && (
                                <p className="text-sm text-white/60 line-clamp-2 leading-relaxed max-w-lg drop-shadow-sm">
                                    {item.overview}
                                </p>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── PROGRESS DOTS ── */}
            {items.length > 1 && (
                <div className="absolute bottom-8 right-6 md:right-14 flex items-center gap-1.5 z-20">
                    {items.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            className={cn(
                                'h-[3px] rounded-full transition-all duration-500',
                                i === curr ? 'w-7 bg-white' : 'w-3.5 bg-white/25 hover:bg-white/50'
                            )}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* ── NAV ARROWS (appear on hover) ── */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={() => goTo((curr - 1 + items.length) % items.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/35 border border-white/10 text-white/55 hover:text-white hover:bg-black/65 hover:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                        aria-label="Previous"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => goTo((curr + 1) % items.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/35 border border-white/10 text-white/55 hover:text-white hover:bg-black/65 hover:border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                        aria-label="Next"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </>
            )}
        </div>
    );
}