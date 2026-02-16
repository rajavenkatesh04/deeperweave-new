'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ShareIcon, PlayIcon, CheckIcon,
    UserIcon, ArrowLeftIcon,
    XMarkIcon, ChevronLeftIcon, ChevronRightIcon,
    ArrowLongRightIcon, FilmIcon, TvIcon
} from '@heroicons/react/24/solid';
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Movie, TV, Video, CastMember, CrewMember } from '@/lib/types/tmdb';

/* --- 1. BACK BUTTON --- */
export function BackButton() {
    const router = useRouter();
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 gap-2 pl-0 hover:bg-transparent transition-colors"
        >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="font-medium">Back</span>
        </Button>
    );
}

/* --- 2. SHARE BUTTON --- */
export function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Button
            variant="secondary"
            size="icon"
            onClick={handleShare}
            className="rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-all"
        >
            {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ShareIcon className="w-4 h-4" />}
            <span className="sr-only">Share</span>
        </Button>
    );
}

/* --- 3. TRAILER BUTTON --- */
export function TrailerButton({ videos }: { videos: Video[] }) {
    const trailer = videos?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')
        || videos?.find((v) => v.site === 'YouTube' && v.type === 'Teaser');

    if (!trailer) {
        return (
            <Button disabled variant="outline" className="rounded-full opacity-50 cursor-not-allowed">
                No Trailer Available
            </Button>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-2 font-bold rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md hover:shadow-lg transition-all">
                    <PlayIcon className="w-4 h-4" /> Watch Trailer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl p-0 bg-black border-zinc-800 overflow-hidden">
                <DialogTitle className="sr-only">{trailer.name}</DialogTitle>
                <DialogDescription className="sr-only">YouTube video player</DialogDescription>
                <div className="aspect-video w-full">
                    <iframe
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                        allow="autoplay; encrypted-media; fullscreen"
                        className="w-full h-full"
                        title={trailer.name}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* --- 4. BACKDROP GALLERY (Reverted Style) --- */
export function BackdropGallery({ images, fallbackPath }: { images: { file_path: string, iso_639_1?: string | null }[], fallbackPath: string | null }) {
    const [index, setIndex] = useState(0);
    const backdrops = images?.filter((img) => !img.iso_639_1 || img.iso_639_1 === 'en').slice(0, 6) || [];
    const currentPath = backdrops.length > 0 ? backdrops[index].file_path : fallbackPath;

    useEffect(() => {
        if (backdrops.length <= 1) return;
        const interval = setInterval(() => setIndex((prev) => (prev + 1) % backdrops.length), 8000);
        return () => clearInterval(interval);
    }, [backdrops.length]);

    if (!currentPath) return <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-950" />;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div key={currentPath} className="relative w-full h-full animate-in fade-in duration-1000">
                <Image
                    src={`https://image.tmdb.org/t/p/original${currentPath}`}
                    alt="Backdrop"
                    fill
                    className="object-cover opacity-100 dark:opacity-40"
                    priority
                    unoptimized
                />
            </div>
            {/* Reverted Overlay Style */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-zinc-50 dark:to-zinc-950" />
        </div>
    );
}

/* --- 5. PORTRAIT GALLERY --- */
export function PortraitGallery({ images }: { images: { file_path: string }[] }) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const validImages = images?.slice(0, 12) || [];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (selectedIndex === null) return;
        if (e.key === 'ArrowRight') setSelectedIndex((prev) => (prev! + 1) % validImages.length);
        if (e.key === 'ArrowLeft') setSelectedIndex((prev) => (prev! - 1 + validImages.length) % validImages.length);
        if (e.key === 'Escape') setSelectedIndex(null);
    }, [selectedIndex, validImages.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    if (validImages.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg tracking-wider">Gallery</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {validImages.map((img, idx) => (
                    <button
                        key={img.file_path}
                        onClick={() => setSelectedIndex(idx)}
                        className="relative aspect-2/3 w-full overflow-hidden rounded-md  hover:ring-2  transition-all focus:outline-none"
                    >
                        <Image
                            src={`https://image.tmdb.org/t/p/w300${img.file_path}`}
                            alt={`Gallery Image ${idx + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-500"
                            unoptimized
                        />
                    </button>
                ))}
            </div>

            <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>

                <DialogContent className="max-w-[100vw] w-full h-screen p-0 backdrop-blur-xl border-none shadow-none flex flex-col justify-center items-center outline-none">
                    <DialogTitle className="sr-only">Image Viewer</DialogTitle>
                    <DialogDescription className="sr-only">Use arrow keys to navigate</DialogDescription>

                    <div className="relative w-full h-full flex items-center justify-center p-4">

                        {/* Prev Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i! - 1 + validImages.length) % validImages.length); }}
                            className="absolute left-4 md:left-8 z-50 p-3 rounded-full transition-colors bg-zinc-100/10 dark:bg-zinc-800/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:scale-110 active:scale-95"
                        >
                            <ChevronLeftIcon className="w-8 h-8 md:w-12 md:h-12" />
                        </button>

                        {/* Image */}
                        {selectedIndex !== null && (
                            <div className="relative w-full h-full max-h-[90vh] select-none">
                                <Image
                                    src={`https://image.tmdb.org/t/p/original${validImages[selectedIndex].file_path}`}
                                    alt="Full view"
                                    fill
                                    className="object-contain"
                                    priority
                                    unoptimized
                                />
                            </div>
                        )}

                        {/* Next Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setSelectedIndex((i) => (i! + 1) % validImages.length); }}
                            className="absolute right-4 md:right-8 z-50 p-3 rounded-full transition-colors bg-zinc-100/10 dark:bg-zinc-800/10 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:scale-110 active:scale-95"
                        >
                            <ChevronRightIcon className="w-8 h-8 md:w-12 md:h-12" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* --- 6. MEDIA SCROLL LIST --- */
export function MediaScrollList({ title, items, href }: { title: string; items: (Movie | TV)[]; href: string; }) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { clientWidth } = rowRef.current;
            const scrollAmount = direction === 'left' ? -(clientWidth * 0.75) : (clientWidth * 0.75);
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const uniqueItems = items?.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    ) || [];

    if (uniqueItems.length === 0) return null;

    return (
        <section className="w-full py-8 space-y-4">
            <div className="flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
                </div>
                <Link href={href} className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                    View All
                    <ArrowLongRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="relative group/row">
                {/* Scroll Buttons */}
                <button
                    onClick={() => scroll('left')}
                    className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 shadow-lg border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
                >
                    <ChevronLeftIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/90 dark:bg-black/90 shadow-lg border border-zinc-200 dark:border-zinc-800 opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
                >
                    <ChevronRightIcon className="w-5 h-5 text-zinc-900 dark:text-white" />
                </button>

                <div ref={rowRef} className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                    {uniqueItems.map((item) => {
                        const isMovie = item.media_type === 'movie' || 'title' in item;
                        const heading = isMovie ? (item as Movie).title : (item as TV).name;
                        const date = isMovie ? (item as Movie).release_date : (item as TV).first_air_date;

                        return (
                            <Link key={item.id} href={`/discover/${item.media_type || (isMovie ? 'movie' : 'tv')}/${item.id}`} className="snap-start shrink-0 w-35 md:w-40 flex flex-col gap-2 group/card">
                                <div className="aspect-2/3 relative rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    {item.poster_path ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                            alt={heading}
                                            fill
                                            className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2 p-2 text-center">
                                            {isMovie ? <FilmIcon className="w-8 h-8" /> : <TvIcon className="w-8 h-8" />}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100 group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors">
                                        {heading}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {date ? date.split('-')[0] : 'TBA'}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* --- 7. CAST & CREW SWITCHER (Reverted Cards + Logic Fixes) --- */
export function CastCrewSwitcher({ cast, crew }: { cast: CastMember[], crew: CrewMember[] }) {
    const directors = crew.filter(c => c.job === 'Director');
    const writers = crew.filter(c => ['Screenplay', 'Writer', 'Story', 'Teleplay'].includes(c.job));
    const producers = crew.filter(c => ['Producer', 'Executive Producer'].includes(c.job));

    // Reverted to your original "MVP" Vertical Card Style
    const PersonCard = ({ id, name, role, image }: { id: number, name: string, role: string, image: string | null }) => (
        <Link href={`/discover/person/${id}`} className="space-y-2 group cursor-pointer block">
            <div className="relative aspect-2/3 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 rounded-lg shadow-sm">
                {image ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w300${image}`}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                        <UserIcon className="w-8 h-8 opacity-20" />
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 text-zinc-900 dark:text-zinc-100">
                    {name}
                </p>
                <p className="text-xs text-zinc-500 line-clamp-1">
                    {role}
                </p>
            </div>
        </Link>
    );

    return (
        <Tabs defaultValue="cast" className="w-full">
            <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 h-auto">
                    <TabsTrigger
                        value="cast"
                        className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-sm"
                    >
                        Cast <span className="ml-1 opacity-60">({cast.length})</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="crew"
                        className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:shadow-sm"
                    >
                        Crew <span className="ml-1 opacity-60">({crew.length})</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="cast" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {cast.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                        {cast.slice(0, 18).map((actor) => (
                            <PersonCard
                                key={`${actor.id}-${actor.character}`}
                                id={actor.id}
                                name={actor.name}
                                role={actor.character}
                                image={actor.profile_path}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-10 text-center text-zinc-500">No cast information available.</div>
                )}
                {cast.length > 18 && (
                    <div className="mt-8 text-center">
                        <Button variant="outline" size="sm" className="text-xs">View Full Cast</Button>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="crew" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-12">

                    {directors.length > 0 && (
                        <div className="space-y-4">
                            {/* Uniform Badge Style */}
                            <Badge variant="outline" className="text-zinc-500 border-zinc-300 dark:border-zinc-700 uppercase tracking-widest text-[10px]">
                                Directing
                            </Badge>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                                {directors.map((p, i) => (
                                    <PersonCard key={`dir-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                ))}
                            </div>
                        </div>
                    )}

                    {writers.length > 0 && (
                        <div className="space-y-4">
                            <Badge variant="outline" className="text-zinc-500 border-zinc-300 dark:border-zinc-700 uppercase tracking-widest text-[10px]">
                                Writing
                            </Badge>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                                {writers.slice(0, 5).map((p, i) => (
                                    <PersonCard key={`write-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                ))}
                            </div>
                        </div>
                    )}

                    {producers.length > 0 && (
                        <div className="space-y-4">
                            <Badge variant="outline" className="text-zinc-500 border-zinc-300 dark:border-zinc-700 uppercase tracking-widest text-[10px]">
                                Production
                            </Badge>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
                                {producers.slice(0, 5).map((p, i) => (
                                    <PersonCard key={`prod-${i}`} id={p.id} name={p.name} role={p.job} image={p.profile_path} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
                {crew.length === 0 && (
                    <div className="py-10 text-center text-zinc-500">No crew information available.</div>
                )}
            </TabsContent>
        </Tabs>
    );
}