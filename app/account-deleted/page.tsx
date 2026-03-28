import Link from 'next/link';
import { Metadata } from 'next';
import { UserMinus, ArrowLeft, RefreshCcw } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Account Deleted — DeeperWeave',
};

export default function AccountDeletedPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-4">
            <div className="max-w-sm w-full text-center">

                {/* Icon */}
                <div className="flex justify-center mb-7">
                    <div className="relative">
                        {/* Swapped emerald for neutral zinc tones */}
                        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center ring-8 ring-zinc-50 dark:ring-zinc-900/50">
                            <UserMinus className="w-10 h-10 text-zinc-500 dark:text-zinc-400" strokeWidth={1.75} />
                        </div>
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    Account Deleted
                </h1>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-4">
                    We're sorry to see you go.
                </p>

                {/* Body */}
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-2">
                    Your account and all associated data — reviews, lists, and uploads —
                    have been permanently wiped from our servers.
                </p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500 leading-relaxed mb-10">
                    Thank you for having been a part of DeeperWeave. You're always welcome back.
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <span className="text-xs text-zinc-300 dark:text-zinc-600 font-medium">what&apos;s next?</span>
                    <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>

                {/* CTAs */}
                <div className="flex flex-col gap-3">
                    {/* Primary CTA is now just going back to the homepage */}
                    <Link
                        href="/"
                        className="group w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-bold transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Return to homepage
                    </Link>

                    {/* Secondary CTA is a subtle "Start over" option */}
                    <Link
                        href="/auth/sign-up"
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Changed your mind? Start over
                    </Link>
                </div>

            </div>
        </div>
    );
}