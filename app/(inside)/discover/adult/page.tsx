import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/get-user';
import {
    getAdultPopular,
    getAdultNewReleases,
    getAdultTopRated,
    getAdultJAV,
    getAdultHentai,
    getAdultWestern,
    getAdultEuropean,
} from '@/lib/tmdb/client';
import { AdultHero } from './components/adult-hero';
import { AdultRow } from './components/adult-row';
import Link from 'next/link';
import { ArrowLeftIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
    title: '18+ · Adult',
    description: 'Adult content. For users 18 and above.',
};

const CATEGORIES = [
    { id: 'trending', label: 'Trending' },
    { id: 'new',      label: 'New' },
    { id: 'jav',      label: 'JAV' },
    { id: 'hentai',   label: 'Hentai' },
    { id: 'western',  label: 'Western' },
    { id: 'european', label: 'European' },
    { id: 'top',      label: 'Top Rated' },
] as const;

export default async function AdultPage() {
    const user = await getUser();

    if (!user) redirect('/auth/login');

    const contentPref = user.app_metadata?.content_preference as string | undefined;
    if (contentPref !== 'all') redirect('/discover');

    const [popular, newReleases, topRated, jav, hentai, western, european] = await Promise.all([
        getAdultPopular(),
        getAdultNewReleases(),
        getAdultTopRated(),
        getAdultJAV(),
        getAdultHentai(),
        getAdultWestern(),
        getAdultEuropean(),
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

            {/* Page header */}
            <div className="px-6 md:px-14 pt-10 pb-8 border-b border-white/5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldExclamationIcon className="w-5 h-5 text-red-500/70" />
                            <h1 className="text-2xl font-light text-white tracking-tight">
                                Adult Content
                            </h1>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-500/15 border border-red-500/30 text-red-400 px-2 py-1 rounded-sm">
                                18+
                            </span>
                        </div>
                        <p className="text-sm text-zinc-500">
                            Adult-flagged titles from TMDB · enabled by your content preferences
                        </p>
                    </div>
                    <Link
                        href="/discover"
                        className="md:hidden flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors mt-1"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" />
                        Back
                    </Link>
                </div>

                {/* Category pills */}
                <div className="flex gap-2 mt-5 flex-wrap">
                    {CATEGORIES.map(c => (
                        <a
                            key={c.id}
                            href={`#${c.id}`}
                            className="text-[11px] font-semibold text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 px-3 py-1.5 rounded-full transition-all duration-200"
                        >
                            {c.label}
                        </a>
                    ))}
                </div>
            </div>

            {allEmpty ? (
                <div className="flex flex-col items-center justify-center py-32 text-center px-6">
                    <ShieldExclamationIcon className="w-14 h-14 text-zinc-800 mb-4" />
                    <p className="text-zinc-400 font-semibold mb-2">No adult content available</p>
                    <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
                        TMDB's adult library requires API key permissions for adult content.
                        If your key supports it, titles will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-10 py-10 pb-24">
                    <AdultRow
                        id="trending"
                        label="Trending"
                        labelColor="red"
                        title="Trending Now"
                        subtitle="Most popular adult titles this week"
                        items={popular ?? []}
                    />

                    <AdultRow
                        id="new"
                        label="New"
                        labelColor="orange"
                        title="Fresh Releases"
                        subtitle="Released in the last 60 days"
                        items={newReleases ?? []}
                    />

                    <AdultRow
                        id="jav"
                        label="JAV"
                        labelColor="rose"
                        title="Japanese Adult Video"
                        subtitle="Japanese live-action adult productions"
                        items={jav ?? []}
                    />

                    <AdultRow
                        id="hentai"
                        label="Hentai"
                        labelColor="violet"
                        title="Hentai · Animated"
                        subtitle="Adult animated features from Japan"
                        items={hentai ?? []}
                    />

                    <AdultRow
                        id="western"
                        label="Western"
                        labelColor="blue"
                        title="Western Adult"
                        subtitle="English-language adult productions"
                        items={western ?? []}
                    />

                    <AdultRow
                        id="european"
                        label="European"
                        labelColor="emerald"
                        title="European"
                        subtitle="Adult productions from Europe"
                        items={european ?? []}
                    />

                    <AdultRow
                        id="top"
                        label="Top Rated"
                        labelColor="amber"
                        title="Highest Rated"
                        subtitle="Top-rated adult titles by TMDB score"
                        items={topRated ?? []}
                    />
                </div>
            )}
        </div>
    );
}
