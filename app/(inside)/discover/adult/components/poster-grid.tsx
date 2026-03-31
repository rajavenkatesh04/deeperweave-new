'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, FilmIcon } from '@heroicons/react/24/solid';
import type { DiscoverItem } from '@/lib/types/tmdb';

const langNames = new Intl.DisplayNames(['en'], { type: 'language' });
function getLang(code: string) {
    try { return langNames.of(code) ?? code.toUpperCase(); }
    catch { return code.toUpperCase(); }
}

interface PosterGridProps {
    title: string;
    subtitle?: string;
    items: DiscoverItem[];
}

export function PosterGrid({ title, subtitle, items }: PosterGridProps) {
    if (!items.length) return null;

    return (
        <section className="px-4 md:px-14">
            <div className="mb-5">
                <h2 className="text-base font-bold text-white">{title}</h2>
                {subtitle && <p className="text-[11px] text-zinc-600 mt-0.5">{subtitle}</p>}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
                {items.map((item, idx) => {
                    const title = item.title || item.name || '';
                    const year = (item.release_date || item.first_air_date || '').split('-')[0];
                    const lang = item.original_language ? getLang(item.original_language) : null;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25, delay: idx * 0.02, ease: 'easeOut' }}
                        >
                            <Link href={`/discover/${item.media_type}/${item.id}`} className="group block">
                                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-red-500/40 transition-all duration-300 shadow-sm group-hover:shadow-red-950/40 group-hover:shadow-lg">
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                            alt={title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FilmIcon className="w-7 h-7 text-zinc-700" />
                                        </div>
                                    )}

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Rating */}
                                    {item.vote_average > 0 && (
                                        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
                                            <StarIcon className="w-2.5 h-2.5 text-red-400" />
                                            <span className="text-[9px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                                        </div>
                                    )}

                                    {/* Language */}
                                    {lang && (
                                        <div className="absolute bottom-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] font-bold text-white/70 bg-black/60 px-1 py-0.5 rounded">
                                                {lang}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Title below */}
                                <p className="mt-1.5 text-[11px] font-medium text-zinc-400 group-hover:text-white transition-colors line-clamp-1">
                                    {title}
                                </p>
                                {year && (
                                    <p className="text-[10px] text-zinc-700">{year}</p>
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
