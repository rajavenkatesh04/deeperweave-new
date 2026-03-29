'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { KeyRound, ChevronRight, Mail } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { requestPasswordReset } from '@/lib/actions/settings-actions';

interface PasswordDialogProps {
    isOAuthOnly: boolean;
    email: string;
}

export function PasswordDialog({ isOAuthOnly, email }: PasswordDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const handleSend = async () => {
        setLoading(true);
        const result = await requestPasswordReset(captchaToken ?? undefined);
        setLoading(false);
        if (result?.error) {
            toast.error(result.error);
            turnstileRef.current?.reset();
            setCaptchaToken(null);
        } else {
            setSent(true);
        }
    };

    const handleOpenChange = (next: boolean) => {
        setOpen(next);
        if (!next) {
            setTimeout(() => {
                setSent(false);
                setCaptchaToken(null);
                turnstileRef.current?.reset();
            }, 300);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-full flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer group text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors shrink-0">
                        <KeyRound className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {isOAuthOnly ? 'Set Password' : 'Change Password'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            {isOAuthOnly
                                ? 'Add a password to also sign in with email & password.'
                                : 'Receive a secure reset link via email.'}
                        </p>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shrink-0" />
            </button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                    {!sent ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-zinc-900 dark:text-zinc-100">
                                    {isOAuthOnly ? 'Set a Password' : 'Change Password'}
                                </DialogTitle>
                                <DialogDescription className="text-zinc-500">
                                    {isOAuthOnly
                                        ? "We'll send a secure link to your email. Once you set a password, you can sign in with email & password in addition to Google."
                                        : "We'll email you a secure one-time link. Click it to choose a new password."}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-1 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <p className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider mb-0.5">Sending to</p>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{email}</p>
                            </div>

                            <Turnstile
                                ref={turnstileRef}
                                siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITEKEY!}
                                onSuccess={(token) => setCaptchaToken(token)}
                                onExpire={() => { setCaptchaToken(null); turnstileRef.current?.reset(); }}
                                options={{ theme: 'auto', size: 'flexible' }}
                                className="w-full"
                            />

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button onClick={handleSend} disabled={loading || !captchaToken}>
                                    {loading && <Spinner className="mr-2 w-4 h-4" />}
                                    Send Reset Link
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <div className="flex justify-center mb-3">
                                    <div className="p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                                        <Mail className="w-6 h-6 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                                    </div>
                                </div>
                                <DialogTitle className="text-zinc-900 dark:text-zinc-100 text-center">
                                    Check your inbox
                                </DialogTitle>
                                <DialogDescription className="text-zinc-500 text-center">
                                    We sent a reset link to{' '}
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>.
                                    {' '}Click it to set your new password. The link expires in 1 hour.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end mt-2">
                                <Button onClick={() => handleOpenChange(false)}>Done</Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}