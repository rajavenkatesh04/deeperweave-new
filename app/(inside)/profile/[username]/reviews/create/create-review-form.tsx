    'use client';

    // 1. Setup Form
    import type { Resolver } from "react-hook-form";
    import { useState, useTransition, useEffect } from 'react';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { format } from 'date-fns';
    import { Loader2, CalendarIcon, Star, X, Search, Film } from 'lucide-react';
    import { cn } from '@/lib/utils';
    import { reviewSchema, type ReviewFormValues } from '@/lib/validations/review';
    import { createReview } from '@/lib/actions/review-actions';
    import { Button } from '@/components/ui/button';
    import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover';
    import { Calendar } from '@/components/ui/calendar';
    import { Checkbox } from '@/components/ui/checkbox';
    import {
        Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
    import { toast } from 'sonner';
    import { searchMedia } from "@/lib/actions/media-actions";
    import {Spinner} from "@/components/ui/spinner";
    import {Movie, TV} from "@/lib/types/tmdb";
    
    export function CreateReviewForm() {
        const [isPending, startTransition] = useTransition();
    
        // Search State
        const [searchQuery, setSearchQuery] = useState('');
        const [searchResults, setSearchResults] = useState<(Movie | TV)[]>([]);
        const [isSearching, setIsSearching] = useState(false); // ⚡ Added for Spinner state
    
        // Selection State
        const [selectedMedia, setSelectedMedia] = useState<Movie | TV | null>(null);
        const form = useForm<ReviewFormValues>({
            resolver: zodResolver(reviewSchema) as Resolver<ReviewFormValues>,
            defaultValues: {
                rating: 0,
                contains_spoilers: false,
                watched_on: format(new Date(), 'yyyy-MM-dd'),
                media_type: 'movie',
                tmdb_id: 0, // Explicit default
            },
        });
    
        // 2. Handle Search (Debounced)
        useEffect(() => {
            const delayDebounceFn = setTimeout(async () => {
                if (searchQuery.length > 2) {
                    const results = await searchMedia(searchQuery);
                    setSearchResults(results?.slice(0, 5) || []);
                } else {
                    setSearchResults([]);
                }
                setIsSearching(false); // Stop spinner after fetch
            }, 500); // 500ms debounce
    
            return () => clearTimeout(delayDebounceFn);
        }, [searchQuery]);
    
        // Handle typing
        const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
            if (e.target.value.length > 2) setIsSearching(true); // Start spinner
        };
    
        // 3. Handle Submit
        function onSubmit(values: ReviewFormValues) {
            // 🛡️ Client-Side Guard: Prevent submitting 0 or invalid IDs
            if (!values.tmdb_id || values.tmdb_id === 0) {
                form.setError('tmdb_id', { message: "Please select a movie or show first." });
                return;
            }
    
            const formData = new FormData();
            // Append all fields manually
            formData.append('tmdb_id', values.tmdb_id.toString());
            formData.append('media_type', values.media_type);
            formData.append('rating', values.rating.toString());
            formData.append('watched_on', values.watched_on);
            if (values.content) formData.append('content', values.content);
            if (values.contains_spoilers) formData.append('contains_spoilers', 'on');
            if (values.viewing_method) formData.append('viewing_method', values.viewing_method);
            if (values.viewing_service) formData.append('viewing_service', values.viewing_service);
            if (values.watched_with) formData.append('watched_with', values.watched_with);
            if (values.photo) formData.append('photo', values.photo);
    
            startTransition(async () => {
                const result = await createReview({ message: null }, formData);
                if (result.message === 'Success') {
                    toast.success('Review logged successfully');
                    // Reset everything
                    form.reset();
                    setSelectedMedia(null);
                    setSearchQuery('');
                    setSearchResults([]);
                } else {
                    toast.error(result.message);
                }
            });
        }
    
        // Custom Star Rating
        const StarRating = ({ value, onChange }: { value: number, onChange: (v: number) => void }) => {
            return (
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                            key={star}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "p-1 h-9 w-9 hover:bg-transparent hover:scale-110 transition-transform",
                                star <= value ? "text-yellow-400" : "text-zinc-300 dark:text-zinc-700"
                            )}
                            onClick={() => onChange(star)}
                        >
                            <Star className={cn("w-6 h-6", star <= value && "fill-current")} />
                        </Button>
                    ))}
                </div>
            );
        };
    
        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-4xl mx-auto mt-20">
    
                    {/* --- 1. MEDIA SEARCH SECTION --- */}
                    <div className="space-y-4">
                        <FormLabel>What did you watch?</FormLabel>
    
                        {selectedMedia ? (
                            <div className="flex items-center gap-4 p-4 border rounded-xl bg-muted/30 relative group animate-in fade-in zoom-in-95">
                                {/* Media Preview Card */}
                                <div className="h-16 w-12 bg-zinc-200 dark:bg-zinc-800 rounded flex-shrink-0 relative overflow-hidden">
                                    {selectedMedia.poster_path && (
                                        <img src={`https://image.tmdb.org/t/p/w92${selectedMedia.poster_path}`} className="object-cover w-full h-full" alt="" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">
                                        {selectedMedia.media_type === 'movie'
                                            ? selectedMedia.title
                                            : selectedMedia.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedMedia.media_type === 'movie'
                                            ? selectedMedia.release_date?.split('-')[0]
                                            : selectedMedia.first_air_date?.split('-')[0]}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={() => {
                                        setSelectedMedia(null);
                                        form.setValue('tmdb_id', 0);
                                    }}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="relative group">
                                {/* Search Icon */}
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
    
                                {/* The Input */}
                                <Input
                                    placeholder="Search Movies or TV..."
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    // 🛡️ PREVENT ENTER KEY SUBMISSION
                                    onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                    className="pl-9 pr-12"
                                />
    
                                {/* Right Icons: Spinner & Clear */}
                                <div className="absolute right-3 top-3 flex items-center gap-2">
                                    {isSearching && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {!isSearching && searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                                            className="p-0.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
    
                                {/* Results Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-popover text-popover-foreground rounded-xl border shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                                        {searchResults.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b last:border-0 border-border/50"
                                                onClick={() => {
                                                    setSelectedMedia(item);
                                                    form.setValue('tmdb_id', item.id);
                                                    form.setValue('media_type', item.media_type);
                                                    setSearchQuery('');
                                                    setSearchResults([]);
                                                }}
                                            >
                                                <div className="w-8 h-12 bg-muted rounded-sm flex-shrink-0 overflow-hidden">
                                                    {item.poster_path ? (
                                                        <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt="" className="object-cover w-full h-full" />
                                                    ) : (
                                                        <Film className="w-4 h-4 m-auto mt-4 opacity-50"/>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium leading-tight">
                                                        {item.media_type === 'movie'
                                                            ? item.title
                                                            : item.name}
                                                    </p>

                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-1">
                                                        {item.media_type.toUpperCase()} •
                                                        {' '}
                                                        {item.media_type === 'movie'
                                                            ? item.release_date?.split('-')[0]
                                                            : item.first_air_date?.split('-')[0]}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Hidden Fields */}
                        <input type="hidden" {...form.register('tmdb_id')} />
                        <input type="hidden" {...form.register('media_type')} />
    
                        {/* Error Message */}
                        {form.formState.errors.tmdb_id && (
                            <p className="text-sm font-medium text-destructive animate-in slide-in-from-left-1">
                                {form.formState.errors.tmdb_id.message}
                            </p>
                        )}
                    </div>
    
                    {/* --- 2. RATING & DATE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                        <StarRating value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
    
                        <FormField
                            control={form.control}
                            name="watched_on"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Watched On</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(new Date(field.value), "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
    
                    {/* --- 3. REVIEW CONTENT --- */}
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Thoughts</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Write your review..."
                                        className="resize-none min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
    
                    {/* --- 4. EXTRAS --- */}
                    <FormField
                        control={form.control}
                        name="contains_spoilers"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 shadow-sm">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="cursor-pointer">Contains Spoilers</FormLabel>
                                    <FormDescription>
                                        Blur this review for others by default.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
    
                    {/* --- 5. VIEWING METHOD --- */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="viewing_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="theatre">Theatre</SelectItem>
                                            <SelectItem value="ott">Streaming</SelectItem>
                                            <SelectItem value="bluray">Disc/Physical</SelectItem>
                                            <SelectItem value="broadcast">TV Broadcast</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
    
                        {form.watch('viewing_method') === 'ott' && (
                            <FormField
                                control={form.control}
                                name="viewing_service"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Service</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Platform..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Netflix">Netflix</SelectItem>
                                                <SelectItem value="Prime">Prime Video</SelectItem>
                                                <SelectItem value="Disney+">Disney+</SelectItem>
                                                <SelectItem value="Hulu">Hulu</SelectItem>
                                                <SelectItem value="Max">Max</SelectItem>
                                                <SelectItem value="Apple TV">Apple TV+</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
    
                    {/* --- 6. PHOTO --- */}
                    <FormField
                        control={form.control}
                        name="photo"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                                <FormLabel>Attachment (Ticket/Photo)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            onChange(event.target.files && event.target.files[0]);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
    
                    {/* SUBMIT */}
                    <Button type="submit" className="w-full font-bold" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Spinner />
                                Saving...
                            </>
                        ) : (
                            'Log Review'
                        )}
                    </Button>
                </form>
            </Form>
        );
    }