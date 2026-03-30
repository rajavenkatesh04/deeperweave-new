'use client';

import { useState, useTransition, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import {
    CalendarIcon,
    X,
    Search,
    Film,
    Tv,
    ArrowLeftIcon,
    Clock,
    ImageIcon,
    Users,
    Lock,
    Sparkles,
    CheckIcon,
    Youtube,
    Info,
} from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { reviewSchema, type ReviewFormValues } from '@/lib/validations/review';
import { createReview } from '@/lib/actions/review-actions';
import { searchMedia } from '@/lib/actions/media-actions';
import { Movie, TV } from '@/lib/types/tmdb';

import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

/* ─── Constants ────────────────────────────────────────────────── */

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
const MAX_CHARS = 1000;
const CIRCLE_R = 10;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R; // ~62.83

const THEATRE_FORMATS = [
    { id: 'standard', label: 'Standard' },
    { id: 'imax', label: 'IMAX' },
    { id: 'dolby', label: 'Dolby Cinema' },
    { id: '4dx', label: '4DX' },
    { id: 'screenx', label: 'ScreenX' },
    { id: 'plf', label: 'PLF' },
];

const OTT_SERVICES: { id: string; label: string; color: string; letter: string; useYtIcon?: boolean }[] = [
    { id: 'netflix', label: 'Netflix', color: '#E50914', letter: 'N' },
    { id: 'prime', label: 'Prime Video', color: '#00A8E1', letter: 'P' },
    { id: 'disney', label: 'Disney+ Hotstar', color: '#113CCF', letter: 'D+' },
    { id: 'appletv', label: 'Apple TV+', color: '#1a1a1a', letter: '' },
    { id: 'youtube', label: 'YouTube', color: '#FF0000', letter: 'Y', useYtIcon: true },
    { id: 'max', label: 'Max', color: '#6A4ECC', letter: 'M' },
    { id: 'zee5', label: 'Zee5', color: '#8B2FC9', letter: 'Z' },
    { id: 'sonyliv', label: 'SonyLIV', color: '#F47920', letter: 'S' },
    { id: 'jiocinema', label: 'JioCinema', color: '#4B1ADB', letter: 'J' },
    { id: 'mubi', label: 'MUBI', color: '#1B1C1E', letter: 'M' },
];

const VIEWING_METHODS = [
    { value: 'theatre', label: 'Theatre' },
    { value: 'ott', label: 'OTT' },
    { value: 'bluray', label: 'Blu-ray / DVD' },
    { value: 'broadcast', label: 'Broadcast' },
] as const;

/* ─── Service Icon ──────────────────────────────────────────────── */

function ServiceIcon({ svc }: { svc: typeof OTT_SERVICES[number] }) {
    if (svc.useYtIcon) {
        return (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: svc.color }}>
                <Youtube className="w-4 h-4 text-white" />
            </div>
        );
    }
    // Apple TV+ — simple apple-shaped SVG
    if (svc.id === 'appletv') {
        return (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-zinc-900">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
            </div>
        );
    }
    return (
        <div
            className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white shrink-0"
            style={{ backgroundColor: svc.color, fontSize: svc.letter.length > 1 ? '9px' : '12px' }}
        >
            {svc.letter}
        </div>
    );
}

