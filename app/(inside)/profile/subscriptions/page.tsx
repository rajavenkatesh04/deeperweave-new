import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/get-user';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { PricingCards } from './PricingCards';
import Link from 'next/link';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    CreditCard,
    Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Subscription } from '@/lib/definitions';

export const metadata: Metadata = {
    title: 'Subscriptions',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function daysUntil(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function formatPrice(paise: number, billingCycle: string) {
    const amount = paise / 100;
    return billingCycle === 'yearly'
        ? `₹${amount}/year (~₹${Math.floor(amount / 12)}/mo)`
        : `₹${amount}/month`;
}

function getTierLabel(tier: string) {
    if (tier === 'auteur') return 'Auteur';
    if (tier === 'cineaste') return 'Cineaste';
    return 'Starter';
}

// ─── Status Card ──────────────────────────────────────────────────────────────

function CurrentPlanCard({
    tier,
    trialUntil,
    activeSub,
}: {
    tier: string;
    trialUntil: string | null;
    activeSub: Subscription | null;
}) {
    const now = new Date();
    const tierLabel = getTierLabel(tier);

    // Determine display state
    const isOnTrial =
        !activeSub &&
        trialUntil !== null &&
        new Date(trialUntil) > now;

    const isPaidActive = activeSub?.status === 'active';
    const isPaidCancelled =
        activeSub?.status === 'cancelled' &&
        activeSub.expires_at !== null &&
        new Date(activeSub.expires_at) > now;

    const isFree = tier === 'free' && !isOnTrial && !isPaidActive && !isPaidCancelled;

    // Status badge config
    let badgeLabel = 'Free';
    let badgeClass = 'border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400';
    if (isOnTrial) {
        badgeLabel = 'Trial';
        badgeClass = 'border-zinc-500 dark:border-zinc-400 text-zinc-700 dark:text-zinc-300';
    } else if (isPaidActive) {
        badgeLabel = 'Active';
        badgeClass = 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100';
    } else if (isPaidCancelled) {
        badgeLabel = 'Cancelled';
        badgeClass = 'border-red-300 dark:border-red-700 text-red-600 dark:text-red-400';
    }

    return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-zinc-50 dark:bg-zinc-900/40 space-y-4">

            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                        Current Plan
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                            {tierLabel}
                        </p>
                        <Badge variant="outline" className={badgeClass}>
                            {badgeLabel}
                        </Badge>
                    </div>

                    {/* Price / billing cycle for paid plans */}
                    {(isPaidActive || isPaidCancelled) && activeSub?.amount_paise && activeSub.billing_cycle && (
                        <p className="text-sm text-zinc-500">
                            {formatPrice(activeSub.amount_paise, activeSub.billing_cycle)}
                        </p>
                    )}
                </div>

                <div className={`shrink-0 size-10 rounded-xl flex items-center justify-center ${
                    isFree
                        ? 'bg-zinc-200 dark:bg-zinc-800'
                        : 'bg-zinc-900 dark:bg-zinc-100'
                }`}>
                    {isFree
                        ? <CheckCircle2 className="size-5 text-zinc-500 dark:text-zinc-400" />
                        : <CheckCircle2 className="size-5 text-white dark:text-zinc-900" />
                    }
                </div>
            </div>

            {/* Status details */}
            {isOnTrial && trialUntil && (
                <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl px-4 py-3">
                    <Clock className="size-4 shrink-0 text-zinc-500" />
                    <span>
                        Trial ends on <strong>{formatDate(trialUntil)}</strong>
                        {' — '}{daysUntil(trialUntil)} day{daysUntil(trialUntil) !== 1 ? 's' : ''} remaining.
                        Upgrade to keep your features.
                    </span>
                </div>
            )}

            {isPaidActive && activeSub?.expires_at && (
                <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl px-4 py-3">
                    <Calendar className="size-4 shrink-0 text-zinc-500" />
                    <span>
                        Renews on <strong>{formatDate(activeSub.expires_at)}</strong>
                    </span>
                </div>
            )}

            {isPaidCancelled && activeSub?.expires_at && (
                <div className="flex items-center gap-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl px-4 py-3">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>
                        Subscription cancelled. Access continues until{' '}
                        <strong>{formatDate(activeSub.expires_at)}</strong>.
                    </span>
                </div>
            )}

            {isFree && (
                <p className="text-sm text-zinc-500">
                    You&apos;re on the free plan. Upgrade below to unlock more sections, items, and upcoming features.
                </p>
            )}

            {/* Started / payment info */}
            {activeSub && !isOnTrial && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1.5">
                        <CreditCard className="size-3" />
                        Started {formatDate(activeSub.started_at)}
                    </span>
                    {activeSub.razorpay_payment_id && (
                        <span className="font-mono">
                            Payment ID: {activeSub.razorpay_payment_id}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Subscription History ──────────────────────────────────────────────────────

function SubscriptionHistory({ history }: { history: Subscription[] }) {
    if (history.length === 0) return null;

    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                History
            </p>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                {history.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between px-4 py-3 gap-4">
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                                {getTierLabel(sub.tier)}
                                {sub.billing_cycle && (
                                    <span className="ml-1.5 text-xs font-normal text-zinc-500">
                                        · {sub.billing_cycle}
                                    </span>
                                )}
                            </p>
                            <p className="text-xs text-zinc-400">
                                {formatDate(sub.started_at)}
                                {sub.expires_at && ` → ${formatDate(sub.expires_at)}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {sub.amount_paise != null && (
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    ₹{sub.amount_paise / 100}
                                </span>
                            )}
                            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                sub.status === 'active'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : sub.status === 'trial'
                                    ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                    : sub.status === 'cancelled'
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}>
                                {sub.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SubscriptionsPage() {
    const [user, supabase] = await Promise.all([getUser(), createClient()]);
    if (!user) redirect('/auth/login');

    const username = user.app_metadata?.username as string | undefined;
    if (!username) redirect('/onboarding');

    const [trialResult, subsResult] = await Promise.all([
        supabase
            .from('profiles')
            .select('trial_until')
            .eq('id', user.id)
            .single(),
        supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
    ]);

    const tier: string = user.app_metadata?.tier ?? 'free';

    // Find the current "live" subscription (active, trial, or cancelled-but-not-expired)
    const allSubs: Subscription[] = (subsResult.data ?? []) as Subscription[];
    const now = new Date();
    const activeSub =
        allSubs.find(
            (s) =>
                s.status === 'active' ||
                s.status === 'trial' ||
                (s.status === 'cancelled' && s.expires_at && new Date(s.expires_at) > now),
        ) ?? null;

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full">
            <div className="w-full max-w-5xl mx-auto pt-8 pb-20 px-4 md:px-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href={`/profile/${username}/home`}
                        className="size-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
                    >
                        <ArrowLeft className="size-4 text-zinc-600 dark:text-zinc-400" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Subscription
                        </h1>
                        <p className="text-sm text-zinc-500">Manage your plan</p>
                    </div>
                </div>

                {/* Current Plan */}
                <div className="mb-10">
                    <CurrentPlanCard
                        tier={tier}
                        trialUntil={trialResult.data?.trial_until}
                        activeSub={activeSub}
                    />
                </div>

                {/* Pricing Cards */}
                <PricingCards
                    currentTier={tier}
                    activeSub={activeSub}
                />

                {/* Subscription History */}
                {allSubs.length > 0 && (
                    <>
                        <Separator className="my-10 bg-zinc-100 dark:bg-zinc-800" />
                        <SubscriptionHistory history={allSubs} />
                    </>
                )}

                {/* Fine Print */}
                <p className="mt-10 text-center text-xs text-zinc-400">
                    Prices in Indian Rupees (₹ INR). Cancel anytime — access continues until the end of your billing period.
                </p>

            </div>
        </div>
    );
}
