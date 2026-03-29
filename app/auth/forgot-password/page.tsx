'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { forgotPassword } from '@/lib/actions/auth-actions';
import { PlayWriteNewZealandFont } from '@/app/ui/shared/fonts';

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [sentTo, setSentTo] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const onSubmit = async (values: FormValues) => {
        setServerError(null);
        const result = await forgotPassword(values.email, captchaToken ?? undefined);
        if (result?.error) {
            setServerError(result.error);
            turnstileRef.current?.reset();
            setCaptchaToken(null);
            return;
        }
        setSentTo(values.email);
        setSent(true);
    };

    return (
        <div className="min-h-svh flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative p-6">
            {/* Polka dot pattern — light */}
            <div
                className="dark:hidden absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Polka dot pattern — dark */}
            <div
                className="hidden dark:block absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            <div className="relative z-10 flex w-full max-w-sm flex-col gap-8">
                {/* Logo */}
                <Link href="/auth/login" className="flex items-center gap-2.5 self-center group">
                    <Image src="/icon1.png" alt="DeeperWeave Logo" height={36} width={36} className="rounded-md" />
                    <span className={`text-xl font-bold tracking-tight ${PlayWriteNewZealandFont.className}`}>
                        DeeperWeave
                    </span>
                </Link>

                {!sent ? (
                    /* ── Request form ── */
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 shadow-sm space-y-6">
                        <div className="space-y-1">
                            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                Reset your password
                            </h1>
                            <p className="text-sm text-zinc-500">
                                Enter your email and we&apos;ll send you a reset link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    autoFocus
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500">{errors.email.message}</p>
                                )}
                            </div>

                            {serverError && (
                                <div className="px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
                                    <p className="text-sm text-red-600 dark:text-red-400">{serverError}</p>
                                </div>
                            )}

                            <Turnstile
                                ref={turnstileRef}
                                siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY!}
                                onSuccess={(token) => setCaptchaToken(token)}
                                onExpire={() => { setCaptchaToken(null); turnstileRef.current?.reset(); }}
                                options={{ theme: 'auto', size: 'flexible' }}
                                className="w-full"
                            />

                            <Button
                                type="submit"
                                disabled={isSubmitting || !captchaToken}
                                className="w-full"
                            >
                                {isSubmitting && <Spinner className="mr-2 w-4 h-4" />}
                                Send Reset Link
                            </Button>
                        </form>
                    </div>
                ) : (
                    /* ── Success / inbox state ── */
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 shadow-sm space-y-5">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                                <Mail className="w-7 h-7 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1.5">
                                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Check your inbox
                                </h1>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    We sent a reset link to
                                </p>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 break-all">
                                    {sentTo}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-200 dark:divide-zinc-700 text-sm">
                            {[
                                'Click the link in the email',
                                'Check your spam if you don\'t see it',
                                'Link expires in 1 hour',
                            ].map((tip) => (
                                <div key={tip} className="px-4 py-2.5 text-zinc-500 flex items-center gap-2.5">
                                    <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
                                    {tip}
                                </div>
                            ))}
                        </div>

                        <p className="text-center text-sm text-zinc-500">
                            Wrong email?{' '}
                            <button
                                onClick={() => setSent(false)}
                                className="font-medium text-zinc-900 dark:text-zinc-100 underline underline-offset-4 hover:opacity-75 transition-opacity"
                            >
                                Try again
                            </button>
                        </p>
                    </div>
                )}

                <Link
                    href="/auth/login"
                    className="flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors self-center"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to login
                </Link>
            </div>
        </div>
    );
}