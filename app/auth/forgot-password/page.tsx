'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { forgotPassword } from '@/lib/actions/auth-actions';

const schema = z.object({
    email: z.string().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const [sentTo, setSentTo] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const onSubmit = async (values: FormValues) => {
        const result = await forgotPassword(values.email);
        // Always show success to avoid email enumeration
        setSentTo(values.email);
        setSent(true);
        if (result?.error) console.error(result.error);
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex size-10 items-center justify-center">
                        <Image src="/icon1.png" alt="DeeperWeave Logo" height={40} width={40} className="rounded-md" />
                    </div>
                    DeeperWeave
                </a>

                <Card>
                    <CardHeader className="text-center">
                        {!sent ? (
                            <>
                                <CardTitle className="text-xl">Forgot password?</CardTitle>
                                <CardDescription>
                                    Enter your email and we&apos;ll send you a reset link.
                                </CardDescription>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-center mb-2">
                                    <MailCheck className="w-8 h-8 text-green-500" />
                                </div>
                                <CardTitle className="text-xl">Check your inbox</CardTitle>
                                <CardDescription>
                                    If an account exists for <span className="font-medium text-zinc-700 dark:text-zinc-300">{sentTo}</span>, you&apos;ll receive a reset link shortly.
                                </CardDescription>
                            </>
                        )}
                    </CardHeader>

                    <CardContent>
                        {!sent ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        {...register('email')}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting && <Spinner className="mr-2 w-4 h-4" />}
                                    Send Reset Link
                                </Button>
                            </form>
                        ) : (
                            <p className="text-center text-sm text-zinc-500">
                                Didn&apos;t get it? Check your spam folder or{' '}
                                <button
                                    onClick={() => setSent(false)}
                                    className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100"
                                >
                                    try again
                                </button>
                                .
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="text-center text-sm">
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
