'use client';

import { useState } from 'react';
import { Check, Sparkles, X, Zap, Crown, Film, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import clsx from 'clsx';

interface Props {
    currentTier: 'free' | 'auretor' | 'cineaste';
}

export function SubscriptionPlans({ currentTier }: Props) {
    const [isYearly, setIsYearly] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleUpgrade = (plan: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success(`Welcome to ${plan}`, {
                description: "Your upgrade is being processed."
            });
        }, 1000);
    };

    return (
        <section className="w-full  flex flex-col items-center">

            {/* Billing Toggle - Pill Shape */}
            <div className="flex items-center justify-center mb-16">
                <div className="flex items-center gap-4 bg-muted/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm">
                    <Label
                        htmlFor="billing-toggle"
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-all",
                            !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setIsYearly(false)}
                    >
                        Monthly
                    </Label>
                    <Switch
                        id="billing-toggle"
                        checked={isYearly}
                        onCheckedChange={setIsYearly}
                        className="data-[state=checked]:bg-rose-600 data-[state=unchecked]:bg-zinc-200 dark:data-[state=unchecked]:bg-zinc-700"
                    />
                    <Label
                        htmlFor="billing-toggle"
                        className={clsx(
                            "px-4 py-1.5 rounded-full text-sm font-semibold cursor-pointer transition-all flex items-center gap-2",
                            isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setIsYearly(true)}
                    >
                        Yearly
                        <span className="text-[10px] font-bold tracking-wide uppercase text-rose-600 bg-rose-100 dark:bg-rose-950 dark:text-rose-400 px-2 py-0.5 rounded-full">
                            -17%
                        </span>
                    </Label>
                </div>
            </div>

            {/* Pricing Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl px-4 w-full items-stretch">

                {/* --- FREE TIER --- */}
                <Card className="flex flex-col border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm relative overflow-hidden group">
                    <CardHeader className="pb-8">
                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2">Starter</div>
                        <div className="text-4xl font-bold">Free</div>
                        <p className="text-sm text-muted-foreground mt-2">Essential tools for casual viewers.</p>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ul className="space-y-4 text-sm text-muted-foreground">
                            <FeatureItem>3 Profile Sections</FeatureItem>
                            <FeatureItem>3 Items per Section</FeatureItem>
                            <FeatureItem>3 Custom Lists</FeatureItem>
                            <FeatureItem>30 Story Gens / mo</FeatureItem>
                            <FeatureItem negative>No Blog Posts</FeatureItem>
                            <FeatureItem negative>No Analytics</FeatureItem>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled={true}>
                            {currentTier === 'free' ? "Current Plan" : "Downgrade"}
                        </Button>
                    </CardFooter>
                </Card>

                {/* --- AURETOR (Gold) --- */}
                <Card className={clsx(
                    "flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden",
                    currentTier === 'auretor' ? "border-amber-500/40 bg-amber-50/5 dark:bg-amber-950/10" : "border-border/60 bg-card/80 hover:border-amber-500/30"
                )}>
                    <CardHeader className="pb-8 relative z-10">
                        <div className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Film className="w-4 h-4" /> Auretor
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-foreground">
                                {isYearly ? "₹399" : "₹49"}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">/mo</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">For the dedicated curator.</p>
                    </CardHeader>
                    <CardContent className="flex-1 relative z-10">
                        <ul className="space-y-4 text-sm">
                            <FeatureItem highlightColor="text-amber-600 dark:text-amber-400">5 Profile Sections</FeatureItem>
                            <FeatureItem>6 Items per Section</FeatureItem>
                            <FeatureItem>10 Custom Lists</FeatureItem>
                            <FeatureItem>5 Blog Posts / mo</FeatureItem>
                            <FeatureItem>Unlimited Story Gens</FeatureItem>
                            <FeatureItem highlightColor="text-amber-600 dark:text-amber-400">"Watch Next" Widget</FeatureItem>
                        </ul>
                    </CardContent>
                    <CardFooter className="relative z-10">
                        <Button
                            className={clsx(
                                "w-full font-semibold transition-all",
                                currentTier === 'auretor'
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-amber-600 hover:bg-amber-700 text-white dark:text-amber-950 dark:bg-amber-500 dark:hover:bg-amber-400"
                            )}
                            variant={currentTier === 'auretor' ? "secondary" : "default"}
                            onClick={() => handleUpgrade('Auretor')}
                            disabled={currentTier === 'auretor' || loading}
                        >
                            {loading ? <Zap className="w-4 h-4 animate-spin" /> : currentTier === 'auretor' ? "Active Plan" : "Start Trial"}
                        </Button>
                    </CardFooter>

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                </Card>

                {/* --- CINEASTE (Ruby / Premium) --- */}
                <Card className={clsx(
                    "flex flex-col shadow-2xl relative overflow-hidden transform md:-translate-y-4 border transition-all duration-300",
                    "border-rose-200 dark:border-rose-900", // Border color
                    "bg-white dark:bg-zinc-950" // Base background
                )}>
                    {/* Premium Glow Effects */}
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-50/50 to-transparent dark:from-rose-950/20 dark:to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Badge */}
                    <div className="absolute top-0 inset-x-0 flex justify-center -mt-3">
                         <span className="bg-rose-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5 ring-4 ring-white dark:ring-zinc-950">
                            <Crown className="w-3 h-3 fill-current" /> Most Popular
                        </span>
                    </div>

                    <CardHeader className="pb-8 pt-10 relative z-10">
                        <div className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Gem className="w-4 h-4" /> Cineaste
                        </div>
                        <div className="flex items-baseline gap-1">
                             <span className="text-5xl font-black text-foreground tracking-tight">
                                {isYearly ? "₹999" : "₹99"}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">/mo</span>
                        </div>
                        <p className="text-sm text-rose-900/60 dark:text-rose-200/60 mt-2 font-medium">
                            The ultimate collector&#39;s toolkit.
                        </p>
                    </CardHeader>

                    <Separator className="bg-rose-100 dark:bg-rose-900/50" />

                    <CardContent className="flex-1 relative z-10 pt-8">
                        <ul className="space-y-4 text-sm font-medium">
                            <FeatureItem highlightColor="text-rose-600 dark:text-rose-400" iconColor="text-rose-600">10 Profile Sections</FeatureItem>
                            <FeatureItem iconColor="text-rose-600">Unlimited Items per Section</FeatureItem>
                            <FeatureItem highlightColor="text-rose-600 dark:text-rose-400" iconColor="text-rose-600">100 Custom Lists</FeatureItem>
                            <FeatureItem iconColor="text-rose-600">20 Blog Posts / mo</FeatureItem>
                            <FeatureItem iconColor="text-rose-600">Prioritized Story Gen</FeatureItem>
                            <FeatureItem highlightColor="text-rose-600 dark:text-rose-400" iconColor="text-rose-600">
                                Verified Badge <Badge className="ml-1.5 h-4 px-1 bg-rose-600 hover:bg-rose-700 text-[9px] border-none">✓</Badge>
                            </FeatureItem>
                        </ul>
                    </CardContent>
                    <CardFooter className="relative z-10 pb-8">
                        <Button
                            className={clsx(
                                "w-full font-bold h-11 text-md shadow-lg shadow-rose-500/25 transition-all",
                                currentTier === 'cineaste'
                                    ? ""
                                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-0 hover:scale-[1.02] active:scale-[0.98]"
                            )}
                            variant={currentTier === 'cineaste' ? "secondary" : "default"}
                            onClick={() => handleUpgrade('Cineaste')}
                            disabled={currentTier === 'cineaste' || loading}
                        >
                            {loading ? (
                                <Zap className="w-5 h-5 animate-spin" />
                            ) : currentTier === 'cineaste' ? (
                                "Current Plan"
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 fill-white/20" /> Get Cineaste
                                </span>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

            </div>

            {/* Trust Footer */}
            <div className="mt-16 pt-8 border-t border-border/40 w-full max-w-4xl text-center space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Included in every plan
                </p>
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Secure SSL Payment</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Cancel Anytime</span>
                    <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> 24/7 Support</span>
                </div>
            </div>
        </section>
    );
}

// Helper Component for List Items
function FeatureItem({
                         children,
                         negative = false,
                         highlightColor,
                         iconColor
                     }: {
    children: React.ReactNode,
    negative?: boolean,
    highlightColor?: string,
    iconColor?: string
}) {
    return (
        <li className={clsx("flex items-start gap-3", negative ? "text-muted-foreground opacity-60" : "")}>
            <div className={clsx(
                "mt-0.5 shrink-0",
                negative ? "text-zinc-400" : iconColor || "text-foreground"
            )}>
                {negative ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" strokeWidth={2.5} />}
            </div>
            <span className={clsx("leading-tight", highlightColor || "text-muted-foreground")}>
                {children}
            </span>
        </li>
    );
}