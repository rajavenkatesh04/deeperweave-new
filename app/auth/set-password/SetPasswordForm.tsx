'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
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

export function SetPasswordForm() {
    const router = useRouter();
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ resolver: zodResolver(schema) });

    const onSubmit = async (values: FormValues) => {
        const result = await setNewPassword(values.password);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success('Password updated! You can now sign in with your email.');
            router.replace('/profile/settings');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="pw-new" className="text-zinc-700 dark:text-zinc-300">
                    New Password
                </Label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        tabIndex={-1}
                    >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="pw-confirm" className="text-zinc-700 dark:text-zinc-300">
                    Confirm Password
                </Label>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        tabIndex={-1}
                    >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {errors.confirm && (
                    <p className="text-xs text-red-500">{errors.confirm.message}</p>
                )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                {isSubmitting && <Spinner className="mr-2 w-4 h-4" />}
                Set Password
            </Button>
        </form>
    );
}
