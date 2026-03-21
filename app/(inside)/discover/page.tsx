
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import {
    getTrendingAll,
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
        heroItems,
        trendingMovies,
        trendingTV,
        nowPlaying,
        upcoming,
        popularTV,
        topRated,
        tamilMovies,
        hindiMovies,
    ] = await Promise.all([
        getTrendingAll('week'),
        getTrendingMovies('week'),
        getTrendingTV('week'),
        getNowPlaying(region),
        getUpcoming(region),
        getPopularTV(),
        getTopRatedMovies(),
        isIndia ? getRegionalLanguageMovies('ta', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('hi', region) : Promise.resolve([]),
    ]);

    // Hero: top 8 trending items that have a backdrop image
    const bannerItems = (heroItems ?? [])
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