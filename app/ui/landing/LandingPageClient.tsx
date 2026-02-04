'use client';

import LandingNavbar from './LandingNavbar';
import FeatureCarousel from './FeatureCarousel';
import { geistSans } from "@/app/ui/shared/fonts";
import Link from 'next/link';
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function LandingPageClient() {
    return (
        <div className={`min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 ${geistSans.className} overflow-x-hidden`}>
            <LandingNavbar />

            <main className="flex flex-col w-full">
                {/* Full Screen Carousel Section
                   - This component handles its own height (h-[100dvh])
                */}
                <FeatureCarousel />

                {/* FINAL CTA SECTION
                   - Added responsive padding and better text sizing for mobile
                */}
                <section className="relative py-20 px-6 md:py-32 md:px-12 border-t border-zinc-100 dark:border-zinc-900 text-center bg-zinc-50/50 dark:bg-zinc-950/30">
                    <div className="max-w-md mx-auto space-y-8 md:space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                Start Archiving....
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed px-4">
                                Join thousands of cinephiles tracking their journey through film.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                            <Link href="/auth/sign-up" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-zinc-200 dark:shadow-zinc-900/50">
                                Create Account
                            </Link>
                            <Link href="/discover" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 group">
                                Browse Database
                                <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="pt-8">
                            <p className="text-[10px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-[0.2em]">
                                Android • Web
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}