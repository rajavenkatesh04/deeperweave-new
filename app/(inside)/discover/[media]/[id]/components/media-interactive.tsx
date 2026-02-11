'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ShareIcon, PlayIcon, CheckIcon,
    UserIcon, WrenchIcon, ArrowLeftIcon,
    XMarkIcon, ChevronLeftIcon, ChevronRightIcon, Square2StackIcon, ArrowLongRightIcon
} from '@heroicons/react/24/solid';
import {
    Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/* --- 1. BACK BUTTON --- */
export function BackButton() {
    const router = useRouter();
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 gap-2 pl-0 hover:bg-transparent"
        >
            <ArrowLeftIcon className="w-4 h-4" /> Back
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
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
        >
            {copied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ShareIcon className="w-4 h-4" />}
        </Button>
    );
}

/* --- 3. TRAILER BUTTON --- */
export function TrailerButton({ videos }: { videos: any[] }) {
    const trailer = videos?.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));

    if (!trailer) return <Button disabled variant="secondary" className="rounded-full opacity-50">No Trailer</Button>;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-2 font-bold rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    <PlayIcon className="w-4 h-4" /> Watch Trailer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl p-0 bg-black border-zinc-800">
                <DialogTitle className="sr-only">Trailer</DialogTitle>
                <div className="aspect-video w-full">
                    <iframe src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`} allow="autoplay; encrypted-media; fullscreen" className="w-full h-full" />
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* --- 4. BACKDROP GALLERY --- */
export function BackdropGallery({ images, fallbackPath }: { images: any[], fallbackPath: string | null }) {
    const [index, setIndex] = useState(0);
    const backdrops = images?.filter((img: any) => !img.iso_639_1 || img.iso_639_1 === 'en').slice(0, 6) || [];
    const currentPath = backdrops.length > 0 ? backdrops[index].file_path : fallbackPath;

    useEffect(() => {
        if (backdrops.length <= 1) return;
        const interval = setInterval(() => setIndex((prev) => (prev + 1) % backdrops.length), 8000);
        return () => clearInterval(interval);
    }, [backdrops.length]);

    if (!currentPath) return <div className="absolute inset-0 bg-zinc-900" />;

    return (
        <div className="absolute inset-0 w-full h-full">
            <Image
                key={currentPath}
                src={`https://image.tmdb.org/t/p/original${currentPath}`}
                alt="Backdrop"
                fill
                className="object-cover opacity-100 dark:opacity-40 animate-in fade-in duration-1000"
                priority
                unoptimized
            />
            {/* The Magic Gradient: Works for Light (Zinc-50) and Dark (Zinc-950) */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-50 via-zinc-50/40 to-transparent dark:from-zinc-950 dark:via-zinc-950/40 dark:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-50/40 to-transparent dark:from-zinc-950 dark:via-zinc-950/40 dark:to-transparent" />
        </div>
    );
}

