'use client';

import { useState, useTransition } from 'react';
import { format } from 'date-fns';
import {
    Star,
    MessageCircle,
    Heart,
    Eye,
    EyeOff,
    Ticket,
    Tv,
    Repeat,
    MoreHorizontal,
    MonitorPlay,
    Loader2,
} from 'lucide-react';
import { Review } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    const [isPending, startTransition] = useTransition();

    // Normalize Media Data
    const isMovie = !!review.movie;
    const media = isMovie ? review.movie : review.tv;
    const title = isMovie ? review.movie?.title : review.tv?.name;
    const posterPath = media?.poster_path;
    const releaseDate = isMovie ? review.movie?.release_date : review.tv?.first_air_date;
    const releaseYear = releaseDate ? releaseDate.split('-')[0] : 'Unknown';

    // Parse Watched Date for Vertical Stack
    const dateObj = new Date(review.watched_on);
    const day = format(dateObj, 'dd');
    const month = format(dateObj, 'MMM');
    const yearShort = format(dateObj, 'yy');

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
            <Card className="group overflow-hidden bg-card border-border transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
                {/* Main Flex Container */}
                <div className="flex flex-row p-4 sm:p-5 gap-4 sm:gap-6">

                    {/* --- LEFT SECTION: Date & Poster (Height Matched) --- */}
                    <div className="flex shrink-0 items-stretch gap-3 sm:gap-4">

                        {/* 1. Vertical Date Stack */}
                        <div className="flex flex-col justify-center items-center w-8 sm:w-10 border-r border-border/60 pr-3 sm:pr-4">
                            <span className="text-xl sm:text-2xl font-black leading-none text-foreground tracking-tighter">
                                {day}
                            </span>
                            <span className="text-xs sm:text-sm font-bold uppercase text-muted-foreground mt-1 tracking-widest">
                                {month}
                            </span>
                            <span className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5">
                                &apos;{yearShort}
                            </span>
                        </div>

                        {/* 2. Poster */}
                        <div className="relative w-20 sm:w-28 rounded-md overflow-hidden bg-muted aspect-2/3 border border-border shadow-sm shrink-0">
                            {posterPath ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                                    alt={title || "Media Poster"}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 640px) 80px, 112px"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    {isMovie ? <Ticket className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" /> : <Tv className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" />}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT SECTION: Meaningfully Packaged Content --- */}
                    <div className="flex flex-col flex-1 min-w-0 justify-between py-1">

                        <div>
                            {/* Header: Title, Rating, and Menu */}
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="text-lg sm:text-xl font-bold leading-tight text-foreground truncate">
                                        {title} <span className="font-normal text-muted-foreground ml-1 text-base">{releaseYear}</span>
                                    </h3>

                                    {/* Star Rating */}
                                    <div className="flex items-center gap-0.5 text-yellow-500 mt-1.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={cn("w-4 h-4", i < (review.rating || 0) ? "fill-current" : "text-muted/30")}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Options Menu */}
                                {isOwnProfile && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground -mt-1 -mr-2">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit Entry</DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => setShowDeleteDialog(true)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* Badges / Viewing Metadata */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {review.is_rewatch && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-none">
                                        <Repeat className="w-3 h-3 mr-1" /> Rewatch {review.rewatch_count > 1 && `x${review.rewatch_count}`}
                                    </Badge>
                                )}
                                {review.viewing_method === 'theatre' && (
                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-none">
                                        <Ticket className="w-3 h-3 mr-1" /> Theatre
                                    </Badge>
                                )}
                                {review.viewing_service && (
                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 text-muted-foreground border-border/60">
                                        <MonitorPlay className="w-3 h-3 mr-1" /> {review.viewing_service}
                                    </Badge>
                                )}
                            </div>

                            {/* Review Body Content */}
                            <div className="relative mt-3">
                                <div className={cn(
                                    "transition-all duration-300 rounded-md",
                                    review.contains_spoilers && !isSpoilerVisible ? "blur-[5px] opacity-60 select-none pointer-events-none" : ""
                                )}>
                                    {review.content && (
                                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 line-clamp-4 sm:line-clamp-none whitespace-pre-line">
                                            {review.content}
                                        </p>
                                    )}
                                </div>

                                {/* Spoiler Overlay */}
                                {review.contains_spoilers && !isSpoilerVisible && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="shadow-md backdrop-blur-xl bg-background/80 hover:bg-background border-border"
                                            onClick={() => setIsSpoilerVisible(true)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Reveal Spoilers
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions (Anchored to bottom) */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                            <div className="flex gap-1 -ml-2">
                                <Button variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-full">
                                    <Heart className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-medium">{review.like_count || 0}</span>
                                </Button>

                                <Button variant="ghost" size="sm" className="h-8 px-3 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors rounded-full">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-medium">{review.comment_count || 0}</span>
                                </Button>
                            </div>

                            {review.contains_spoilers && isSpoilerVisible && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={() => setIsSpoilerVisible(false)}
                                >
                                    <EyeOff className="w-3 h-3 mr-1.5" /> Re-hide
                                </Button>
                            )}
                        </div>

                    </div>
                </div>
            </Card>

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
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}