// app/auth/reset-password/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { updatePassword, type UpdatePasswordState } from '@/lib/actions/auth-actions';
import LoadingSpinner from "@/app/ui/loading-spinner";
import { PlayWriteNewZealandFont } from "@/app/ui/fonts";
import { ArrowLeftIcon, LockClosedIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

function UpdatePasswordButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex w-full h-12 items-center justify-center bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
        >
            {pending ? <><LoadingSpinner className="mr-2 h-4 w-4"/>Updating...</> : <span>Update Password</span>}
        </button>
    );
}

export default function ResetPasswordForm() {
    const initialState: UpdatePasswordState = { message: null, errors: {}, success: false };
    const [state, dispatch] = useActionState(updatePassword, initialState);

    // Supabase Auth State Logic
    const [isReady, setIsReady] = useState(false);
    const [authMessage, setAuthMessage] = useState<string | null>(null);

    useEffect(() => {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsReady(true);
                setAuthMessage(null);
            } else if (event === 'SIGNED_IN' && session === null) {
                setAuthMessage('This password reset link is invalid or has expired.');
                setIsReady(true);
            } else if (event === 'INITIAL_SESSION') {
                setIsReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative font-sans">

            {/* Desktop Back Button */}
            <div className="hidden md:block absolute top-10 left-10 z-50">
                <Link href="/auth/login" className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                    <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Sign In
                </Link>
            </div>

            {/* Main Content Wrapper */}
            <div className="w-full max-w-5xl">

                {/* Mobile Back Button */}
                <div className="md:hidden mb-6">
                    <Link href="/auth/login" className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                        <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back
                    </Link>
                </div>

                {/* Card Container */}
                <div className="grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-sm md:shadow-2xl overflow-hidden min-h-[500px]">

                    {/* LEFT COLUMN: Visual/Thematic Area */}
                    <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10"
                             style={{
                                 backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                             }}
                        />
                        <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 opacity-90" />

                        <div className="relative z-10 text-center space-y-8 max-w-sm">
                            <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                <LockClosedIcon className="w-20 h-20 text-zinc-200" />
                            </div>
                            <div className="space-y-4">
                                <h2 className={`${PlayWriteNewZealandFont.className} text-5xl font-bold text-white tracking-tight`}>
                                    Secure.
                                </h2>
                                <p className="text-sm font-medium text-zinc-400 italic">
                                    "Forging a new key for your archive."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Form */}
                    <div className="flex flex-col justify-center">

                        {/* Mobile Header */}
                        <div className="md:hidden relative bg-zinc-950 text-white py-12 px-6 text-center border-b border-zinc-800 overflow-hidden">
                            <div className="absolute inset-0 opacity-10"
                                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                            />
                            <div className="relative z-10">
                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/10 mb-4 backdrop-blur-md">
                                    <LockClosedIcon className="w-6 h-6 text-white" />
                                </div>
                                <h2 className={`${PlayWriteNewZealandFont.className} text-3xl font-bold text-white mb-1`}>Secure.</h2>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Update Credentials</p>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 lg:p-16 flex-1 flex flex-col justify-center">

                            {state.success ? (
                                // --- SUCCESS STATE ---
                                <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">Success</h1>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                            {state.message || 'Your password has been updated.'}
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <Link
                                            href="/auth/login"
                                            className="inline-flex items-center justify-center w-full h-12 border border-zinc-200 dark:border-zinc-800 text-sm font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                                        >
                                            Return to Sign In
                                        </Link>
                                    </div>
                                </div>
                            ) : !isReady ? (
                                // --- LOADING STATE ---
                                <div className="flex flex-col items-center justify-center space-y-4 py-12">
                                    <LoadingSpinner className="w-8 h-8 text-zinc-900 dark:text-white" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 animate-pulse">Verifying Link...</p>
                                </div>
                            ) : authMessage ? (
                                // --- INVALID LINK STATE ---
                                <div className="text-center space-y-6 animate-in fade-in duration-300">
                                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mx-auto">
                                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">Link Invalid</h1>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {authMessage}
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <Link
                                            href="/auth/forgot-password"
                                            className="inline-flex items-center justify-center w-full h-12 bg-zinc-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all"
                                        >
                                            Request New Link
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                // --- FORM STATE ---
                                <>
                                    <div className="mb-8 text-center md:text-left">
                                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
                                            Set New Password
                                        </h1>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Please create a new, secure password.
                                        </p>
                                    </div>

                                    <form action={dispatch} className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                New Password
                                            </label>
                                            <input
                                                id="password"
                                                name="password"
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-base placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                                required
                                            />
                                            {state.errors?.password && (
                                                <p className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">{state.errors.password[0]}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                                Confirm New Password
                                            </label>
                                            <input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-base placeholder:text-zinc-300 focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors"
                                                required
                                            />
                                            {state.errors?.confirmPassword && (
                                                <p className="text-xs text-red-600 dark:text-red-400 font-medium animate-pulse">{state.errors.confirmPassword[0]}</p>
                                            )}
                                        </div>

                                        {state.message && !state.success && (
                                            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/20">
                                                {state.message}
                                            </div>
                                        )}

                                        <div className="pt-4">
                                            <UpdatePasswordButton />
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}