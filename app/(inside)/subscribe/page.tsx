import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/get-user';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock } from 'lucide-react';
import { Subscription } from '@/lib/definitions';
import { SubscribePricingCards } from './SubscribePricingCards';

export const metadata: Metadata = {
    title: 'Upgrade your plan',
};

function daysUntil(iso: string) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default async function SubscribePage() {
    const user = await getUser();

    let tier = 'free';
    let username: string | undefined;
    let activeSub: Subscription | null = null;
    let trialUntil: string | null = null;

    if (user) {
        username = user.app_metadata?.username as string | undefined;
        if (!username) redirect('/onboarding');

        tier = user.app_metadata?.tier ?? 'free';

        const supabase = await createClient();
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

        const allSubs: Subscription[] = (subsResult.data ?? []) as Subscription[];
        const now = new Date();
        activeSub =
            allSubs.find(
                (s) =>
                    s.status === 'active' ||
                    s.status === 'trial' ||
                    (s.status === 'cancelled' && s.expires_at && new Date(s.expires_at) > now),
            ) ?? null;

        trialUntil = trialResult.data?.trial_until ?? null;
    }

    const now = new Date();
    const isOnTrial = !activeSub && trialUntil !== null && new Date(trialUntil) > now;
    const trialDaysLeft = trialUntil ? daysUntil(trialUntil) : 0;

    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full">
            <div className="w-full max-w-5xl mx-auto pt-8 pb-24 px-4 md:px-6">

                {/* Back nav */}
                <div className="mb-12">
                    <Link
                        href={username ? `/profile/${username}/home` : '/'}
                        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="size-4" />
                        {username ? 'Back to profile' : 'Back to home'}
                    </Link>
                </div>

                {/* Hero */}
                <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Build your film identity
                    </h1>
                    <p className="text-lg text-zinc-500 leading-relaxed">
                        DeeperWeave is the platform for film lovers who take their taste seriously.
                        Curate your profile, write reviews, and connect with a community that goes deeper.
                    </p>

                    {/* Trial banner */}
                    {isOnTrial && trialUntil && (
                        <div className="inline-flex items-center gap-2 text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2 text-zinc-700 dark:text-zinc-300">
                            <Clock className="size-4 shrink-0 text-zinc-400" />
                            <span>
                                Your Auteur trial ends in{' '}
                                <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong>
                                {' '}— expires {formatDate(trialUntil)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Pricing */}
                <SubscribePricingCards currentTier={tier} activeSub={activeSub} />

                {/* Fine print */}
                <p className="mt-12 text-center text-xs text-zinc-400">
                    Prices in Indian Rupees (₹ INR) · Cancel anytime · Access continues until end of billing period
                </p>

            </div>
        </div>
    );
}
