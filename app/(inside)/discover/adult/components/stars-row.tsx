'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/solid';
import type { TrendingPerson } from '@/lib/tmdb/client';

export function StarsRow({ people }: { people: TrendingPerson[] }) {
    if (!people.length) return null;

    return (
        <section className="px-4 md:px-14">
            <div className="mb-5">
                <h2 className="text-base font-bold text-white">Trending Stars</h2>
                <p className="text-[11px] text-zinc-600 mt-0.5">Popular right now</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {people.map((person, idx) => (
                    <motion.div
                        key={person.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.04, ease: 'easeOut' }}
                        className="shrink-0"
                    >
                        <Link href={`/discover/person/${person.id}`} className="group flex flex-col items-center gap-2 w-[90px]">
                            {/* Profile photo */}
                            <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 group-hover:border-red-500/50 transition-all duration-300 shadow-lg">
                                {person.profile_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                        alt={person.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserIcon className="w-8 h-8 text-zinc-600" />
                                    </div>
                                )}
                                <div className="absolute inset-0 rounded-full ring-0 group-hover:ring-2 ring-red-500/40 transition-all duration-300" />
                            </div>

                            {/* Name */}
                            <p className="text-[11px] font-medium text-zinc-400 group-hover:text-white transition-colors text-center line-clamp-2 leading-tight">
                                {person.name}
                            </p>
                            {person.known_for_department && (
                                <p className="text-[10px] text-zinc-700 text-center -mt-1">
                                    {person.known_for_department}
                                </p>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
