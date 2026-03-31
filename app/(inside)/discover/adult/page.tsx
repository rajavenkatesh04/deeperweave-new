import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
    getAdultPopular,
    getAdultNewReleases,
    getAdultTopRated,
    getTrendingPeople,
} from '@/lib/tmdb/client';
import { AdultHero } from './components/adult-hero';
import { PosterGrid } from './components/poster-grid';
import { StarsRow } from './components/stars-row';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';

export const metadata: Metadata = {
    title: '18+ · Adult',
    description: 'Adult content. For users 18 and above.',
};

export default async function AdultPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const contentPref = user.app_metadata?.content_preference as string | undefined;
    if (contentPref !== 'all') redirect('/discover');

    const [popular, newReleases, topRated, trendingPeople] = await Promise.all([
        getAdultPopular(),
        getAdultNewReleases(),
        getAdultTopRated(),
        getTrendingPeople(),
    ]);

    const heroItems = (popular ?? [])
        .filter(i => !!i.backdrop_path)
        .slice(0, 8);

    const allEmpty = !popular?.length && !newReleases?.length && !topRated?.length;

    return (
        <div className="min-h-screen bg-zinc-950 text-white md:pl-20">
            {/* Floating back */}
            <div className="absolute top-4 left-24 z-20 hidden md:block">
                <Link
                    href="/discover"
                    className="flex items-center gap-2 text-xs font-medium text-white/60 hover:text-white transition-colors bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25"
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back to Discover
                </Link>
            </div>

            {/* Cinematic hero */}
            {heroItems.length > 0 && <AdultHero items={heroItems} />}

            {/* Section header */}
            <div className="px-4 md:px-14 pt-10 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        Adult Content
                        <span className="text-[11px] font-bold uppercase tracking-widest bg-red-500/15 border border-red-500/30 text-red-400 px-2 py-1 rounded-sm">18+</span>
                    </h1>
                    <p className="text-sm text-zinc-600 mt-1">
                        Adult-flagged titles from TMDB · enabled by your account preferences
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldExclamationIcon className="w-4 h-4 text-red-500/50" />
                    <Link
                        href="/discover"
                        className="md:hidden text-xs font-medium text-zinc-500 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        Back
                    </Link>
                </div>
            </div>

            {allEmpty ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <ShieldExclamationIcon className="w-14 h-14 text-zinc-800 mb-4" />
                    <p className="text-zinc-400 font-semibold mb-2">No adult content available</p>
                    <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
                        TMDB's adult library is gated behind API key permissions. If your key supports adult content, movies will appear here. Contact support for help.
                    </p>
                </div>
            ) : (
                <div className="space-y-12 pb-20">
                    {/* Trending stars */}
                    {trendingPeople && trendingPeople.length > 0 && (
                        <StarsRow people={trendingPeople} />
                    )}

                    {/* Most popular — dense poster grid */}
                    {popular && popular.length > 0 && (
                        <PosterGrid
                            title="Most Popular"
                            subtitle="Top adult titles ranked by popularity"
                            items={popular}
                        />
                    )}

                    {/* New releases */}
                    {newReleases && newReleases.length > 0 && (
                        <PosterGrid
                            title="New Releases"
                            subtitle="Released in the last 60 days"
                            items={newReleases}
                        />
                    )}

                    {/* Top rated */}
                    {topRated && topRated.length > 0 && (
                        <PosterGrid
                            title="Top Rated"
                            subtitle="Highest rated adult titles on TMDB"
                            items={topRated}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
