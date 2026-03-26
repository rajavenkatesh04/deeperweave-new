'use client';

import { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
    currentTier: string;
}

const PRICING = {
    auteur:   { monthly: 79,  yearly: 799  },
    cineaste: { monthly: 149, yearly: 1499 },
};

type PaidPlan = 'auteur' | 'cineaste';

function getPrice(plan: PaidPlan, isYearly: boolean) {
    const data = PRICING[plan];
    if (isYearly) {
        return {
            main: `₹${data.yearly}`,
            period: '/year',
            sub: `₹${Math.floor(data.yearly / 12)}/mo billed yearly`,
        };
    }
    return { main: `₹${data.monthly}`, period: '/mo', sub: null };
}

// ─── Feature rows ─────────────────────────────────────────────────────────────

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
    { label: 'Priority support', comingSoon: true },
    { label: 'Profile banner', comingSoon: true },
    { label: 'Blog posts', comingSoon: true },
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
    buttonLabel,
    isCurrent,
    onClick,
    highlighted,
    badge,
}: {
    title: string;
    price: string;
    period?: string;
    sub?: string | null;
    description: string;
    features: Feature[];
    buttonLabel: string;
    isCurrent: boolean;
    onClick?: () => void;
    highlighted?: boolean;
    badge?: string;
}) {
    return (
        <div
            className={cn(
                'relative flex flex-col rounded-2xl border p-6 transition-all duration-200',
                highlighted
                    ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-zinc-950 shadow-lg'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30',
            )}
        >
            {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        <Sparkles className="size-3" />
                        {badge}
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                        {title}
                    </p>
                    {isCurrent && (
                        <Badge variant="outline" className="text-[10px] border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400">
                            Active
                        </Badge>
                    )}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{price}</span>
                    {period && <span className="text-sm text-zinc-500">{period}</span>}
                </div>
                {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
                <p className="text-sm text-zinc-500 mt-3">{description}</p>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3 mb-8">
                {features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                        <Check className="size-4 shrink-0 text-zinc-900 dark:text-zinc-100" />
                        <span className={cn('text-zinc-700 dark:text-zinc-300', f.comingSoon && 'text-zinc-400 dark:text-zinc-600')}>
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
            <Button
                className={cn(
                    'w-full rounded-xl font-semibold',
                    highlighted && !isCurrent
                        ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900'
                        : '',
                )}
                variant={highlighted && !isCurrent ? 'default' : 'outline'}
                disabled={isCurrent}
                onClick={onClick}
            >
                {buttonLabel}
            </Button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PricingCards({ currentTier }: Props) {
    const [isYearly, setIsYearly] = useState(true);

    const auteurPrice = getPrice('auteur', isYearly);
    const cineastePrice = getPrice('cineaste', isYearly);

    const handlePayment = (plan: string) => {
        toast.info(`${plan} — Coming soon`, {
            description: "We're setting up payments. You'll be notified when it's ready.",
        });
    };

    return (
        <div className="space-y-8">

            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 gap-1">
                    <button
                        onClick={() => setIsYearly(false)}
                        className={cn(
                            'px-5 py-2 rounded-full text-sm font-medium transition-colors',
                            !isYearly
                                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-800'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setIsYearly(true)}
                        className={cn(
                            'px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2',
                            isYearly
                                ? 'bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-800'
                                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
                        )}
                    >
                        Yearly
                        <span className="text-[10px] font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-2 py-0.5 rounded-full">
                            −15%
                        </span>
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">

                <PlanCard
                    title="Starter"
                    price="Free"
                    description="Essential tools for every film lover."
                    features={FREE_FEATURES}
                    buttonLabel={currentTier === 'free' ? 'Current Plan' : 'Free Plan'}
                    isCurrent={currentTier === 'free'}
                />

                <PlanCard
                    title="Auteur"
                    price={auteurPrice.main}
                    period={auteurPrice.period}
                    sub={auteurPrice.sub}
                    description="For the dedicated curator and critic."
                    features={AUTEUR_FEATURES}
                    buttonLabel={currentTier === 'auteur' ? 'Current Plan' : 'Get Auteur'}
                    isCurrent={currentTier === 'auteur'}
                    highlighted={currentTier === 'auteur'}
                    onClick={() => handlePayment('Auteur')}
                />

                <PlanCard
                    title="Cineaste"
                    price={cineastePrice.main}
                    period={cineastePrice.period}
                    sub={cineastePrice.sub}
                    description="The full toolkit for the obsessive collector."
                    features={CINEASTE_FEATURES}
                    buttonLabel={currentTier === 'cineaste' ? 'Current Plan' : 'Get Cineaste'}
                    isCurrent={currentTier === 'cineaste'}
                    highlighted={currentTier !== 'cineaste'}
                    badge={currentTier !== 'cineaste' ? 'Best value' : undefined}
                    onClick={() => handlePayment('Cineaste')}
                />

            </div>
        </div>
    );
}