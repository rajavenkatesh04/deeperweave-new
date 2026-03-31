'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, FilmIcon } from '@heroicons/react/24/solid';
import type { DiscoverItem } from '@/lib/types/tmdb';
import { GENRE_MAP } from '@/lib/tmdb/genres';

const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
function getLang(code: string) {
    try { return langNames.of(code) ?? code.toUpperCase(); }
    catch { return code.toUpperCase(); }
}

export function TheatreGrid({ items }: { items: DiscoverItem[] }) {
    if (!items.length) return null;

    return (
        <div className="px-4 md:px-14 pb-20">
            {/* Section label */}
            <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Live in Cinemas
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-600">{items.length} titles playing now</span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, idx) => {
                    const title = item.title || item.name || '';
                    const year = (item.release_date || item.first_air_date || '').split('-')[0];
                    const topGenres = (item.genre_ids ?? []).slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean);
                    const lang = item.original_language ? getLang(item.original_language) : null;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: idx * 0.03, ease: 'easeOut' }}
                        >
                            <Link href={`/discover/${item.media_type}/${item.id}`} className="group block">
                                {/* Backdrop card */}
                                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-xl transition-shadow duration-300">
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
                                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FilmIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                                        </div>
                                    )}

                                    {/* Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* "Now Playing" dot */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">Now Playing</span>
                                    </div>

                                    {/* Rating */}
                                    {item.vote_average > 0 && (
                                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                                            <StarIcon className="w-3 h-3 text-amber-400" />
                                            <span className="text-[11px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Bottom info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white font-semibold text-sm md:text-base leading-tight line-clamp-1 drop-shadow group-hover:text-amber-200 transition-colors">
                                            {title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {year && <span className="text-[11px] text-white/60 font-medium">{year}</span>}
                                            {topGenres.map((g, i) => (
                                                <span key={g} className="flex items-center gap-1.5 text-[10px] text-white/40">
                                                    {i === 0 && year && <span>·</span>}
                                                    {i > 0 && <span>·</span>}
                                                    {g}
                                                </span>
                                            ))}
                                            {lang && (
                                                <span className="ml-auto text-[10px] bg-white/10 border border-white/15 text-white/60 px-1.5 py-0.5 rounded font-medium">
                                                    {lang}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Small poster + overview row below card */}
                                <div className="flex gap-3 mt-3 px-1">
                                    {item.poster_path && (
                                        <div className="relative w-9 h-12 shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow">
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                unoptimized
                                                aria-hidden
                                            />
                                        </div>
                                    )}
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed line-clamp-3">
                                        {item.overview || 'No description available.'}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
