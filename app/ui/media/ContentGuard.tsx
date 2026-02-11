'use client';

import { useState, useEffect } from 'react';
import { EyeSlashIcon } from '@heroicons/react/24/solid';
import { createClient } from '@/lib/supabase/client'; // Uses Browser Client

export default function ContentGuard({
                                         children,
                                         isAdult
                                     }: {
    children: React.ReactNode;
    isAdult?: boolean;
}) {
    // 1. Default to BLURRED for safety
    const [revealed, setRevealed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAdult) return;

        const checkUserPreference = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            // If user has explicitly set 'all', auto-reveal
            if (user?.user_metadata?.content_preference === 'all') {
                setRevealed(true);
            }
            setIsLoading(false);
        };

        checkUserPreference();
    }, [isAdult]);

    // Fast Path: Not adult content? Show immediately.
    if (!isAdult) return <>{children}</>;

    // If user allowed it (auto-reveal) or clicked show (manual)
    if (revealed) return <>{children}</>;

    return (
        <div className="relative w-full h-full min-h-screen lg:min-h-0 overflow-hidden rounded-md group">
            {/* Blurred Content */}
            <div className="blur-2xl opacity-50 pointer-events-none select-none grayscale transition-opacity duration-500 h-full" aria-hidden="true">
                {children}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 text-center backdrop-blur-md bg-zinc-100/80 dark:bg-black/80">
                <EyeSlashIcon className="w-12 h-12 mb-3 text-zinc-500 dark:text-zinc-400" />

                <p className="text-sm font-bold uppercase tracking-wider mb-1 text-zinc-700 dark:text-zinc-300">
                    Explicit Content
                </p>
                <p className="text-xs text-zinc-500 mb-4">
                    {isLoading ? "Checking permissions..." : "Hidden based on your settings"}
                </p>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setRevealed(true);
                    }}
                    className="px-6 py-2 text-xs font-bold rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-transform active:scale-95 shadow-lg"
                >
                    Show Anyway
                </button>
            </div>
        </div>
    );
}