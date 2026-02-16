'use client';

import { useState } from 'react';
import { Check, X, Zap, Crown, Film, Gem, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import clsx from 'clsx';

interface Props {
    currentTier: 'free' | 'auretor' | 'cineaste';
}

const PRICING = {
    auretor: { monthly: 49, yearly: 399 },
    cineaste: { monthly: 99, yearly: 999 },
};

export function SubscriptionPlans({ currentTier }: Props) {
    const [isYearly, setIsYearly] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleUpgrade = (plan: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(`Welcome to ${plan}`, {
                description: 'Your upgrade is being processed.',
            });
        }, 1000);
    };

    const getPrice = (plan: 'auretor' | 'cineaste') => {
        const data = PRICING[plan];
        if (isYearly) {
            return {
                main: `₹${data.yearly}`,
                period: '/year',
                sub: `₹${Math.floor(data.yearly / 12)}/mo billed yearly`,
            };
        }
        return {
            main: `₹${data.monthly}`,
            period: '/mo',
            sub: null,
        };
    };

    const auretor = getPrice('auretor');
    const cineaste = getPrice('cineaste');

    return (
        <section className="w-full py-16 flex flex-col items-center">

            {/* Toggle */}
            <div className="mb-14">
                <div className="flex bg-muted/40 border border-border/50 rounded-full p-1">
                    <button
                        onClick={() => setIsYearly(false)}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm transition",
                            !isYearly
                                ? "bg-background shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Monthly
                    </button>

                    <button
                        onClick={() => setIsYearly(true)}
                        className={clsx(
                            "px-6 py-2 rounded-full text-sm transition flex items-center gap-2",
                            isYearly
                                ? "bg-background shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Yearly
                        <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full">
              Save 17%
            </span>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 items-stretch">

                {/* FREE */}
                <PlanCard
                    title="Starter"
                    price="Free"
                    description="Essential tools for casual viewers."
                    features={[
                        '3 Profile Sections',
                        '3 Items per Section',
                        '3 Custom Lists',
                        '30 Story Gens / mo',
                    ]}
                    negatives={['No Blog Posts', 'No Analytics']}
                    buttonLabel={currentTier === 'free' ? 'Current Plan' : 'Downgrade'}
                    disabled
                />

                {/* AURETOR */}
                <PlanCard
                    highlight={currentTier === 'auretor'}
                    accent="amber"
                    icon={<Film className="w-4 h-4" />}
                    title="Auretor"
                    price={auretor.main}
                    period={auretor.period}
                    sub={auretor.sub}
                    description="For the dedicated curator."
                    features={[
                        '5 Profile Sections',
                        '6 Items per Section',
                        '10 Custom Lists',
                        '5 Blog Posts / mo',
                        'Unlimited Story Gens',
                        '"Watch Next" Widget',
                    ]}
                    buttonLabel={
                        currentTier === 'auretor' ? 'Active Plan' : 'Start Trial'
                    }
                    disabled={currentTier === 'auretor' || loading}
                    onClick={() => handleUpgrade('Auretor')}
                />

                {/* CINEASTE */}
                <PlanCard
                    highlight
                    accent="rose"
                    badge="Most Popular"
                    icon={<Gem className="w-4 h-4" />}
                    title="Cineaste"
                    price={cineaste.main}
                    period={cineaste.period}
                    sub={cineaste.sub}
                    description="The ultimate collector's toolkit."
                    features={[
                        '10 Profile Sections',
                        'Unlimited Items per Section',
                        '100 Custom Lists',
                        '20 Blog Posts / mo',
                        'Prioritized Story Gen',
                        'Verified Badge',
                    ]}
                    buttonLabel={
                        currentTier === 'cineaste' ? 'Current Plan' : 'Get Cineaste'
                    }
                    disabled={currentTier === 'cineaste' || loading}
                    onClick={() => handleUpgrade('Cineaste')}
                />

            </div>
        </section>
    );
}

/* ---------------- CARD COMPONENT ---------------- */

function PlanCard({
                      title,
                      price,
                      period,
                      sub,
                      description,
                      features,
                      negatives,
                      buttonLabel,
                      disabled,
                      onClick,
                      highlight,
                      accent,
                      badge,
                      icon,
                  }: any) {
    return (
        <Card
            className={clsx(
                "relative flex flex-col p-8 h-full transition-all duration-300",
                highlight
                    ? accent === 'rose'
                        ? "border border-rose-400/30"
                        : "border border-amber-400/30"
                    : "border border-border/60",
                "hover:scale-[1.02]"
            )}
        >
            {badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-rose-500 text-white">
                    {badge}
                </div>
            )}

            {/* HEADER — FIXED HEIGHT */}
            <div className="min-h-[140px]">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest mb-3">
                    {icon}
                    {title}
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{price}</span>
                    {period && (
                        <span className="text-sm text-muted-foreground">{period}</span>
                    )}
                </div>

                {sub && (
                    <div className="text-xs text-muted-foreground mt-1">{sub}</div>
                )}

                <p className="text-sm text-muted-foreground mt-4">{description}</p>
            </div>

            {/* FEATURES — FLEX GROW */}
            <div className="flex-1 mt-8">
                <ul className="space-y-4 text-sm">
                    {features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                            <Check className="w-4 h-4 mt-0.5" />
                            {f}
                        </li>
                    ))}

                    {negatives?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 opacity-60">
                            <X className="w-4 h-4 mt-0.5" />
                            {f}
                        </li>
                    ))}
                </ul>
            </div>

            {/* FOOTER — ALWAYS BOTTOM */}
            <div className="mt-8">
                <Button
                    className="w-full"
                    disabled={disabled}
                    onClick={onClick}
                >
                    {buttonLabel}
                </Button>
            </div>
        </Card>
    );
}