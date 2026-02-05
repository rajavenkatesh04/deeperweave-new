'use client';

import {useRef, useState, useTransition} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { checkUsernameAvailability, completeOnboarding } from '@/lib/actions/profile-actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, X, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import Image from "next/image";

export function OnboardingForm({ initialEmail, initialName }: { initialEmail: string, initialName?: string }) {
    const [step, setStep] = useState(1);
    const [isCheckingUser, setIsCheckingUser] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isPending, startTransition] = useTransition();
    const latestCheck = useRef('');

    const form = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema),
        mode: 'onChange',
        defaultValues: {
            username: '',
            display_name: initialName || '',
            bio: '',
        },
    });

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();

        form.setValue('username', value, { shouldValidate: true });
        setUsernameAvailable(null);

        if (value.length < 3) return;

        latestCheck.current = value;     // mark this as latest
        setIsCheckingUser(true);

        const isFree = await checkUsernameAvailability(value);

        // ignore stale responses
        if (latestCheck.current === value) {
            setUsernameAvailable(isFree);
            setIsCheckingUser(false);
        }
    };


    const onSubmit = (data: OnboardingInput) => {
        if (step === 1 && usernameAvailable) {
            setStep(2);
            return;
        }

        if (step === 2) {
            startTransition(async () => {
                const result = await completeOnboarding(data);
                if (result?.error) {
                    toast.error(result.error);
                }
            });
        }
    };

    // Animations
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    return (
        <div className="w-full max-w-md mx-auto relative z-10">
            <div className="mb-8 text-center space-y-2">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center justify-center mb-4"
                >
                    <Image
                        src="/icon1.png"
                        alt="DeeperWeave Logo"
                        width={50}
                        height={50}
                        className="rounded-lg"
                    />
                </motion.div>
                <h1 className="text-3xl font-bold tracking-tight">Profile set-up</h1>
                <p className="text-muted-foreground text-sm">
                    {step === 1 ? 'Claim your unique handle' : 'Tell the world who you are'}
                </p>
            </div>

            <Card className=" backdrop-blur-xl shadow-2xl">
                <CardContent className="p-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait" custom={step}>

                            {/* STEP 1: USERNAME */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    custom={1}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <div className="relative">
                                            <Input
                                                id="username"
                                                placeholder="neo_anderson"
                                                className="pr-10 font-mono"
                                                {...form.register('username')}
                                                onChange={handleUsernameChange}
                                            />
                                            <div className="absolute right-3 top-2.5">
                                                {isCheckingUser ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                ) : usernameAvailable === true ? (
                                                    <Check className="h-4 w-4 text-green-500" />
                                                ) : usernameAvailable === false ? (
                                                    <X className="h-4 w-4 text-red-500" />
                                                ) : null}
                                            </div>
                                        </div>
                                        {usernameAvailable === false && (
                                            <p className="text-xs text-red-500">Username is already taken.</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {initialEmail}
                                        </p>
                                    </div>

                                    <Button
                                        type="button"
                                        className="w-full group"
                                        onClick={() => onSubmit(form.getValues())}
                                        disabled={!usernameAvailable || !!form.formState.errors.username}
                                    >
                                        Next Step
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            )}

                            {/* STEP 2: DETAILS */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    custom={1}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Display Name</Label>
                                            <Input placeholder="Thomas Anderson" {...form.register('display_name')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Bio (Optional)</Label>
                                            <Textarea
                                                placeholder="I know Kung Fu..."
                                                className="resize-none min-h-[100px]"
                                                {...form.register('bio')}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" type="button" onClick={() => setStep(1)}>
                                            Back
                                        </Button>
                                        <Button type="submit" className="flex-1" disabled={isPending}>
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Complete Profile
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}