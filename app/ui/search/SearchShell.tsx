'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Search, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

// ─── Skeleton Cards ──────────────────────────────────────────────────────────

function MediaCardSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="w-full aspect-[2/3] rounded-xl" />
            <Skeleton className="h-3.5 w-4/5 rounded" />
            <Skeleton className="h-3 w-2/5 rounded" />
        </div>
    );
}

function UserCardSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 rounded-xl">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-3 w-24 rounded" />
            </div>
        </div>
    );
}

function SearchSkeleton({ type }: { type: string }) {
    const showMedia = type === 'all' || type === 'media';
    const showUsers = type === 'all' || type === 'users';

    return (
        <div className="space-y-10">
            {showUsers && (
                <section className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)}
                    </div>
                </section>
            )}
            {showMedia && (
                <section className="space-y-4">
                    <Skeleton className="h-4 w-20 rounded" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {Array.from({ length: 10 }).map((_, i) => <MediaCardSkeleton key={i} />)}
                    </div>
                </section>
            )}
        </div>
    );
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function SearchShell({
    query,
    type,
    children,
}: {
    query: string;
    type: string;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputHasValue, setInputHasValue] = useState(!!query);

    const navigate = (q: string, t: string) => {
        const params = new URLSearchParams(searchParams);
        if (q) params.set('q', q);
        else params.delete('q');
        params.set('type', t);
        startTransition(() => router.replace(`/search?${params.toString()}`));
    };

    const handleSearch = useDebouncedCallback((term: string) => {
        navigate(term, searchParams.get('type') ?? 'all');
    }, 400);

    const handleTabChange = (value: string) => {
        navigate(searchParams.get('q') ?? '', value);
    };

    const clearSearch = () => {
        if (inputRef.current) inputRef.current.value = '';
        setInputHasValue(false);
        navigate('', searchParams.get('type') ?? 'all');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

            {/* ── Search Input ── */}
            <div className="relative group">
                <Search
                    className={cn(
                        'absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors',
                        isPending
                            ? 'text-zinc-900 dark:text-zinc-100'
                            : 'text-zinc-400 group-focus-within:text-zinc-700 dark:group-focus-within:text-zinc-300'
                    )}
                />
                <Input
                    ref={inputRef}
                    defaultValue={query}
                    onChange={(e) => {
                        setInputHasValue(!!e.target.value);
                        handleSearch(e.target.value);
                    }}
                    placeholder="Search movies, shows, people, members…"
                    className="h-14 pl-12 pr-12 text-base rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-transparent focus-visible:ring-0 focus-visible:border-zinc-300 dark:focus-visible:border-zinc-700 focus-visible:bg-white dark:focus-visible:bg-zinc-950 transition-all shadow-sm"
                />
                {(inputHasValue || query) && !isPending && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                        aria-label="Clear"
                    >
                        <X className="size-4" />
                    </button>
                )}
                {isPending && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Spinner className="text-zinc-500" />
                    </div>
                )}
            </div>

            {/* ── Tabs ── */}
            {query && (
                <Tabs value={type} onValueChange={handleTabChange}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="media">Movies & TV</TabsTrigger>
                        <TabsTrigger value="users">Members</TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            {/* ── Content ── */}
            {isPending && query ? (
                <SearchSkeleton type={type} />
            ) : (
                children
            )}
        </div>
    );
}
