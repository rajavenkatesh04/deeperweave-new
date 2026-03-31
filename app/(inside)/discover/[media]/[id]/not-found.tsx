'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FilmIcon,
    ArrowLeft,
    TriangleAlert,
    LifeBuoy,
    Search,
    Compass
} from 'lucide-react';
import { PlayWriteNewZealandFont } from "@/app/ui/shared/fonts";

export default function MediaNotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">

            <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white dark:bg-black border-2 border-amber-200 dark:border-amber-900/50 shadow-2xl overflow-hidden rounded-2xl">

                {/* 1. VISUAL COLUMN */}
                <div className="relative w-full md:w-5/12 h-32 md:h-auto md:min-h-[500px] flex flex-col items-center justify-center bg-zinc-900 text-white p-4 md:p-8 text-center overflow-hidden border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">

                    <div className="absolute inset-0 opacity-20 pointer-events-none"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-900/40" />

                    <div className="relative z-10 flex md:flex-col items-center gap-4 md:gap-0">
                        <div className="w-12 h-12 md:w-32 md:h-32 md:mb-6 flex items-center justify-center rounded-full bg-zinc-800/50 border border-amber-500/30 shadow-inner backdrop-blur-md">
                            <FilmIcon className="w-6 h-6 md:w-16 md:h-16 text-amber-500" strokeWidth={1.5} />
                        </div>

                        <div className="text-left md:text-center">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-2xl md:text-4xl font-bold tracking-tight text-white`}>
                                Not in the Reel
                            </h2>
                            <p className="text-amber-200/80 text-xs md:text-base font-medium italic hidden md:block mt-2">
                                "We couldn't find this in our catalogue."
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. CONTENT COLUMN */}
                <div className="flex-1 p-6 md:p-12 flex flex-col justify-center bg-white dark:bg-black">

                    <div className="mb-6 md:mb-8">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200 dark:border-amber-900/30">
                            <TriangleAlert className="w-3.5 h-3.5" />
                            404 · Not Found
                        </div>

                        <h1 className="text-xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2 md:mb-4">
                            This title couldn't be found
                        </h1>

                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 md:mb-6">
                            The movie, show, or person you're looking for doesn't exist in our catalogue — the ID may be invalid or the entry may have been removed.
                        </p>

                        <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                            <h3 className="text-[10px] md:text-xs font-bold uppercase text-zinc-400 mb-2 tracking-wide">
                                What you can try:
                            </h3>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                                    <Search className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>Search for the title using the Search page.</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs md:text-sm text-zinc-700 dark:text-zinc-300">
                                    <Compass className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>Browse trending titles on Discover.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                        <Link
                            href="/discover"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs md:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
                        >
                            <Compass className="w-4 h-4" />
                            <span className="hidden sm:inline">Go to Discover</span>
                            <span className="sm:hidden">Discover</span>
                        </Link>

                        <button
                            onClick={() => router.back()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs md:text-sm font-bold rounded-xl transition-all active:scale-[0.98] hover:border-amber-300 dark:hover:border-amber-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Go Back</span>
                        </button>
                    </div>

                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-center md:justify-start">
                        <a href="mailto:support@deeperweave.com" className="group flex items-center gap-2 text-[10px] md:text-xs font-medium text-zinc-400 hover:text-amber-600 transition-colors">
                            <LifeBuoy className="w-3.5 h-3.5" />
                            Need help? Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
