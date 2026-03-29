'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { setNewPassword } from '@/lib/actions/settings-actions';

const schema = z.object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string(),
}).refine(d => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ['confirm'],
});

type FormValues = z.infer<typeof schema>;

function PasswordStrength({ value }: { value: string }) {
    if (!value) return null;

    const checks = [
        value.length >= 8,
        /[A-Z]/.test(value),
        /[0-9]/.test(value),
        /[^A-Za-z0-9]/.test(value),
    ];
    const score = checks.filter(Boolean).length;

    const bars = [
        score >= 1 ? (score <= 1 ? 'bg-red-500' : score <= 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-zinc-200 dark:bg-zinc-700',
        score >= 2 ? (score <= 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-zinc-200 dark:bg-zinc-700',
        score >= 3 ? (score <= 3 ? 'bg-emerald-400' : 'bg-emerald-500') : 'bg-zinc-200 dark:bg-zinc-700',
        score >= 4 ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700',
    ];

    const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
    const labelColor = score <= 1 ? 'text-red-500' : score === 2 ? 'text-amber-500' : 'text-emerald-500';

    return (
        <div className="space-y-1.5 mt-1">
            <div className="flex gap-1">
                {bars.map((color, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${color}`} />
                ))}
            </div>
            <p className={`text-xs font-medium ${labelColor}`}>{label}</p>
        </div>
    );
}

export function SetPasswordForm() {
    const router = useRouter();
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const passwordValue = watch('password', '');

    const onSubmit = async (values: FormValues) => {
        const result = await setNewPassword(values.password);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success('Password updated! You can now sign in with your new password.');
            router.replace('/');
        }
    };

    return (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                        <KeyRound className="w-5 h-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">Set new password</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            Choose a strong password for your account.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="pw-new">New Password</Label>
                        <div className="relative">
                            <Input
                                id="pw-new"
                                type={showPw ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                autoFocus
                                className="pr-10"
                                {...register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password ? (
                            <p className="text-xs text-red-500">{errors.password.message}</p>
                        ) : (
                            <PasswordStrength value={passwordValue} />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="pw-confirm">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="pw-confirm"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="pr-10"
                                {...register('confirm')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                tabIndex={-1}
                            >
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirm && (
                            <p className="text-xs text-red-500">{errors.confirm.message}</p>
                        )}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting && <Spinner className="mr-2 w-4 h-4" />}
                        Set Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