/* --- 5. APPLE-STYLE PORTRAIT GALLERY --- */
export function PortraitGallery({ images }: { images: any[] }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const validImages = images?.slice(0, 12) || [];

    if (validImages.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold">Gallery</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {validImages.map((img: any) => (
                    <div
                        key={img.file_path}
                        onClick={() => setSelectedImage(img.file_path)}
                        className="relative aspect-[2/3] cursor-pointer overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800 hover:opacity-90 transition-opacity"
                    >
                        <Image
                            src={`https://image.tmdb.org/t/p/w300${img.file_path}`}
                            alt="Gallery Image"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {/* Lightbox Modal */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-screen-lg h-[90vh] p-0 bg-black/95 border-none flex flex-col justify-center items-center">
                    <DialogTitle className="sr-only">Image View</DialogTitle>
                    <DialogClose className="absolute right-4 top-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </DialogClose>

                    {selectedImage && (
                        <div className="relative w-full h-full">
                            <Image
                                src={`https://image.tmdb.org/t/p/original${selectedImage}`}
                                alt="Gallery Full"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

/* --- 6. CINEMATIC ROW (Horizontal Scroll) --- */
export function CinematicRow({ title, items, href }: { title: string; items: any[]; href: string; }) {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const { clientWidth } = rowRef.current;
            const scrollAmount = direction === 'left' ? -(clientWidth * 0.75) : (clientWidth * 0.75);
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // ✨ FIX: Deduplicate items based on ID to prevent "Encountered two children with the same key"
    const uniqueItems = items?.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    ) || [];

    if (uniqueItems.length === 0) return null;

    return (
        <section className="w-full py-8 space-y-4">
            <div className="flex items-end justify-between px-1">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <Square2StackIcon className="w-4 h-4" />
                        <span>Collection // {title.split(' ')[0]}</span>
                    </div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                <Link href={href} className="group flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                    <span className="text-[10px] font-bold uppercase tracking-widest">View All</span>
                    <ArrowLongRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="relative group/row">
                {/* Scroll Buttons */}
                <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-zinc-50 via-zinc-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <ChevronLeftIcon className="w-8 h-8 text-zinc-900 dark:text-white drop-shadow-md" />
                </button>
                <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-zinc-50 via-zinc-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <ChevronRightIcon className="w-8 h-8 text-zinc-900 dark:text-white drop-shadow-md" />
                </button>

                <div ref={rowRef} className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
                    {uniqueItems.map((item) => (
                        <Link key={item.id} href={`/discover/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`} className="snap-center shrink-0 w-36 md:w-44 group space-y-2">
                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                                {item.poster_path ? (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        alt={item.title || item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        unoptimized
                                    />
                                ) : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">No Image</div>}
                            </div>
                            <div>
                                <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{item.title || item.name}</p>
                                <p className="text-xs text-zinc-500">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'TBA'}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* --- 7. CAST CREW SWITCHER (Reused from previous, ensuring it's here) --- */
export function CastCrewSwitcher({ cast, crew }: { cast: any[], crew: any }) {
    const PersonCard = ({ id, name, role, image }: { id: number, name: string, role: string, image: string | null }) => (
        <Link href={`/discover/person/${id}`} className="space-y-2 group cursor-pointer block">
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-200 dark:bg-zinc-900 rounded-lg shadow-sm">
                {image ? (
                    <Image src={`https://image.tmdb.org/t/p/w300${image}`} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100 dark:bg-zinc-800"><UserIcon className="w-8 h-8 opacity-20" /></div>
                )}
            </div>
            <div>
                <p className="text-sm font-semibold group-hover:text-amber-600 transition-colors line-clamp-1">{name}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">{role}</p>
            </div>
        </Link>
    );

    return (
        <Tabs defaultValue="cast" className="w-full">
            <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <TabsList className="bg-transparent p-0 h-auto gap-6">
                    <TabsTrigger value="cast" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none px-0 pb-3 text-lg font-medium text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 gap-2"><UserIcon className="w-4 h-4" /> Cast ({cast.length})</TabsTrigger>
                    <TabsTrigger value="crew" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-black dark:data-[state=active]:border-white rounded-none px-0 pb-3 text-lg font-medium text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 gap-2"><WrenchIcon className="w-4 h-4" /> Crew</TabsTrigger>
                </TabsList>
            </div>
            <TabsContent value="cast" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {cast.slice(0, 18).map((actor: any) => <PersonCard key={actor.id} id={actor.id} name={actor.name} role={actor.character} image={actor.profile_path} />)}
                </div>
            </TabsContent>
            <TabsContent value="crew" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {crew.writers?.length > 0 && <div className="space-y-4"><h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500">Directing & Writing</h4><div className="grid grid-cols-2 gap-4">{crew.writers.map((p: any, i: number) => <PersonCard key={i} id={p.id} name={p.name} role={p.job} image={p.profile_path} />)}</div></div>}
                    {crew.producers?.length > 0 && <div className="space-y-4"><h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500">Production</h4><div className="grid grid-cols-2 gap-4">{crew.producers.slice(0, 4).map((p: any, i: number) => <PersonCard key={i} id={p.id} name={p.name} role={p.job} image={p.profile_path} />)}</div></div>}
                </div>
            </TabsContent>
        </Tabs>
    );
}