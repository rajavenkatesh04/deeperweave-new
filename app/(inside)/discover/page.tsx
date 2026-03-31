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
    getTopRatedTV,
    getAnimationMovies,
    getAdultPopular as getPopularAdultContent,
    getRegionalLanguageMovies,
} from '@/lib/tmdb/client';
import { HeroBanner, type HeroItem } from './components/hero-banner';
import { DiscoverRow } from './components/discover-row';

export default async function DiscoverPage() {
    const headersList = await headers();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const geoCountry =
        headersList.get('x-vercel-ip-country') ||
        headersList.get('cf-ipcountry') ||
        'US';

    const region = ((user?.app_metadata?.country as string | undefined) || geoCountry).toUpperCase();
    const isIndia = region === 'IN';
    const showAdult = (user?.app_metadata?.content_preference as string | undefined) === 'all';

    const [
        trendingMovies,
        trendingTV,
        nowPlaying,
        upcoming,
        popularTV,
        topRated,
        topRatedTV,
        animationMovies,
        adultContent,
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
        getTopRatedTV(),
        getAnimationMovies(),
        showAdult ? getPopularAdultContent() : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('ta', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('hi', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('te', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('ml', region) : Promise.resolve([]),
        isIndia ? getRegionalLanguageMovies('kn', region) : Promise.resolve([]),
    ]);

    // Hero: 6 now-playing + 2 coming-soon, all needing a backdrop
    const heroNowPlaying: HeroItem[] = (nowPlaying ?? [])
        .filter((i): i is typeof i & { backdrop_path: string } => !!i.backdrop_path)
        .slice(0, 6)
        .map(i => ({ ...i, inTheatres: true as const }));

    const heroUpcoming: HeroItem[] = (upcoming ?? [])
        .filter((i): i is typeof i & { backdrop_path: string } => !!i.backdrop_path)
        .slice(0, 2)
        .map(i => ({ ...i, inTheatres: false as const }));

    const bannerItems: HeroItem[] = [...heroNowPlaying, ...heroUpcoming];

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full md:pl-20">
            <HeroBanner items={bannerItems} />

            <div className="py-10 space-y-10 pb-8">
                {/* ── India regional ── */}
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

                {/* ── Now Playing ── */}
                {nowPlaying && nowPlaying.length > 0 && (
                    <DiscoverRow
                        title={isIndia ? 'Now Playing in India' : 'Now Playing Near You'}
                        subtitle="Currently in theatres"
                        items={nowPlaying.slice(0, 20)}
                    />
                )}

                {/* ── Trending ── */}
                {trendingMovies && trendingMovies.length > 0 && (
                    <DiscoverRow
                        title="Trending Movies"
                        subtitle="What everyone's watching this week"
                        items={trendingMovies.slice(0, 20)}
                    />
                )}
                {trendingTV && trendingTV.length > 0 && (
                    <DiscoverRow
                        title="Trending TV"
                        subtitle="Popular series right now"
                        items={trendingTV.slice(0, 20)}
                    />
                )}

                {/* ── Coming Soon ── */}
                {upcoming && upcoming.length > 0 && (
                    <DiscoverRow
                        title="Coming Soon"
                        subtitle="Movies hitting theatres soon"
                        items={upcoming.slice(0, 20)}
                    />
                )}

                {/* ── Popular & Top Rated ── */}
                {popularTV && popularTV.length > 0 && (
                    <DiscoverRow
                        title="Popular Shows"
                        subtitle="Top series globally right now"
                        items={popularTV.slice(0, 20)}
                    />
                )}
                {topRated && topRated.length > 0 && (
                    <DiscoverRow
                        title="All-Time Greats"
                        subtitle="Highest rated films ever made"
                        items={topRated.slice(0, 20)}
                    />
                )}
                {topRatedTV && topRatedTV.length > 0 && (
                    <DiscoverRow
                        title="Greatest TV of All Time"
                        subtitle="The series that defined television"
                        items={topRatedTV.slice(0, 20)}
                    />
                )}

                {/* ── Animation ── */}
                {animationMovies && animationMovies.length > 0 && (
                    <DiscoverRow
                        title="Animation"
                        subtitle="From Studio Ghibli to Pixar and beyond"
                        items={animationMovies.slice(0, 20)}
                    />
                )}

                {/* ── Adult (gated) ── */}
                {showAdult && adultContent && adultContent.length > 0 && (
                    <DiscoverRow
                        title="18+"
                        subtitle="Adult content · shown based on your preferences"
                        badge="18+"
                        items={adultContent.slice(0, 20)}
                    />
                )}
            </div>
        </div>
    );
}
