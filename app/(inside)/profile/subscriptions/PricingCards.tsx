'use client';

import { useState, useTransition } from 'react';
import { Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { Subscription, SUBSCRIPTION_PRICING } from '@/lib/definitions';
import {
    initiateCheckout,
    cancelSubscription,
} from '@/lib/actions/subscription-actions';

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

// ─── Cancel Dialog ─────────────────────────────────────────────────────────────

function CancelDialog({ expiresAt }: { expiresAt: string | null }) {
    const [isPending, startTransition] = useTransition();

    function handleCancel() {
        startTransition(async () => {
            const result = await cancelSubscription();
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Subscription cancelled', {
                    description: expiresAt
                        ? `Your access continues until ${new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                        : 'Your access continues until the end of the billing period.',
                });
            }
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full rounded-xl font-medium border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800"
                >
                    Cancel Subscription
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-red-500" />
                        Cancel subscription?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You&apos;ll keep access to all features until the end of your current billing period.
                        After that, your account will revert to the free plan.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleCancel}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isPending ? <Spinner className="size-4" /> : 'Yes, cancel'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
    title,
    price,
    period,
    sub,
    description,
    features,
    isCurrent,
    isActivePaid,
    isCancelledPaid,
    canUpgrade,
    highlighted,
    badge,
    onUpgrade,
    activeSub,
}: {
    title: string;
    price: string;
    period?: string;
    sub?: string | null;
    description: string;
    features: Feature[];
    isCurrent: boolean;
    isActivePaid: boolean;
    isCancelledPaid: boolean;
    canUpgrade: boolean;
    highlighted?: boolean;
    badge?: string;
    onUpgrade?: () => void;
    activeSub: Subscription | null;
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
                    <span className="flex items-center gap-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
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
                        <Badge
                            variant="outline"
                            className="text-[10px] border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400"
                        >
                            {isCancelledPaid ? 'Cancels soon' : 'Current'}
                        </Badge>
                    )}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{price}</span>
                    {period && (
                        <span className="text-sm text-zinc-500">{period}</span>
                    )}
                </div>
                {sub && (
                    <p className="text-xs text-zinc-400 mt-1">{sub}</p>
                )}
                <p className="text-sm text-zinc-500 mt-3">{description}</p>
            </div>

            {/* Features */}
            <ul className="flex-1 space-y-3 mb-8">
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
            <div className="space-y-2">
                {canUpgrade && (
                    <Button
                        className={cn(
                            'w-full rounded-xl font-semibold',
                            highlighted
                                ? 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white'
                                : '',
                        )}
                        variant={highlighted ? 'default' : 'outline'}
                        onClick={onUpgrade}
                    >
                        Get {title}
                    </Button>
                )}

                {isCurrent && isActivePaid && (
                    <CancelDialog expiresAt={activeSub?.expires_at ?? null} />
                )}

                {isCurrent && !isActivePaid && !isCancelledPaid && (
                    <Button
                        variant="outline"
                        className="w-full rounded-xl font-medium"
                        disabled
                    >
                        Current Plan
                    </Button>
                )}

                {isCurrent && isCancelledPaid && (
                    <Button
                        className="w-full rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-white"
                        onClick={onUpgrade}
                    >
                        Reactivate
                    </Button>
                )}
            </div>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function PricingCards({ currentTier, activeSub }: Props) {
    const [isYearly, setIsYearly] = useState(true);

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

    async function handleUpgrade(plan: PaidPlan) {
        const result = await initiateCheckout(plan, isYearly ? 'yearly' : 'monthly');
        if ('comingSoon' in result) {
            toast.info('Payments coming soon', {
                description: "We're setting up payments. You'll be notified when it's ready!",
            });
            return;
        }

        // TODO (Razorpay): Load script and open checkout widget
        // const { orderId, amount, currency, keyId, userName, userEmail } = result;
        // const script = document.createElement('script');
        // script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        // script.onload = () => {
        //     const rzp = new (window as any).Razorpay({
        //         key: keyId,
        //         amount,
        //         currency,
        //         order_id: orderId,
        //         name: 'DeeperWeave',
        //         description: `${plan} — ${isYearly ? 'Yearly' : 'Monthly'}`,
        //         handler: (response: any) => {
        //             // Payment succeeded client-side
        //             // Webhook handles activation, but we can show a success toast
        //             toast.success('Payment successful! Your plan is being activated.');
        //         },
        //         prefill: { name: userName, email: userEmail },
        //         theme: { color: '#18181b' },
        //     });
        //     rzp.open();
        // };
        // document.body.appendChild(script);
    }

    return (
        <div className="space-y-8">

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
                    isActivePaid={false}
                    isCancelledPaid={false}
                    canUpgrade={false}
                    activeSub={activeSub}
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
                    isActivePaid={currentTier === 'auteur' && activeSub?.status === 'active'}
                    isCancelledPaid={currentTier === 'auteur' && isCancelledPaid}
                    canUpgrade={currentTier !== 'auteur' || isCancelledPaid}
                    highlighted={currentTier === 'auteur'}
                    activeSub={activeSub}
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
                    isActivePaid={currentTier === 'cineaste' && activeSub?.status === 'active'}
                    isCancelledPaid={currentTier === 'cineaste' && isCancelledPaid}
                    canUpgrade={currentTier !== 'cineaste' || isCancelledPaid}
                    highlighted={currentTier !== 'cineaste'}
                    badge={currentTier !== 'cineaste' ? 'Best value' : undefined}
                    activeSub={activeSub}
                    onUpgrade={() => handleUpgrade('cineaste')}
                />

            </div>
        </div>
    );
}
