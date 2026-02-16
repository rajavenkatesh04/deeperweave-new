'use client';

import Image from 'next/image';
import Link from 'next/link';
// 1. Import new types
import { TV, Provider, Keyword } from '@/lib/types/tmdb';
import { Badge } from '@/components/ui/badge';
import { TvIcon, StarIcon, BuildingOffice2Icon, GlobeAltIcon, PlusIcon, TagIcon } from '@heroicons/react/24/solid';
import {
    BackdropGallery,
    TrailerButton,
    ShareButton,
    BackButton,
    CastCrewSwitcher,
    MediaScrollList
} from './media-interactive';
import SaveButton from '@/app/ui/save/SaveButton';

// 2. Define Interface
interface TVHeroProps {
    media: TV;
    certification?: string; // New
    providers?: Provider[]; // New
    keywords?: Keyword[];   // New
}

export function TVHero({ media, certification, providers = [], keywords = [] }: TVHeroProps) {
    const title = media.name;
    const showOriginalTitle = media.original_language !== 'en' && media.original_name !== title;
    const releaseYear = media.first_air_date?.split('-')[0] || 'N/A';

    const creator = media.created_by?.map(c => c.name).join(', ') || 'N/A';
    const statusColor = media.status === 'Ended' || media.status === 'Canceled' ? 'secondary' : 'default';

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-20">
            {/* STICKY HEADER */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 sticky top-0 z-50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <BackButton />
                    <div className="flex items-center gap-3">
                        <SaveButton itemType="tv" itemId={media.id} className="bg-zinc-100 dark:bg-zinc-900 p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800" />
                        <ShareButton />
                    </div>
                </div>
            </header>

            {/* BACKDROP */}
            <div className="relative w-full h-[60vh] lg:h-[75vh]">
                <BackdropGallery images={media.images?.backdrops || []} fallbackPath={media.backdrop_path} />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 -mt-32 md:-mt-48 lg:-mt-64">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">

                    {/* LEFT COL: Poster & Streaming */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative aspect-[2/3] w-full max-w-md mx-auto overflow-hidden bg-zinc-200 dark:bg-zinc-900 shadow-2xl group border-4 border-white dark:border-zinc-800 rounded-lg">
                            {media.poster_path ? (
                                <Image src={`https://image.tmdb.org/t/p/w780${media.poster_path}`} alt={title} fill className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-105" priority unoptimized />
                            ) : <div className="flex items-center justify-center w-full h-full"><TvIcon className="w-16 h-16 text-zinc-400" /></div>}
                        </div>

                        {/* ✨ NEW: Streaming Providers */}
                        {providers.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-md mx-auto lg:mx-0">
                                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Streaming On</p>
                                <div className="flex flex-wrap gap-3">
                                    {providers.map((p) => (
                                        <div key={p.provider_id} className="relative w-10 h-10 rounded-lg overflow-hidden border border-zinc-100 dark:border-zinc-800" title={p.provider_name}>
                                            <Image src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} fill className="object-cover" unoptimized />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COL: Info */}
                    <div className="lg:col-span-3 space-y-8 lg:mt-64">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                {/* ✨ NEW: Certification Badge */}
                                {certification && (
                                    <span className="px-2 py-1 border border-zinc-400 dark:border-zinc-600 text-xs font-bold rounded text-zinc-700 dark:text-zinc-300">
                                        {certification}
                                    </span>
                                )}
                                {media.status && <Badge variant={statusColor} className="rounded-sm uppercase text-[10px] tracking-wider">{media.status}</Badge>}
                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-none rounded-sm uppercase text-[10px] tracking-wider">TV Series</Badge>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight">{title}</h1>
                            {media.tagline && <p className="text-lg text-zinc-500 dark:text-zinc-400 font-light italic">&quot;{media.tagline}&quot;</p>}
                            {showOriginalTitle && <p className="text-sm text-zinc-500 font-mono">Original: {media.original_name}</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{releaseYear}</span>
                            <span>·</span><span>{media.number_of_seasons} Seasons</span>
                            <span>·</span><span>{media.number_of_episodes} Episodes</span>
                            {media.vote_average && media.vote_average > 0 && <><span>·</span><span className="inline-flex items-center gap-1.5 font-medium text-amber-500"><StarIcon className="w-4 h-4" />{media.vote_average.toFixed(1)}</span></>}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <TrailerButton videos={media.videos?.results || []} />
                            <Link href={`/log/create?id=${media.id}&type=tv`} className="px-6 py-2.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all font-medium rounded-full flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Log Entry</Link>
                        </div>

                        <div className="space-y-4 py-4">
                            <div>
                                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-2">Overview</h3>
                                <p className="text-lg text-zinc-800 dark:text-zinc-200 leading-relaxed font-light">{media.overview || "No overview available."}</p>
                            </div>

                            {/* ✨ NEW: Keywords */}
                            {keywords.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {keywords.slice(0, 8).map((k) => (
                                        <Link key={k.id} href={`/search?query=${k.name}`} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-[10px] text-zinc-500 dark:text-zinc-400 rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1">
                                            <TagIcon className="w-3 h-3 opacity-50" />
                                            {k.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TV SPECIFIC DATA GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-zinc-200 dark:border-zinc-800">
                            <div className="col-span-1"><p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Creator</p><p className="font-semibold text-sm">{creator}</p></div>
                            <div className="col-span-1"><p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><GlobeAltIcon className="w-3 h-3"/> Origin</p><p className="font-medium text-sm">{media.origin_country?.join(', ') || 'N/A'}</p></div>

                            <div className="col-span-1 md:col-span-2">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 flex items-center gap-1"><TvIcon className="w-3 h-3"/> Networks</p>
                                <div className="flex flex-wrap gap-2">
                                    {media.networks?.slice(0, 3).map(n => (
                                        <div key={n.name} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                            {n.logo_path && <Image src={`https://image.tmdb.org/t/p/w200${n.logo_path}`} alt={n.name} width={20} height={20} className="object-contain" />}
                                            <span className="text-xs font-medium">{n.name}</span>
                                        </div>
                                    )) || <span className="text-sm text-zinc-500">N/A</span>}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1"><BuildingOffice2Icon className="w-3 h-3"/> Production</p>
                            <div className="flex flex-wrap items-center gap-4">{media.production_companies?.slice(0, 4).map((c) => (<div key={c.id} className="flex items-center gap-2 opacity-70" title={c.name}>{c.logo_path ? <Image src={`https://image.tmdb.org/t/p/w200${c.logo_path}`} alt={c.name} width={60} height={30} className="object-contain dark:invert" /> : <span className="text-xs font-medium text-zinc-500">{c.name}</span>}</div>)) || <span className="text-sm text-zinc-500">N/A</span>}</div>
                        </div>
                    </div>
                </div>

                <div className="mb-24">
                    <CastCrewSwitcher
                        cast={media.credits?.cast || []}
                        crew={media.credits?.crew || []}
                    />
                </div>

                {media.recommendations?.results && media.recommendations.results.length > 0 && (
                    <div className="mt-12 pb-12">
                        <MediaScrollList title="More Like This" items={media.recommendations.results} href="/discover" />
                    </div>
                )}
            </main>
        </div>
    );
}