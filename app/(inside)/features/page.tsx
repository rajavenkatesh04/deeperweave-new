import type { Metadata } from 'next';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Sparkles,
    Film,
    Layers,
    BarChart3,
    PenLine,
    Users,
    List,
    Star,
} from 'lucide-react';
import {
    WatchHistoryMockup,
    AnalyticsMockup,
    BlogMockup,
    ListsMockup,
    PodiumMockup,
    DiscoveryMockup,
} from '@/app/ui/landing/FeatureMockups';
import { dmSerif } from '@/app/ui/shared/fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Features — DeeperWeave' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: 'auteur' | 'cineaste' | 'free' }) {
    if (tier === 'free') {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                Free
            </span>
        );
    }
    if (tier === 'auteur') {
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                <Sparkles className="size-2.5" />
                Auteur
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
            <Sparkles className="size-2.5" />
            Cineaste
        </span>
    );
}

// ─── Feature Overview Cards ────────────────────────────────────────────────────

const OVERVIEW_FEATURES = [
    {
        icon: <Film className="size-5" />,
        label: 'Track',
        desc: 'Log every film, show, and anime. Rate with halves, record your viewing method, and track rewatches.',
        tier: 'free' as const,
    },
    {
        icon: <Layers className="size-5" />,
        label: 'Curate your profile',
        desc: 'Pin your favorites into profile sections — by genre, decade, director, or mood. Up to 10 sections on Cineaste.',
        tier: 'free' as const,
    },
    {
        icon: <List className="size-5" />,
        label: 'Build lists',
        desc: 'Rank, annotate, and share custom collections. Public or private, ranked or unranked.',
        tier: 'free' as const,
    },
    {
        icon: <Users className="size-5" />,
        label: 'Connect',
        desc: 'Follow critics and obsessives whose taste you trust. Discover films through people, not algorithms.',
        tier: 'free' as const,
    },
    {
        icon: <PenLine className="size-5" />,
        label: 'Publish',
        desc: 'A full rich-text editor for long-form reviews, essays, and director deep-dives. Your corner of the film internet.',
        tier: 'auteur' as const,
    },
    {
        icon: <BarChart3 className="size-5" />,
        label: 'Analytics',
        desc: 'Watch time, platform breakdown, activity heatmap. Understand your taste the way a director understands their work.',
        tier: 'cineaste' as const,
    },
];

// ─── Plan Comparison ──────────────────────────────────────────────────────────

const PLANS = [
    { name: 'Starter', price: 'Free', sub: 'forever' },
    { name: 'Auteur', price: '₹79', sub: '/mo' },
    { name: 'Cineaste', price: '₹149', sub: '/mo' },
];

type PlanKey = 'starter' | 'auteur' | 'cineaste';

const COMPARE_ROWS: { label: string; values: Record<PlanKey, string | boolean> }[] = [
    { label: 'Reviews & ratings',      values: { starter: true,  auteur: true,  cineaste: true  } },
    { label: 'Custom lists',           values: { starter: true,  auteur: true,  cineaste: true  } },
    { label: 'Save films & shows',     values: { starter: true,  auteur: true,  cineaste: true  } },
    { label: 'Social — follow & feed', values: { starter: true,  auteur: true,  cineaste: true  } },
    { label: 'Profile sections',       values: { starter: '2',   auteur: '3',   cineaste: '10'  } },
    { label: 'Items per section',      values: { starter: '3',   auteur: '3',   cineaste: '6'   } },
    { label: 'Blog publishing',        values: { starter: false, auteur: true,  cineaste: true  } },
    { label: 'Profile banner',         values: { starter: false, auteur: true,  cineaste: true  } },
    { label: 'Analytics dashboard',    values: { starter: false, auteur: false, cineaste: true  } },
    { label: 'Verified badge',         values: { starter: false, auteur: false, cineaste: true  } },
];

function CompareCell({ value }: { value: string | boolean }) {
    if (typeof value === 'boolean') {
        return value
            ? <Check className="size-4 mx-auto text-zinc-900 dark:text-zinc-100" />
            : <span className="block w-3 h-px bg-zinc-300 dark:bg-zinc-700 mx-auto" />;
    }
    return <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</span>;
}