/* ─── Half-Star Rating ───────────────────────────────────────────── */

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hovered, setHovered] = useState<number | null>(null);
    const [showTip, setShowTip] = useState(value === 0);
    const display = hovered ?? value;

    // Hide hint once user has rated
    useEffect(() => { if (value > 0) setShowTip(false); }, [value]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="flex gap-1 md:gap-1.5" onMouseLeave={() => setHovered(null)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                        const fillPercent =
                            display >= star ? '100%' : display >= star - 0.5 ? '50%' : '0%';

                        return (
                            /* Fixed-size outer container */
                            <div key={star} className="relative w-10 h-10 md:w-11 md:h-11 cursor-pointer">
                                {/* Empty star — always full size */}
                                <svg
                                    viewBox="0 0 24 24"
                                    className="absolute inset-0 w-10 h-10 md:w-11 md:h-11 fill-current text-zinc-200 dark:text-zinc-700"
                                >
                                    <path d={STAR_PATH} />
                                </svg>
                                {/* Filled star — clipped div, SVG fixed to outer size */}
                                <div
                                    className="absolute top-0 left-0 h-full overflow-hidden"
                                    style={{ width: fillPercent, transition: 'width 60ms ease' }}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-10 h-10 md:w-11 md:h-11 fill-current text-zinc-900 dark:text-zinc-100 shrink-0"
                                    >
                                        <path d={STAR_PATH} />
                                    </svg>
                                </div>
                                {/* Left half tap zone → x.5 */}
                                <button
                                    type="button"
                                    aria-label={`Rate ${star - 0.5} stars`}
                                    className="absolute left-0 top-0 w-1/2 h-full z-10"
                                    onMouseEnter={() => setHovered(star - 0.5)}
                                    onClick={() => onChange(value === star - 0.5 ? 0 : star - 0.5)}
                                />
                                {/* Right half tap zone → x */}
                                <button
                                    type="button"
                                    aria-label={`Rate ${star} stars`}
                                    className="absolute right-0 top-0 w-1/2 h-full z-10"
                                    onMouseEnter={() => setHovered(star)}
                                    onClick={() => onChange(value === star ? 0 : star)}
                                />
                            </div>
                        );
                    })}
                </div>
                {display > 0 && (
                    <span className="text-base font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {display % 1 === 0 ? `${display}.0` : display} <span className="text-sm font-normal text-zinc-400">/ 5</span>
                    </span>
                )}
            </div>
            {showTip && (
                <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Info className="w-3 h-3 shrink-0" />
                    Tap the <strong>left half</strong> of a star for a ½ rating (e.g. 3.5 ★)
                </p>
            )}
        </div>
    );
}

/* ─── Coming Soon Block ──────────────────────────────────────────── */

