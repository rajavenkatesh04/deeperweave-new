'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, CalendarIcon, FilmIcon } from '@heroicons/react/24/solid';
import type { DiscoverItem } from '@/lib/types/tmdb';
import { GENRE_MAP } from '@/lib/tmdb/genres';

const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
function getLang(code: string) {
    try { return langNames.of(code) ?? code.toUpperCase(); }
    catch { return code.toUpperCase(); }
}

function getDaysUntil(dateStr: string): number | null {
    if (!dateStr) return null;
    const release = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((release.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}

function formatReleaseDate(dateStr: string): string {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function groupByMonth(items: DiscoverItem[]): Map<string, DiscoverItem[]> {
    const map = new Map<string, DiscoverItem[]>();
    for (const item of items) {
        const date = item.release_date || item.first_air_date || '';
        if (!date) {
            const key = 'TBA';
            map.set(key, [...(map.get(key) ?? []), item]);
            continue;
        }
        const d = new Date(date);
        const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
}

function CountdownBadge({ dateStr }: { dateStr: string }) {
    const days = getDaysUntil(dateStr);
    if (days === null) return null;

    if (days <= 0) return (
        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-sm">
            Out Now
        </span>
    );
    if (days <= 7) return (
        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-sm animate-pulse">
            This Week · {days}d
        </span>
    );
    if (days <= 30) return (
        <span className="text-[10px] font-bold uppercase tracking-wide text-sky-400 bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 rounded-sm">
            {days} days
        </span>
    );
    return (
        <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 bg-zinc-400/10 border border-zinc-700 px-2 py-0.5 rounded-sm">
            {days}d away
        </span>
    );
}

export function TimelineGrid({ items }: { items: DiscoverItem[] }) {
    if (!items.length) return null;

    const sorted = [...items].sort((a, b) => {
        const da = a.release_date || a.first_air_date || '9999';
        const db = b.release_date || b.first_air_date || '9999';
        return da.localeCompare(db);
    });

    const grouped = groupByMonth(sorted);

    return (
        <div className="px-4 md:px-14 pb-20 space-y-14">
            {Array.from(grouped.entries()).map(([month, monthItems]) => (
                <div key={month}>
                    {/* Month header */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                {month}
                            </h2>
                        </div>
                        <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-600">{monthItems.length} title{monthItems.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-4">
                        {monthItems.map((item, idx) => {
                            const title = item.title || item.name || '';
                            const releaseDate = item.release_date || item.first_air_date || '';
                            const topGenres = (item.genre_ids ?? []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);
                            const lang = item.original_language ? getLang(item.original_language) : null;

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.04, ease: 'easeOut' }}
                                >
                                    <Link href={`/discover/${item.media_type}/${item.id}`} className="group flex gap-4 items-start">
                                        {/* Backdrop (wide) */}
                                        <div className="relative w-full max-w-[340px] aspect-video shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow group-hover:shadow-lg transition-shadow duration-300">
                                            {item.backdrop_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w780${item.backdrop_path}`}
                                                    alt={title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    unoptimized
                                                />
                                            ) : item.poster_path ? (
                                                <Image
                                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                                    alt={title}
                                                    fill
                                                    className="object-cover object-top"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FilmIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                                            {item.vote_average > 0 && (
                                                <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                                                    <StarIcon className="w-3 h-3 text-amber-400" />
                                                    <span className="text-[10px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Text info */}
                                        <div className="flex-1 py-1 min-w-0">
                                            <div className="flex items-start gap-2 flex-wrap mb-2">
                                                {releaseDate && <CountdownBadge dateStr={releaseDate} />}
                                                {lang && (
                                                    <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                                                        {lang}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-sm md:text-base font-semibold text-zinc-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-1.5">
                                                {title}
                                            </h3>

                                            {releaseDate && (
                                                <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mb-2 flex items-center gap-1">
                                                    <CalendarIcon className="w-3 h-3" />
                                                    {formatReleaseDate(releaseDate)}
                                                </p>
                                            )}

                                            {topGenres.length > 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                                                    {topGenres.map(g => (
                                                        <span key={g} className="text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-wide font-medium">
                                                            {g}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {item.overview && (
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-500 line-clamp-3 leading-relaxed hidden sm:block">
                                                    {item.overview}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