// ─── Showcase Section ─────────────────────────────────────────────────────────

function ShowcaseSection({
    reverse,
    tier,
    label,
    headline,
    body,
    points,
    mockup,
}: {
    reverse?: boolean;
    tier: 'free' | 'auteur' | 'cineaste';
    label: string;
    headline: string;
    body: string;
    points: string[];
    mockup: React.ReactNode;
}) {
    return (
        <div className={cn(
            'grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center py-16 md:py-24',
            'border-t border-zinc-100 dark:border-zinc-900',
        )}>
            {/* Text */}
            <div className={cn('space-y-6', reverse && 'md:order-2')}>
                <div className="flex items-center gap-2">
                    <TierBadge tier={tier} />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</span>
                </div>
                <h2 className={cn(
                    'text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight',
                    dmSerif.className,
                )}>
                    {headline}
                </h2>
                <p className="text-base text-zinc-500 leading-relaxed">{body}</p>
                <ul className="space-y-3">
                    {points.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                            <Check className="size-4 mt-0.5 shrink-0 text-zinc-400" />
                            {p}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mockup */}
            <div className={cn(
                'relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 overflow-hidden h-[340px] md:h-[420px] p-4',
                reverse && 'md:order-1',
            )}>
                {mockup}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pb-24">

                {/* Back nav */}
                <div className="pt-8 mb-14">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        Back to home
                    </Link>
                </div>

                {/* ── Hero ──────────────────────────────────────────────── */}
                <section className="text-center mb-20 space-y-6 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-1.5">
                        <Star className="size-3" />
                        Built for people who take film seriously
                    </div>
                    <h1 className={cn(
                        'text-5xl md:text-6xl font-bold text-zinc-900 dark:text-zinc-100 leading-[1.1] tracking-tight',
                        dmSerif.className,
                    )}>
                        Cinema is personal.{' '}
                        <span className="text-zinc-400 dark:text-zinc-600">
                            Your profile should be too.
                        </span>
                    </h1>
                    <p className="text-lg text-zinc-500 leading-relaxed max-w-xl mx-auto">
                        DeeperWeave gives serious film lovers the tools to curate their taste,
                        publish their voice, and connect with people who actually get it.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                            href="/auth/sign-up"
                            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Start for free
                        </Link>
                        <Link
                            href="/subscribe"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                        >
                            See pricing
                            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </section>

                {/* ── Feature Overview Grid ─────────────────────────────── */}
                <section className="mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {OVERVIEW_FEATURES.map((f, i) => (
                            <div
                                key={i}
                                className="flex flex-col gap-3 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="size-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                                        {f.icon}
                                    </div>
                                    <TierBadge tier={f.tier} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">{f.label}</p>
                                    <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Showcase Sections ─────────────────────────────────── */}

                <ShowcaseSection
                    tier="free"
                    label="Track"
                    headline="Log every frame you watch."
                    body="Reviews aren't just stars. Record your viewing method, mark rewatches, flag spoilers, and leave the kind of note you'll actually want to read a year from now."
                    points={[
                        'Half-star ratings for when 4 just isn\'t enough',
                        'Log viewing method — IMAX, streaming, theatrical, home',
                        'Rewatch tracking with per-watch notes',
                        'Spoiler-safe review sharing',
                    ]}
                    mockup={<WatchHistoryMockup />}
                />

                <ShowcaseSection
                    reverse
                    tier="free"
                    label="Identity"
                    headline="A profile that reflects your taste."
                    body="Not a generic watchlist. Profile sections let you pin what defines your cinema — your top directors, the films that changed you, the shows you'd restart today."
                    points={[
                        'Sections for films, shows, or people — your choice',
                        'Reorder and rename everything',
                        'Private items only you can see',
                        '10 sections and 6 items each on Cineaste',
                    ]}
                    mockup={<PodiumMockup />}
                />

                <ShowcaseSection
                    tier="free"
                    label="Curate"
                    headline="Every great collection starts with a list."
                    body="Ranked, annotated, public or private. Build the definitive Cyberpunk list, your comfort films, your festival watchlist. Lists you'd actually share."
                    points={[
                        'Unlimited custom lists',
                        'Per-item notes and privacy toggles',
                        'Public lists discoverable by other members',
                        'Link lists to your profile sections',
                    ]}
                    mockup={<ListsMockup />}
                />

                <ShowcaseSection
                    reverse
                    tier="auteur"
                    label="Publish"
                    headline="Write the review you actually want to read."
                    body="A full rich-text editor for long-form reviews, director retrospectives, and essay-length takes. Not a text box — a proper writing environment for cinema writing."
                    points={[
                        'Rich text editor with image support',
                        'Spoiler and premium content gates',
                        'Associated media — tie posts to a film or director',
                        'Full blog on your profile',
                    ]}
                    mockup={<BlogMockup />}
                />

                <ShowcaseSection
                    tier="cineaste"
                    label="Analytics"
                    headline="Understand your taste at a glance."
                    body="Watch time, platform breakdown, activity heatmap. The kind of stats that make you realize you've spent more time with Kubrick than with most people you know."
                    points={[
                        'Total watch time across films and shows',
                        'Platform breakdown — where you actually watch',
                        'Activity heatmap by week and month',
                        'Taste match with people you follow',
                    ]}
                    mockup={<AnalyticsMockup />}
                />

                <ShowcaseSection
                    reverse
                    tier="free"
                    label="Discover"
                    headline="Find films through people, not algorithms."
                    body="Trending lists, curated picks, and what the people you follow are watching right now. Discovery that comes from taste, not engagement metrics."
                    points={[
                        'Trending by country and genre',
                        'Curated lists from members you follow',
                        'TMDB-backed database of films, shows, and people',
                        'Localized — what\'s actually popular in India',
                    ]}
                    mockup={<DiscoveryMockup />}
                />

                {/* ── Plan Comparison ───────────────────────────────────── */}
                <section className="pt-16 md:pt-24 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="text-center mb-10 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Plans</p>
                        <h2 className={cn(
                            'text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100',
                            dmSerif.className,
                        )}>
                            Start free. Upgrade when you&apos;re ready.
                        </h2>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-widest text-zinc-400 w-1/2">
                                        Feature
                                    </th>
                                    {PLANS.map((p) => (
                                        <th key={p.name} className="text-center px-4 py-4">
                                            <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.name}</span>
                                            <span className="block text-xs text-zinc-500 mt-0.5">
                                                <span className="font-semibold">{p.price}</span>{p.sub}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {COMPARE_ROWS.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-zinc-100 dark:border-zinc-900 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
                                            {row.label}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <CompareCell value={row.values.starter} />
                                        </td>
                                        <td className="px-4 py-3.5 text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                                            <CompareCell value={row.values.auteur} />
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <CompareCell value={row.values.cineaste} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/subscribe"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity group"
                        >
                            <Sparkles className="size-4" />
                            View full pricing
                            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </section>

                {/* ── Final CTA ─────────────────────────────────────────── */}
                <section className="mt-24 text-center space-y-6 py-16 border-t border-zinc-100 dark:border-zinc-900">
                    <h2 className={cn(
                        'text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight',
                        dmSerif.className,
                    )}>
                        Your watchlist is not your identity.
                        <br />
                        <span className="text-zinc-400 dark:text-zinc-600">DeeperWeave is.</span>
                    </h2>
                    <p className="text-base text-zinc-500 max-w-md mx-auto leading-relaxed">
                        Free forever for the essentials. Upgrade to Auteur or Cineaste
                        when your taste demands more room.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/auth/sign-up"
                            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
                        >
                            Create free account
                        </Link>
                        <Link
                            href="/subscribe"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-zinc-200 dark:border-zinc-800 text-sm font-semibold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                        >
                            See pricing
                            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                    <p className="text-xs text-zinc-400 pt-2">
                        No credit card required · Prices in ₹ INR · Cancel anytime
                    </p>
                </section>

            </div>
        </div>
    );
}
