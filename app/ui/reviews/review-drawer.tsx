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
    X,
} from 'lucide-react';
import Image from 'next/image';

import { Spinner } from '@/components/ui/spinner';
import { Review } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteReview } from '@/lib/actions/review-actions';
import { toast } from 'sonner';
import { StarDisplay } from './review-card';

export interface ReviewDrawerProps {
    review: Review & {
        movie: { title: string; poster_path: string | null; release_date: string | null } | null;
        tv: { name: string; poster_path: string | null; first_air_date: string | null } | null;
    };
    isOwnProfile: boolean;
    onDelete?: (id: string) => void;
}

export function ReviewDrawer({ review, isOwnProfile, onDelete }: ReviewDrawerProps) {
    const [isSpoilerVisible, setIsSpoilerVisible] = useState(!review.contains_spoilers);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isPending, startTransition] = useTransition();

    const isMovie = !!review.movie;
    const media = isMovie ? review.movie : review.tv;
    const title = isMovie ? review.movie?.title : review.tv?.name;
    const posterPath = media?.poster_path;
    const releaseDate = isMovie ? review.movie?.release_date : review.tv?.first_air_date;
    const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';

    const dateObj = new Date(review.watched_on);
    const formattedDate = format(dateObj, 'EEE, MMM d, yyyy');

    const rating = Number(review.rating || 0);
    const displayRating = rating % 1 === 0 ? `${rating}.0` : rating.toFixed(1);
    const isRewatch = review.is_rewatch === true;

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
            <SheetTitle className="sr-only">{title} — Review</SheetTitle>
            <SheetDescription className="sr-only">Full review details for {title}</SheetDescription>

            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
                <SheetClose asChild>
                    <button className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                        <X className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </SheetClose>

                {isOwnProfile && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
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

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-950">

                {/* Hero: poster + core info */}
                <div className="flex gap-4 p-5">
                    <div
                        className="relative shrink-0 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-900 shadow"
                        style={{ width: 88, height: 132 }}
                    >
                        {posterPath ? (
                            <Image
                                src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                                alt={title || 'Poster'}
                                fill
                                className="object-cover"
                                sizes="88px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                {isMovie ? <Ticket className="w-8 h-8" /> : <Tv className="w-8 h-8" />}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                            {title}
                        </h2>
                        {releaseYear && (
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{releaseYear}</p>
                        )}

                        {rating > 0 && (
                            <div className="mt-2.5 flex items-center gap-2">
                                <StarDisplay value={rating} size={18} />
                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">
                                    {displayRating}
                                </span>
                            </div>
                        )}

                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 italic">{formattedDate}</p>
                    </div>
                </div>

                {/* Metadata badges */}
                {(review.viewing_service || review.viewing_method || isRewatch) && (
                    <div className="flex flex-wrap items-center gap-2 px-5 pb-4 pt-0">
                        {review.viewing_service && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-100 dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                                {review.viewing_service}
                            </span>
                        )}
                        {!review.viewing_service && review.viewing_method && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-zinc-100 dark:bg-zinc-800/80 border border-black/5 dark:border-white/5 text-[11px] font-bold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                                {review.viewing_method}
                            </span>
                        )}
                        {isRewatch && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                                <Repeat className="w-3 h-3 stroke-[3]" />
                                {review.rewatch_count > 1 ? `Rewatch ${review.rewatch_count}` : 'Rewatch'}
                            </span>
                        )}
                    </div>
                )}

                <div className="border-t border-zinc-100 dark:border-zinc-800 mx-5" />

                {/* Review content */}
                {review.content ? (
                    <div className="relative px-5 py-4">
                        <div className={cn(
                            'text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line',
                            review.contains_spoilers && !isSpoilerVisible
                                ? 'blur-md select-none pointer-events-none opacity-40'
                                : ''
                        )}>
                            {review.content}
                        </div>

                        {review.contains_spoilers && !isSpoilerVisible && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-md font-semibold shadow-md backdrop-blur-sm"
                                    onClick={() => setIsSpoilerVisible(true)}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Reveal Spoilers
                                </Button>
                            </div>
                        )}

                        {review.contains_spoilers && isSpoilerVisible && (
                            <button
                                onClick={() => setIsSpoilerVisible(false)}
                                className="flex items-center gap-1.5 mt-3 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                <EyeOff className="w-3 h-3" />
                                Hide spoilers
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="px-5 py-4 text-sm text-zinc-400 italic">No review written.</div>
                )}
            </div>

            {/* Footer — solid bg so it doesn't disappear behind mobile navbar */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 pb-safe flex items-center gap-1 shrink-0 bg-white dark:bg-zinc-950 pb-6 md:pb-3">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md">
                    <Heart className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-semibold">{review.like_count || 0}</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md">
                    <MessageCircle className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-semibold">{review.comment_count || 0}</span>
                </Button>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your review of{' '}
                            <span className="font-medium text-foreground">{title}</span>. This action cannot be undone.
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
