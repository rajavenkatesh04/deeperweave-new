'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import {Spinner} from "@/components/ui/spinner";

export default function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Track if we are waiting for the debounce or navigation
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);

        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }

        replace(`${pathname}?${params.toString()}`);
        setIsSearching(false); // Stop spinner once URL is replaced
    }, 500); // ⚡ 500ms: The Sweet Spot (Responsive but efficient)

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsSearching(true); // Start spinner immediately when typing
        handleSearch(e.target.value);
    };

    const clearSearch = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
        setIsSearching(true); // Show spinner briefly while clearing
        handleSearch('');
    };

    // Determine if we should show the "X" (if there is text or a query param)
    const hasQuery = inputRef.current?.value || searchParams.get('q');

    return (
        <div className="relative w-full max-w-4xl mx-auto mb-8 group">
            {/* Left Icon: Magnifying Glass */}
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-zinc-800 dark:group-focus-within:text-zinc-200 transition-colors" />

            <Input
                ref={inputRef}
                className="pl-10 pr-12 h-12 bg-zinc-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-black transition-all text-base rounded-full shadow-sm"
                placeholder="Search movies, members, or directors..."
                onChange={onInputChange}
                defaultValue={searchParams.get('q')?.toString()}
            />

            {/* Right Icons Container */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">

                {/* 1. Loading Spinner (Visible when typing/debouncing) */}
                {isSearching && (
                    <Spinner />
                )}

                {/* 2. Clear Button (Visible when there is text AND not loading) */}
                {!isSearching && hasQuery && (
                    <button
                        onClick={clearSearch}
                        className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                        aria-label="Clear search"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}