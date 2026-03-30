'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
    MessageCircle,
    Heart,
    Eye,
    EyeOff,
    Ticket,
    Tv,
    Repeat,
    MoreHorizontal,
    Star,
    MonitorPlay,
    X
} from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { Review } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteReview } from '@/lib/actions/review-actions';
import { toast } from 'sonner';
import Image from "next/image";

export interface ReviewCardProps {
    review: Review & {
        movie: { title: string; poster_path: string | null; release_date: string | null } | null;
        tv: { name: string; poster_path: string | null; first_air_date: string | null } | null;
    };
    isOwnProfile: boolean;
    onDelete?: (id: string) => void;
}

export function ReviewCard({ review, isOwnProfile, onDelete }: ReviewCardProps) {
    const [isSpoilerVisible, setIsSpoilerVisible] = useState(!review.contains_spoilers);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Normalize Media Data
    const isMovie = !!review.movie;
    const media = isMovie ? review.movie : review.tv;
    const title = isMovie ? review.movie?.title : review.tv?.name;
    const posterPath = media?.poster_path;
    const releaseDate = isMovie ? review.movie?.release_date : review.tv?.first_air_date;
    const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';

    // Formatting Date to match MVP (e.g., "Wed, Oct 12, 2023")
    const dateObj = new Date(review.watched_on);
    const formattedDate = format(dateObj, 'EEE, MMM d, yyyy');

    const rating = Number(review.rating || 0);
    const displayRating = rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
    const isRewatch = review.is_rewatch || review.rewatch_count > 0;

    // Check if text is long enough to warrant a "...more" button
    const isLongText = review.content && review.content.length > 100;

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteReview(review.id);
            if (result.message === 'Success') {
                onDelete?.(review.id);
                toast.success('Entry deleted');
            } else {
                toast.error(result.message ?? 'Failed to delete entry');
            }
            setShowDeleteDialog(false);
        });
    };

    return (
        <>
            <div className="group relative w-full mb-4" id={`entry-${review.id}`}>
                {/* MVP Main Container Style */}
                <div className="flex flex-row w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">

                    {/* MVP POSTER CONTAINER */}
                    <div className="relative w-24 min-h-[140px] md:w-32 shrink-0 bg-zinc-100 dark:bg-zinc-900 group/poster">
                        {posterPath ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                                alt={title || "Media Poster"}
                                fill
                                className="object-cover object-center group-hover/poster:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 96px, 128px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                {isMovie ? <Ticket className="w-8 h-8" /> : <Tv className="w-8 h-8" />}
                            </div>
                        )}
                    </div>

                    {/* MVP CONTENT CONTAINER */}
                    <div className="flex-1 flex flex-col p-4 min-w-0 relative">

                        {/* Header: Date & Menu */}
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs uppercase tracking-wide font-semibold text-zinc-500 dark:text-zinc-500 italic">
                                {formattedDate}
                            </span>
                            {isOwnProfile && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 -mr-2 -mt-1">
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit Entry</DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                            onClick={() => setShowDeleteDialog(true)}
                                        >
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>

                        {/* Title & Year */}
                        <div className="flex items-baseline gap-2 mb-2 pr-6">
                            <h3 className="text-base md:text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100 truncate">
                                {title}
                            </h3>
                            {releaseYear && (
                                <span className="text-sm font-normal text-zinc-400 shrink-0">
                                    ({releaseYear})
                                </span>
                            )}
                        </div>

                        {/* Metadata Row (MVP Styling) */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 mb-2.5">
                            {rating > 0 && (
                                <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                                    <Star className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-600 fill-zinc-400 dark:fill-zinc-600" />
                                    <span>{displayRating}</span>
                                </div>
                            )}

                            {(rating > 0 && (review.viewing_method || review.viewing_service)) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}

                            {/* Platform / Viewing Method Badge */}
                            {review.viewing_service && (
                                <div className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{review.viewing_service}</span>
                                </div>
                            )}
                            {(!review.viewing_service && review.viewing_method) && (
                                <div className="inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/5">
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">{review.viewing_method}</span>
                                </div>
                            )}

                            {((rating > 0 || review.viewing_method || review.viewing_service) && isRewatch) && <span className="text-zinc-300 dark:text-zinc-700">•</span>}

                            {/* Rewatch Badge */}
                            {isRewatch && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 font-bold uppercase tracking-wider text-[10px]">
                                    <Repeat className="w-3 h-3 stroke-[3]" />
                                    <span>{review.rewatch_count > 1 ? `Rewatch ${review.rewatch_count}` : 'Rewatch'}</span>
                                </div>
                            )}
                        </div>

                        {/* Notes / Review Body (MVP Styling with Mobile Truncation) */}
                        {review.content && (
                            <div className="relative mb-2 group/notes mt-1">
                                <div className={cn(
                                    "text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed transition-all duration-300 whitespace-pre-line",
                                    "line-clamp-2 md:line-clamp-none", // Truncates strictly on mobile
                                    review.contains_spoilers && !isSpoilerVisible ? "blur-md select-none pointer-events-none opacity-40" : ""
                                )}>
                                    {review.content}
                                </div>

                                {/* ...more trigger for mobile */}
                                {isLongText && (!review.contains_spoilers || isSpoilerVisible) && (
                                    <button
                                        onClick={() => setShowNotesModal(true)}
                                        className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 mt-0.5 md:hidden"
                                    >
                                        ...more
                                    </button>
                                )}

                                {/* Spoiler Overlay */}
                                {review.contains_spoilers && !isSpoilerVisible && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-transparent rounded-md">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="rounded-md font-semibold shadow-md bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 backdrop-blur-sm"
                                            onClick={() => setIsSpoilerVisible(true)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Reveal Spoilers
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="mt-auto pt-2 flex items-center justify-between">
                            <div className="flex gap-2 -ml-2">
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md">
                                    <Heart className="w-4 h-4 mr-1.5" />
                                    <span className="text-xs font-semibold">{review.like_count || 0}</span>
                                </Button>

                                <Button variant="ghost" size="sm" className="h-7 px-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md">
                                    <MessageCircle className="w-4 h-4 mr-1.5" />
                                    <span className="text-xs font-semibold">{review.comment_count || 0}</span>
                                </Button>
                            </div>

                            {review.contains_spoilers && isSpoilerVisible && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[11px] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md"
                                    onClick={() => setIsSpoilerVisible(false)}
                                >
                                    <EyeOff className="w-3 h-3 mr-1.5" /> Hide
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* --- FULL REVIEW MODAL (Pop-up for mobile) --- */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setShowNotesModal(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="flex items-start gap-4 p-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 shrink-0">
                            <div className="relative w-12 h-16 shrink-0 rounded-sm overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                                {posterPath ? (
                                    <Image src={`https://image.tmdb.org/t/p/w185${posterPath}`} alt="Poster" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5 pr-6">
                                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                    <span>{formattedDate}</span>
                                    {rating > 0 && (
                                        <>
                                            <span>•</span>
                                            <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100 font-semibold">
                                                <Star className="w-3 h-3 text-zinc-400 dark:text-zinc-600 fill-zinc-400 dark:fill-zinc-600" />
                                                {displayRating}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowNotesModal(false)}
                                className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="overflow-y-auto p-5 custom-scrollbar">
                            <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap">
                                {review.content}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your review of <span className="font-medium text-foreground">{title}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {isPending ? <Spinner className="w-4 h-4 text-white" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}