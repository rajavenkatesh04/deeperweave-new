import { Metadata } from 'next';
import { headers } from 'next/headers';

export const metadata: Metadata = {
    title: 'Discover',
    description: 'Explore trending movies, TV shows, and people.',
    openGraph: {
        title: 'Discover | DeeperWeave',
        description: 'Explore trending movies, TV shows, and people.',
    },
};
import { createClient } from '@/lib/supabase/server';
import {
    getTrendingMovies,
    getTrendingTV,
    getNowPlaying,
    getUpcoming,
    getPopularTV,
    getTopRatedMovies,
    getRegionalLanguageMovies,
} from '@/lib/tmdb/client';
import { HeroBanner } from './components/hero-banner';
import { DiscoverRow } from './components/discover-row';

export default async function DiscoverPage() {
    // Read geo headers FIRST — this is what opts the route into dynamic rendering.
    const headersList = await headers();

    // Country detection: user app_metadata (primary) → Vercel geo header → fallback US
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const geoCountry =
        headersList.get('x-vercel-ip-country') ||
        headersList.get('cf-ipcountry') ||
        'US';

    const region = ((user?.app_metadata?.country as string | undefined) || geoCountry).toUpperCase();
    const isIndia = region === 'IN';

    // Parallel fetch — all cached 24h, keyed by region where applicable.
    const [
        trendingMovies,
        trendingTV,
        nowPlaying,
        upcoming,
        popularTV,
        topRated,
        tamilMovies,
        hindiMovies,
        teluguMovies,
        malayalamMovies,
        kannadaMovies,
    ] = await Promise.all([
        getTrendingMovies('week'),
        getTrendingTV('week'),
        getNowPlaying(region),
        getUpcoming(region),
        getPopularTV(),
        getTopRatedMovies(),
        isIndia ? getRegionalLanguageMovies('ta', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('hi', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('te', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('ml', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('kn', region) : Promise.resolve([]),
    ]);

    // Hero: movies currently playing in theatres in the user's region
    const bannerItems = (nowPlaying ?? [])
        .filter(i => !!i.backdrop_path)
        .slice(0, 8);

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full md:pl-20">
            <HeroBanner items={bannerItems} />

            <div className="py-10 space-y-10 pb-8">
                {/* ── India regional sections shown first ── */}
                {isIndia && tamilMovies && tamilMovies.length > 0 && (
                    <DiscoverRow
                        title="New Tamil Releases"
                        subtitle="Latest Tamil cinema · last 30 days"
                        badge="Regional"
                        items={tamilMovies.slice(0, 20)}
                    />
                )}
                {isIndia && teluguMovies && teluguMovies.length > 0 && (
                    <DiscoverRow
                        title="New Telugu Releases"
                        subtitle="Latest Telugu cinema · last 30 days"
                        badge="Regional"
                        items={teluguMovies.slice(0, 20)}
                    />
                )}
                {isIndia && malayalamMovies && malayalamMovies.length > 0 && (
                    <DiscoverRow
                        title="New Malayalam Releases"
                        subtitle="Latest Malayalam cinema · last 30 days"
                        badge="Regional"
                        items={malayalamMovies.slice(0, 20)}
                    />
                )}
                {isIndia && kannadaMovies && kannadaMovies.length > 0 && (
                    <DiscoverRow
                        title="New Kannada Releases"
                        subtitle="Latest Kannada cinema · last 30 days"
                        badge="Regional"
                        items={kannadaMovies.slice(0, 20)}
                    />
                )}
                {isIndia && hindiMovies && hindiMovies.length > 0 && (
                    <DiscoverRow
                        title="New Bollywood"
                        subtitle="Fresh Hindi releases · last 30 days"
                        badge="Regional"
                        items={hindiMovies.slice(0, 20)}
                    />
                )}

                {/* ── Global sections ── */}
                {trendingMovies && trendingMovies.length > 0 && (
                    <DiscoverRow
                        title="Trending Movies"
                        subtitle="What everyone's watching this week"
                        items={trendingMovies.slice(0, 20)}
                    />
                )}
                {nowPlaying && nowPlaying.length > 0 && (
                    <DiscoverRow
                        title={isIndia ? 'Now Playing in India' : 'Now Playing Near You'}
                        subtitle="Currently in theatres"
                        items={nowPlaying.slice(0, 20)}
                    />
                )}
                {upcoming && upcoming.length > 0 && (
                    <DiscoverRow
                        title="Coming Soon"
                        subtitle="Movies to look forward to"
                        items={upcoming.slice(0, 20)}
                    />
                )}
                {trendingTV && trendingTV.length > 0 && (
                    <DiscoverRow
                        title="Trending TV"
                        subtitle="Popular series right now"
                        items={trendingTV.slice(0, 20)}
                    />
                )}
                {popularTV && popularTV.length > 0 && (
                    <DiscoverRow
                        title="Popular Shows"
                        subtitle="Top-rated series globally"
                        items={popularTV.slice(0, 20)}
                    />
                )}
                {topRated && topRated.length > 0 && (
                    <DiscoverRow
                        title="All-Time Greats"
                        subtitle="Highest rated films of all time"
                        items={topRated.slice(0, 20)}
                    />
                )}
            </div>
        </div>
    );
}