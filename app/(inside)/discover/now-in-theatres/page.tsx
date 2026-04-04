import { Metadata } from 'next';
import { headers } from 'next/headers';
import { getUser } from '@/lib/supabase/get-user';
import { getNowPlaying } from '@/lib/tmdb/client';
import { HeroBanner, type HeroItem } from '../components/hero-banner';
import { TheatreGrid } from './components/theatre-grid';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { FilmIcon } from '@heroicons/react/24/solid';

export const metadata: Metadata = {
    title: 'Now in Theatres',
    description: 'Movies currently playing in cinemas near you.',
};

export default async function NowInTheatresPage() {
    const headersList = await headers();
    const user = await getUser();

    const geoCountry =
        headersList.get('x-vercel-ip-country') ||
        headersList.get('cf-ipcountry') ||
        'US';

    const region = ((user?.app_metadata?.country as string | undefined) || geoCountry).toUpperCase();
    const isIndia = region === 'IN';

    const nowPlaying = await getNowPlaying(region);
    const items = nowPlaying ?? [];

    const bannerItems: HeroItem[] = items
        .filter((i): i is typeof i & { backdrop_path: string } => !!i.backdrop_path)
        .slice(0, 8)
        .map(i => ({ ...i, inTheatres: true as const }));

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 md:pl-20">
            {/* Floating back button over the hero */}
            <div className="absolute top-4 left-24 z-20 hidden md:block">
                <Link
                    href="/discover"
                    className="flex items-center gap-2 text-xs font-medium text-white/70 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-white/25"
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back to Discover
                </Link>
            </div>

            {/* Full-page cinematic hero */}
            {bannerItems.length > 0 ? (
                <HeroBanner items={bannerItems} />
            ) : (
                <div className="h-48 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                    <div className="text-center">
                        <FilmIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No theatrical releases found for your region.</p>
                    </div>
                </div>
            )}

            {/* Section header */}
            <div className="px-4 md:px-14 pt-10 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">
                        {isIndia ? 'Now Playing in India' : 'Now Playing Near You'}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-1">
                        {items.length} movies currently in cinemas
                    </p>
                </div>
                <Link
                    href="/discover"
                    className="md:hidden flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeftIcon className="w-3.5 h-3.5" />
                    Back
                </Link>
            </div>

            {/* Custom theatre grid */}
            <TheatreGrid items={items} />
        </div>
    );
}
