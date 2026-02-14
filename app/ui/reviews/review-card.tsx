'use client';

import { useState } from 'react';
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
    MoreHorizontal
} from 'lucide-react';
import { Review } from '@/lib/definitions'; //
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 1. Define the Prop Type based on the Supabase Join
// This matches the query in your page.tsx: select(*, movie:movies(...), tv:tv_shows(...))
export interface ReviewCardProps {
    review: Review & {
        movie: { title: string; poster_path: string | null; release_date: string | null } | null;
        tv: { name: string; poster_path: string | null; first_air_date: string | null } | null;
    };
    isOwnProfile: boolean;
}

export function ReviewCard({ review, isOwnProfile }: ReviewCardProps) {
    const [isSpoilerVisible, setIsSpoilerVisible] = useState(!review.contains_spoilers);

    // 2. Normalize Media Data (Movie vs TV)
    const isMovie = !!review.movie;
    const media = isMovie ? review.movie : review.tv;
    const title = isMovie ? review.movie?.title : review.tv?.name;
    const posterPath = media?.poster_path;
    const releaseDate = isMovie ? review.movie?.release_date : review.tv?.first_air_date;
    const year = releaseDate ? releaseDate.split('-')[0] : 'Unknown';

    // Format Watched Date
    const watchedDate = format(new Date(review.watched_on), 'MMM d, yyyy');

    return (
        <Card className="overflow-hidden bg-card border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex flex-col sm:flex-row">

                {/* --- LEFT: POSTER --- */}
                <div className="relative w-full sm:w-32 h-48 sm:h-auto flex-shrink-0 bg-muted">
                    {posterPath ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w342${posterPath}`}
                            alt={title || "Media Poster"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            {isMovie ? <Ticket className="w-8 h-8" /> : <Tv className="w-8 h-8" />}
                        </div>
                    )}

                    {/* Mobile Overlay: Rating */}
                    <div className="absolute top-2 left-2 sm:hidden bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-white">{review.rating}</span>
                    </div>
                </div>

                {/* --- RIGHT: CONTENT --- */}
                <div className="flex flex-col flex-1 min-w-0">

                    {/* Header */}
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-4">
                        <div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <h3 className="text-lg font-bold leading-tight text-foreground line-clamp-1">
                                    {title}
                                </h3>
                                <span className="text-sm text-muted-foreground">{year}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5">
                                {/* Desktop Rating */}
                                <div className="hidden sm:flex items-center gap-0.5 text-yellow-500">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn("w-3.5 h-3.5", i < (review.rating || 0) ? "fill-current" : "text-muted/30")}
                                        />
                                    ))}
                                </div>

                                <span className="text-xs text-muted-foreground px-2 border-l border-border">
                  Watched {watchedDate}
                </span>
                            </div>
                        </div>

                        {/* Menu (Edit/Delete) - Only if own profile */}
                        {isOwnProfile && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Entry</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </CardHeader>

                    {/* Badges & Meta */}
                    <div className="px-4 flex flex-wrap gap-2 mb-3">
                        {review.is_rewatch && (
                            <Badge variant="secondary" className="text-[10px] h-5 gap-1 px-2 font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                                <Repeat className="w-3 h-3" /> Rewatch {review.rewatch_count > 1 && `x${review.rewatch_count}`}
                            </Badge>
                        )}

                        {review.viewing_service && (
                            <Badge variant="outline" className="text-[10px] h-5 px-2 font-normal text-muted-foreground border-border">
                                {review.viewing_service}
                            </Badge>
                        )}

                        {review.viewing_method === 'theatre' && (
                            <Badge variant="outline" className="text-[10px] h-5 px-2 font-normal text-muted-foreground border-border gap-1">
                                <Ticket className="w-3 h-3" /> Theatre
                            </Badge>
                        )}
                    </div>

                    {/* Body Content */}
                    <CardContent className="p-4 pt-0 flex-1 relative">
                        {review.contains_spoilers && !isSpoilerVisible ? (
                            <div className="relative rounded-lg bg-muted/40 p-6 flex flex-col items-center justify-center text-center gap-2 border border-dashed border-border">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <EyeOff className="w-4 h-4" />
                                    <span className="text-sm font-medium">Contains Spoilers</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setIsSpoilerVisible(true)}
                                >
                                    Reveal Review
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {review.content && (
                                    <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                                        {review.content}
                                    </p>
                                )}

                                {/* Attachments (Simple Grid) */}
                                {review.attachments && review.attachments.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {review.attachments.map((url, idx) => (
                                            <div key={idx} className="relative h-32 w-32 flex-shrink-0 rounded-md overflow-hidden bg-black/5 border border-border">
                                                <img src={url} alt="Attachment" className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Re-hide button if needed */}
                                {review.contains_spoilers && isSpoilerVisible && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] text-muted-foreground px-0 hover:bg-transparent hover:text-foreground"
                                        onClick={() => setIsSpoilerVisible(false)}
                                    >
                                        <EyeOff className="w-3 h-3 mr-1" /> Hide Spoilers
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>

                    {/* Footer Actions */}
                    <CardFooter className="p-3 bg-muted/30 border-t border-border flex justify-between items-center">
                        <div className="flex gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors">
                                <Heart className="w-4 h-4 mr-1.5 group-hover:fill-current" />
                                <span className="text-xs">{review.like_count || 0}</span>
                            </Button>

                            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors">
                                <MessageCircle className="w-4 h-4 mr-1.5" />
                                <span className="text-xs">{review.comment_count || 0}</span>
                            </Button>
                        </div>

                        {/* Share / Link */}
                        {/* You can add a share button here later */}
                    </CardFooter>

                </div>
            </div>
        </Card>
    );
}