function ComingSoonBlock({
    icon: Icon,
    title,
    description,
    tier,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    tier: string;
}) {
    const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
    return (
        <div className="relative rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 overflow-hidden">
            <div className="absolute inset-0 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-[1px]" />
            <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{title}</p>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                            <Lock className="w-2.5 h-2.5" />
                            Soon
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        Thanks for being a <span className="font-semibold text-zinc-600 dark:text-zinc-400 mx-0.5">{tierLabel}</span> member — this feature is coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Form ──────────────────────────────────────────────────── */

interface CreateReviewFormProps {
    initialMedia?: Movie | TV | null;
    username?: string;
    tier?: string;
}

export function CreateReviewForm({ initialMedia, username, tier = 'free' }: CreateReviewFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<(Movie | TV)[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Movie | TV | null>(initialMedia ?? null);
    const [watchedTime, setWatchedTime] = useState(() => {
        const now = new Date();
        return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    });

    const getMediaLabel = (m: Movie | TV) =>
        m.media_type === 'movie' ? (m as Movie).title : (m as TV).name;

    const getMediaYear = (m: Movie | TV) => {
        const date = m.media_type === 'movie' ? (m as Movie).release_date : (m as TV).first_air_date;
        return date ? date.split('-')[0] : null;
    };

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema) as Resolver<ReviewFormValues>,
        defaultValues: {
            rating: 0,
            contains_spoilers: false,
            watched_on: format(new Date(), 'yyyy-MM-dd'),
            media_type: initialMedia?.media_type ?? 'movie',
            tmdb_id: initialMedia?.id ?? 0,
        },
    });

    const viewingMethod = form.watch('viewing_method');

    /* ── Search ── */
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length > 2) {
                const results = await searchMedia(searchQuery);
                setSearchResults(results?.slice(0, 6) || []);
            } else {
                setSearchResults([]);
            }
            setIsSearching(false);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    /* ── Submit ── */
    function onSubmit(values: ReviewFormValues) {
        if (!values.tmdb_id) {
            form.setError('tmdb_id', { message: 'Please select a movie or show first.' });
            return;
        }

        const formData = new FormData();

        // Combine date + local time → UTC ISO string
        const [year, month, day] = (values.watched_on || format(new Date(), 'yyyy-MM-dd')).split('-').map(Number);
        const [hours, minutes] = watchedTime.split(':').map(Number);
        const localDate = new Date(year, month - 1, day, hours, minutes, 0);
        formData.append('watched_on', localDate.toISOString());

        Object.entries(values).forEach(([key, value]) => {
            if (key === 'watched_on') return;
            if (key === 'contains_spoilers') {
                if (value) formData.append(key, 'on');
                return;
            }
            // rating must always be sent, even when 0 (no rating)
            if (key === 'rating') {
                formData.append(key, String(value ?? 0));
                return;
            }
            if (value === null || value === undefined || value === '' || value === 0) return;
            formData.append(key, value.toString());
        });

        startTransition(async () => {
            const result = await createReview({ message: null }, formData);
            if (result.message === 'Success') {
                const dest = username
                    ? `/profile/${username}/reviews${result.reviewId ? `?review=${result.reviewId}` : ''}`
                    : '/discover';
                const sceneParams = new URLSearchParams({
                    title:  selectedMedia ? getMediaLabel(selectedMedia) : '',
                    type:   selectedMedia?.media_type ?? 'movie',
                    poster: selectedMedia?.poster_path ?? '',
                    rating: String(form.getValues('rating')),
                    dest,
                });
                flushSync(() => {
                    form.reset();
                    setSelectedMedia(null);
                });
                router.refresh();
                router.push(`/scenes/review?${sceneParams.toString()}`);
            } else {
                toast.error(result.message ?? 'Something went wrong.');
            }
        });
    }

    return (
        <div className="min-h-screen text-zinc-900 dark:text-zinc-100 pb-40 md:pb-28">

            {/* ── STICKY HEADER ── */}
            <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 sticky top-0 z-50 backdrop-blur-sm">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <span className="text-base font-semibold tracking-wide">Log Entry</span>
                    <div className="w-9" />
                </div>
            </header>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-6">

                    {/* ══ WHAT ══ */}
                    <div className="py-8 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold mb-5">What did you watch?</p>

                        {selectedMedia ? (
                            <div className="flex gap-4 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                {/* Poster */}
                                <div className="w-16 shrink-0 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 aspect-2/3 self-start">
                                    {selectedMedia.poster_path ? (
                                        <img src={`https://image.tmdb.org/t/p/w185${selectedMedia.poster_path}`} className="object-cover w-full h-full" alt={getMediaLabel(selectedMedia)} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {selectedMedia.media_type === 'movie' ? <Film className="w-5 h-5 text-zinc-400" /> : <Tv className="w-5 h-5 text-zinc-400" />}
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
                                    <p className="font-bold text-lg leading-tight">
                                        {getMediaLabel(selectedMedia)}
                                        {getMediaYear(selectedMedia) && (
                                            <span className="font-normal text-zinc-400 ml-1.5 text-base">({getMediaYear(selectedMedia)})</span>
                                        )}
                                    </p>
                                    <span className={cn(
                                        'inline-flex self-start items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                                        selectedMedia.media_type === 'movie'
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    )}>
                                        {selectedMedia.media_type === 'movie' ? 'Movie' : 'TV Series'}
                                    </span>
                                </div>
                                {!initialMedia && (
                                    <button type="button" onClick={() => { setSelectedMedia(null); form.setValue('tmdb_id', 0); }} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 self-start shrink-0">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input
                                    placeholder="Search movies or TV shows..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value.length > 2) setIsSearching(true); }}
                                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                    className="pl-10 pr-10 h-12 text-base bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                />
                                {isSearching && <Spinner className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />}
                                {searchResults.length > 0 && (
                                    <div className="absolute w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                                        {searchResults.map((item) => (
                                            <button type="button" key={item.id} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                                                onClick={() => { setSelectedMedia(item); form.setValue('tmdb_id', item.id); form.setValue('media_type', item.media_type); setSearchQuery(''); setSearchResults([]); }}>
                                                <div className="relative w-8 h-12 shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                                    {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="object-cover w-full h-full" alt="" /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-zinc-400" /></div>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{item.media_type === 'movie' ? (item as Movie).title : (item as TV).name}</p>
                                                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{item.media_type === 'movie' ? 'Movie' : 'TV Series'}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <FormField control={form.control} name="tmdb_id" render={() => <FormMessage className="mt-2 text-xs" />} />
                        <input type="hidden" {...form.register('tmdb_id')} />
                        <input type="hidden" {...form.register('media_type')} />
                    </div>

                    {/* ══ RATING ══ */}
                    <div className="py-8 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold mb-5">Rating</p>
                        <FormField control={form.control} name="rating" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <StarRating value={field.value} onChange={field.onChange} />
                                </FormControl>
                                <FormMessage className="text-xs mt-2" />
                            </FormItem>
                        )} />
                    </div>

                    {/* ══ WHEN ══ */}
                    <div className="py-8 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold mb-5">When did you watch?</p>
                        <div className="flex gap-3">
                            <FormField control={form.control} name="watched_on" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start h-12 text-base bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl font-normal">
                                                <CalendarIcon className="mr-3 w-4 h-4 text-zinc-400" />
                                                {field.value ? format(new Date(field.value + 'T12:00:00'), 'PPP') : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                captionLayout="dropdown"
                                                startMonth={new Date(1900, 0)}
                                                endMonth={new Date()}
                                                selected={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                disabled={(date) => date > new Date()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )} />
                            <div className="relative w-[140px] shrink-0">
                                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                <input
                                    type="time"
                                    value={watchedTime}
                                    onChange={(e) => setWatchedTime(e.target.value)}
                                    className="w-full h-12 pl-10 pr-3 text-base bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-2">Your local timezone — stored in UTC.</p>
                    </div>

                    {/* ══ HOW ══ */}
                    <div className="py-8 border-b border-zinc-200 dark:border-zinc-800 space-y-5">
                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">How did you watch?</p>

                        <FormField control={form.control} name="viewing_method" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="flex flex-wrap gap-2">
                                        {VIEWING_METHODS.map(({ value, label }) => (
                                            <button type="button" key={value}
                                                onClick={() => { field.onChange(field.value === value ? null : value); form.setValue('viewing_service', ''); }}
                                                className={cn(
                                                    'px-4 py-2.5 rounded-full text-sm font-semibold border transition-all',
                                                    field.value === value
                                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                                        : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                                                )}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </FormControl>
                            </FormItem>
                        )} />

                        {/* Theatre sub-formats */}
                        {viewingMethod === 'theatre' && (
                            <FormField control={form.control} name="viewing_service" render={({ field }) => (
                                <FormItem>
                                    <p className="text-xs text-zinc-500 mb-3">Format</p>
                                    <FormControl>
                                        <div className="flex flex-wrap gap-2">
                                            {THEATRE_FORMATS.map((fmt) => {
                                                const active = field.value === fmt.id;
                                                return (
                                                    <button type="button" key={fmt.id} onClick={() => field.onChange(active ? '' : fmt.id)}
                                                        className={cn(
                                                            'px-3.5 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5',
                                                            active
                                                                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100'
                                                                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                                                        )}>
                                                        {active && <CheckIcon className="w-3.5 h-3.5" />}
                                                        {fmt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )} />
                        )}

                        {/* OTT service grid */}
                        {viewingMethod === 'ott' && (
                            <FormField control={form.control} name="viewing_service" render={({ field }) => (
                                <FormItem>
                                    <p className="text-xs text-zinc-500 mb-3">Platform</p>
                                    <FormControl>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {OTT_SERVICES.map((svc) => {
                                                const active = field.value === svc.id;
                                                return (
                                                    <button type="button" key={svc.id} onClick={() => field.onChange(active ? '' : svc.id)}
                                                        className={cn(
                                                            'flex items-center gap-3 px-3 py-3 rounded-xl border text-sm font-semibold transition-all text-left',
                                                            active
                                                                ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-900 ring-2 ring-zinc-900 dark:ring-zinc-100'
                                                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                                                        )}>
                                                        <ServiceIcon svc={svc} />
                                                        <span className="truncate text-zinc-800 dark:text-zinc-200 text-sm">{svc.label}</span>
                                                        {active && <CheckIcon className="w-4 h-4 ml-auto text-zinc-900 dark:text-zinc-100 shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )} />
                        )}
                    </div>

                    {/* ══ THOUGHTS ══ */}
                    <div className="py-8 border-b border-zinc-200 dark:border-zinc-800">
                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold mb-5">Your Thoughts</p>
                        <FormField control={form.control} name="content" render={({ field }) => {
                            const charCount = field.value?.length ?? 0;
                            const remaining = MAX_CHARS - charCount;
                            const isNearLimit = remaining <= 100;
                            const isOverLimit = remaining < 0;
                            const progress = Math.min(charCount / MAX_CHARS, 1);
                            const dashOffset = CIRCLE_C * (1 - progress);
                            return (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative w-full">
                                            <Textarea
                                                {...field}
                                                placeholder="Write your review..."
                                                className="min-h-[160px] pb-10 text-base leading-relaxed bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl resize-none"
                                            />
                                            {charCount > 0 && (
                                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                                                    {isNearLimit && (
                                                        <span className={cn('text-xs tabular-nums font-medium', isOverLimit ? 'text-red-500' : 'text-zinc-400')}>
                                                            {remaining}
                                                        </span>
                                                    )}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
                                                        <circle cx="12" cy="12" r={CIRCLE_R} fill="none" strokeWidth="2.5" className="stroke-zinc-200 dark:stroke-zinc-700" />
                                                        <circle
                                                            cx="12" cy="12" r={CIRCLE_R}
                                                            fill="none"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                            strokeDasharray={CIRCLE_C}
                                                            strokeDashoffset={dashOffset}
                                                            className={cn(
                                                                isOverLimit ? 'stroke-red-500' :
                                                                isNearLimit ? 'stroke-amber-500' :
                                                                'stroke-zinc-900 dark:stroke-zinc-100'
                                                            )}
                                                            style={{ transition: 'stroke-dashoffset 80ms ease' }}
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-2" />
                                </FormItem>
                            );
                        }} />
                    </div>

                    {/* ══ OPTIONS ══ */}
                    <div className="py-8 border-b border-zinc-200 dark:border-zinc-800 space-y-5">
                        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">Options</p>

                        <FormField control={form.control} name="contains_spoilers" render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <button type="button" onClick={() => field.onChange(!field.value)}
                                        className={cn(
                                            'flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all w-full text-left',
                                            field.value
                                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                                        )}>
                                        <span className={cn('w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0', field.value ? 'bg-amber-500 border-amber-500' : 'border-zinc-300 dark:border-zinc-600')}>
                                            {field.value && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 10"><path d="M1 5l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        </span>
                                        <span>Contains spoilers</span>
                                        {field.value && <span className="ml-auto text-[10px] uppercase tracking-widest font-bold">On</span>}
                                    </button>
                                </FormControl>
                            </FormItem>
                        )} />

                        <ComingSoonBlock icon={ImageIcon} title="Attach a Memory" description="Upload a group photo, ticket stub, or any memento from your watch experience." tier={tier} />
                        <ComingSoonBlock icon={Users} title="Tag Friends" description="Tag friends you watched with to share the memory on their timeline too." tier={tier} />
                    </div>

                </form>
            </Form>

            {/* ── STICKY SUBMIT — above mobile nav (h-16 = 4rem) ── */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-800 p-4 md:pl-24">
                <div className="max-w-2xl mx-auto">
                    <button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}
                        className="w-full py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-base font-bold rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending ? (<><Spinner />Saving...</>) : 'Log Review'}
                    </button>
                </div>
            </div>
        </div>
    );
}
