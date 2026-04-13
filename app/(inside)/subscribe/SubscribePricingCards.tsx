'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { Subscription, SUBSCRIPTION_PRICING } from '@/lib/definitions';
import { initiateCheckout } from '@/lib/actions/subscription-actions';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    currentTier: string;
    activeSub: Subscription | null;
}

type PaidPlan = 'auteur' | 'cineaste';

// ─── Feature list ─────────────────────────────────────────────────────────────

type Feature = { label: string; comingSoon?: boolean };

const FREE_FEATURES: Feature[] = [
    { label: '2 profile sections' },
    { label: '3 items per section' },
    { label: 'Write & publish reviews' },
    { label: 'Save movies & shows' },
    { label: 'Custom lists' },
    { label: 'Follow & connect with members' },
];

const AUTEUR_FEATURES: Feature[] = [
    { label: '3 profile sections' },
    { label: '3 items per section' },
    { label: 'Everything in Starter' },
    { label: 'Blog posts', comingSoon: true },
    { label: 'Profile banner', comingSoon: true },
    { label: 'Priority support', comingSoon: true },
];

const CINEASTE_FEATURES: Feature[] = [
    { label: '10 profile sections' },
    { label: '6 items per section' },
    { label: 'Everything in Auteur' },
    { label: 'Verified badge', comingSoon: true },
    { label: 'Analytics dashboard', comingSoon: true },
    { label: 'Early access to new features', comingSoon: true },
];

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
    title,
    price,
    period,
    sub,
    description,
    features,
    isCurrent,
    canUpgrade,
    highlighted,
    badge,
    onUpgrade,
    isPending,
}: {
    title: string;
    price: string;
    period?: string;
    sub?: string | null;
    description: string;
    features: Feature[];
    isCurrent: boolean;
    canUpgrade: boolean;
    highlighted?: boolean;
    badge?: string;
    onUpgrade?: () => void;
    isPending?: boolean;
}) {
    return (
        <div
            className={cn(
                'relative flex flex-col rounded-2xl border p-7 transition-all duration-200',
                highlighted
                    ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-xl'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30',
            )}
        >
            {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                        <Sparkles className="size-3" />
                        {badge}
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="mb-7">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-3">
                    {title}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">{price}</span>
                    {period && (
                        <span className="text-sm text-zinc-500">{period}</span>
                    )}
                </div>
                {sub && (
                    <p className="text-xs text-zinc-400">{sub}</p>
                )}
                <p className="text-sm text-zinc-500 mt-3 leading-relaxed">{description}</p>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3.5 mb-8">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <Check className="size-4 shrink-0 text-zinc-900 dark:text-zinc-100" />
                        <span
                            className={cn(
                                'text-zinc-700 dark:text-zinc-300',
                                f.comingSoon && 'text-zinc-400 dark:text-zinc-600',
                            )}
                        >
                            {f.label}
                            {f.comingSoon && (
                                <span className="ml-1.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                                    soon
                                </span>
                            )}
                        </span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            {canUpgrade ? (
                <Button
                    className={cn(
                        'w-full rounded-xl font-semibold h-11',
                        highlighted
                            ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white'
                            : '',
                    )}
                    variant={highlighted ? 'default' : 'outline'}
                    onClick={onUpgrade}
                    disabled={isPending}
                >
                    {isPending ? <Spinner className="size-4" /> : `Get ${title}`}
                </Button>
            ) : (
                <Button
                    variant="outline"
                    className="w-full rounded-xl font-medium h-11"
                    disabled
                >
                    {isCurrent ? 'Current Plan' : `Get ${title}`}
                </Button>
            )}
        </div>
    );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
    {
        q: 'Can I cancel anytime?',
        a: 'Yes. Cancel anytime and keep access until the end of your billing period. No questions asked.',
    },
    {
        q: 'What happens when my trial ends?',
        a: 'You automatically revert to the free Starter plan. Your data stays safe — nothing is deleted.',
    },
    {
        q: 'Is there a difference between monthly and yearly?',
        a: 'Yearly billing saves you ~15% compared to paying month by month.',
    },
    {
        q: 'When will payments go live?',
        a: "We're finalizing Razorpay integration. You'll be notified the moment it's ready.",
    },
];

function FAQ() {
    return (
        <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{item.q}</p>
                    <p className="text-sm text-zinc-500 leading-relaxed">{item.a}</p>
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function SubscribePricingCards({ currentTier, activeSub }: Props) {
    const router = useRouter();
    const [isYearly, setIsYearly] = useState(true);
    const [pendingPlan, setPendingPlan] = useState<PaidPlan | null>(null);
    const [, startTransition] = useTransition();

    const getPrice = (plan: PaidPlan) => {
        const data = SUBSCRIPTION_PRICING[plan];
        if (isYearly) {
            return {
                main: `₹${data.yearly}`,
                period: '/year',
                sub: `₹${Math.floor(data.yearly / 12)}/mo billed yearly`,
            };
        }
        return { main: `₹${data.monthly}`, period: '/mo', sub: null };
    };

    const auteurPrice = getPrice('auteur');
    const cineastePrice = getPrice('cineaste');

    const isCancelledPaid =
        activeSub?.status === 'cancelled' &&
        activeSub.expires_at !== null &&
        new Date(activeSub.expires_at) > new Date();

    function handleUpgrade(plan: PaidPlan) {
        setPendingPlan(plan);
        startTransition(async () => {
            try {
                const result = await initiateCheckout(plan, isYearly ? 'yearly' : 'monthly');
                setPendingPlan(null);
                if ('comingSoon' in result) {
                    toast.info('Payments coming soon', {
                        description: "We're setting up payments. You'll be notified when it's ready!",
                    });
                    return;
                }
            } catch {
                setPendingPlan(null);
                router.push(`/auth/login?next=/subscribe`);
            }
        });
    }

    return (
        <div className="space-y-16">

            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 gap-1">
                    {(['monthly', 'yearly'] as const).map((cycle) => (
                        <button
                            key={cycle}
                            onClick={() => setIsYearly(cycle === 'yearly')}
                            className={cn(
                                'px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2',
                                (cycle === 'yearly') === isYearly
                                    ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-800'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
                            )}
                        >
                            {cycle === 'yearly' ? 'Yearly' : 'Monthly'}
                            {cycle === 'yearly' && (
                                <span className="text-[10px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-0.5 rounded-full">
                                    −15%
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">

                {/* Starter */}
                <PlanCard
                    title="Starter"
                    price="Free"
                    description="Essential tools for every film lover."
                    features={FREE_FEATURES}
                    isCurrent={currentTier === 'free'}
                    canUpgrade={false}
                    isPending={false}
                />

                {/* Auteur */}
                <PlanCard
                    title="Auteur"
                    price={auteurPrice.main}
                    period={auteurPrice.period}
                    sub={auteurPrice.sub}
                    description="For the dedicated curator and critic."
                    features={AUTEUR_FEATURES}
                    isCurrent={currentTier === 'auteur'}
                    canUpgrade={currentTier !== 'auteur' || isCancelledPaid}
                    highlighted={currentTier === 'free' || currentTier === 'auteur'}
                    isPending={pendingPlan === 'auteur'}
                    onUpgrade={() => handleUpgrade('auteur')}
                />

                {/* Cineaste */}
                <PlanCard
                    title="Cineaste"
                    price={cineastePrice.main}
                    period={cineastePrice.period}
                    sub={cineastePrice.sub}
                    description="The full toolkit for the obsessive collector."
                    features={CINEASTE_FEATURES}
                    isCurrent={currentTier === 'cineaste'}
                    canUpgrade={currentTier !== 'cineaste' || isCancelledPaid}
                    highlighted={currentTier === 'cineaste' || currentTier === 'auteur'}
                    badge={currentTier !== 'cineaste' ? 'Best value' : undefined}
                    isPending={pendingPlan === 'cineaste'}
                    onUpgrade={() => handleUpgrade('cineaste')}
                />

            </div>

            {/* Social proof / trust signals */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
                {[
                    { icon: <Zap className="size-4 mx-auto mb-2 text-zinc-400" />, text: 'Cancel anytime' },
                    { icon: <Check className="size-4 mx-auto mb-2 text-zinc-400" />, text: 'No hidden fees' },
                    { icon: <Sparkles className="size-4 mx-auto mb-2 text-zinc-400" />, text: 'Prices in ₹ INR' },
                ].map((item, i) => (
                    <div key={i} className="text-xs text-zinc-400">
                        {item.icon}
                        {item.text}
                    </div>
                ))}
            </div>

            {/* FAQ */}
            <div className="max-w-2xl mx-auto w-full space-y-6">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 text-center">
                    Frequently asked questions
                </h2>
                <FAQ />
            </div>

        </div>
    );
}
