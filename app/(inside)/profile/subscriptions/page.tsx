import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { PricingCards } from './PricingCards';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
    title: 'Subscriptions',
};

function getTierLabel(tier: string) {
    if (tier === 'auteur') return 'Auteur';
    if (tier === 'cineaste') return 'Cineaste';
    return 'Starter';
}

export default async function SubscriptionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('tier, trial_until, username')
        .eq('id', user.id)
        .single();

    if (error || !profile) redirect('/onboarding');

    const tier: string = profile.tier ?? user.app_metadata?.tier ?? 'free';
    const tierLabel = getTierLabel(tier);

    const trialUntil = profile.trial_until ? new Date(profile.trial_until) : null;
    const now = new Date();
    const isOnTrial = trialUntil !== null && trialUntil > now;
    const trialDaysLeft = isOnTrial
        ? Math.ceil((trialUntil!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full">
            <div className="w-full max-w-5xl mx-auto pt-8 pb-20 px-4 md:px-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <Link
                        href={`/profile/${profile.username}/home`}
                        className="size-9 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
                    >
                        <ArrowLeft className="size-4 text-zinc-600 dark:text-zinc-400" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Subscription</h1>
                        <p className="text-sm text-zinc-500">Manage your plan and billing</p>
                    </div>
                </div>

                {/* Current Plan Card */}
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 mb-10 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Current Plan</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{tierLabel}</p>
                                {isOnTrial && (
                                    <Badge variant="outline" className="border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 text-xs">
                                        Trial
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="shrink-0 size-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center">
                            <CheckCircle2 className="size-5 text-white dark:text-zinc-900" />
                        </div>
                    </div>

                    {isOnTrial && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl px-4 py-3">
                            <Clock className="size-4 shrink-0" />
                            <span>
                                Your trial ends in <strong className="text-zinc-900 dark:text-zinc-100">{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong>. Upgrade to keep your features.
                            </span>
                        </div>
                    )}

                    {tier === 'free' && (
                        <p className="mt-3 text-sm text-zinc-500">
                            You&apos;re on the free plan. Upgrade to unlock more sections, items, and upcoming features.
                        </p>
                    )}
                </div>

                {/* Pricing Cards */}
                <PricingCards currentTier={tier} />

                {/* Fine Print */}
                <p className="mt-10 text-center text-xs text-zinc-400">
                    Prices listed in Indian Rupees (₹). You can cancel at any time.
                    Features revert to your plan&apos;s limits upon cancellation.
                </p>

            </div>
        </div>
    );
}