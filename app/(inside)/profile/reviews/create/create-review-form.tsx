'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
    Loader2,
    CalendarIcon,
    Star,
    X,
    Search,
    Film,
} from 'lucide-react';

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
    FormLabel,
    FormMessage,
    FormDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

export function CreateReviewForm() {
    const [isPending, startTransition] = useTransition();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<(Movie | TV)[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<Movie | TV | null>(null);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema) as Resolver<ReviewFormValues>,
        defaultValues: {
            rating: 0,
            contains_spoilers: false,
            watched_on: format(new Date(), 'yyyy-MM-dd'),
            media_type: 'movie',
            tmdb_id: 0,
        },
    });

    /* ---------------- SEARCH ---------------- */

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) setIsSearching(true);
    };

    /* ---------------- SUBMIT ---------------- */

    function onSubmit(values: ReviewFormValues) {
        if (!values.tmdb_id) {
            form.setError('tmdb_id', {
                message: 'Please select a movie or show first.',
            });
            return;
        }

        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
            if (!value) return;
            formData.append(key, value.toString());
        });

        startTransition(async () => {
            const result = await createReview({ message: null }, formData);

            if (result.message === 'Success') {
                toast.success('Review logged successfully');
                form.reset();
                setSelectedMedia(null);
                setSearchQuery('');
                setSearchResults([]);
            } else {
                toast.error(result.message);
            }
        });
    }

    /* ---------------- STAR RATING ---------------- */

    const StarRating = ({
                            value,
                            onChange,
                        }: {
        value: number;
        onChange: (v: number) => void;
    }) => {
        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        type="button"
                        key={star}
                        onClick={() => onChange(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            className={cn(
                                'w-6 h-6',
                                star <= value
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                            )}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="max-w-3xl mx-auto py-16 space-y-12"
            >
                {/* ================= MEDIA SEARCH ================= */}

                <Card className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">What did you watch?</h3>
                        <p className="text-sm text-muted-foreground">
                            Search for a movie or TV show.
                        </p>
                    </div>

                    {selectedMedia ? (
                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30 relative">
                            <div className="h-16 w-12 bg-muted rounded overflow-hidden">
                                {selectedMedia.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w92${selectedMedia.poster_path}`}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <Film className="m-auto mt-5 opacity-40" />
                                )}
                            </div>

                            <div className="flex-1">
                                <p className="font-medium text-sm">
                                    {selectedMedia.media_type === 'movie'
                                        ? selectedMedia.title
                                        : selectedMedia.name}
                                </p>
                            </div>

                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    setSelectedMedia(null);
                                    form.setValue('tmdb_id', 0);
                                }}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />

                            <Input
                                placeholder="Search movies or TV..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                                className="pl-9 pr-10"
                            />

                            {isSearching && (
                                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
                            )}

                            {searchResults.length > 0 && (
                                <div className="absolute w-full mt-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
                                    {searchResults.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer"
                                            onClick={() => {
                                                setSelectedMedia(item);
                                                form.setValue('tmdb_id', item.id);
                                                form.setValue('media_type', item.media_type);
                                                setSearchQuery('');
                                                setSearchResults([]);
                                            }}
                                        >
                                            <div className="w-8 h-12 bg-muted rounded overflow-hidden">
                                                {item.poster_path ? (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <Film className="m-auto mt-4 opacity-40" />
                                                )}
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.media_type === 'movie'
                                                        ? item.title
                                                        : item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.media_type.toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <input type="hidden" {...form.register('tmdb_id')} />
                    <input type="hidden" {...form.register('media_type')} />
                </Card>

                {/* ================= REVIEW DETAILS ================= */}

                <Card className="p-6 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                        <StarRating
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="watched_on"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Watched On</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start">
                                                {field.value
                                                    ? format(new Date(field.value), 'PPP')
                                                    : 'Pick a date'}
                                                <CalendarIcon className="ml-auto w-4 h-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    field.value ? new Date(field.value) : undefined
                                                }
                                                onSelect={(date) =>
                                                    field.onChange(
                                                        date ? format(date, 'yyyy-MM-dd') : ''
                                                    )
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Thoughts</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Write your review..."
                                        className="min-h-[140px]"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Separator />

                    <FormField
                        control={form.control}
                        name="contains_spoilers"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-3">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="cursor-pointer">
                                    Contains Spoilers
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                </Card>

                {/* ================= SUBMIT ================= */}

                <div className="sticky bottom-6">
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Spinner />
                                Saving...
                            </>
                        ) : (
                            'Log Review'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}