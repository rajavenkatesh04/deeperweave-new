'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    RefreshCw,
    Home,
    ArrowLeft,
    Clock,
    Wrench,
    ShieldAlert,
    Mail
} from 'lucide-react';
import { PlayWriteNewZealandFont } from "@/app/ui/shared/fonts";

function ErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Logic to determine if this is an Auth error vs a General error
    const errorCode = searchParams.get('error_code');
    const errorType = searchParams.get('type');
    const errorMsg = searchParams.get('error') || "An unexpected error occurred.";
    const errorDescription = searchParams.get('error_description');

    // Check hash for Supabase specific auth errors
    const [hashError, setHashError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const desc = params.get('error_description');
            if (desc) setHashError(decodeURIComponent(desc.replace(/\+/g, ' ')));
        }
    }, []);

    // Determine the final state
    const isAuthError = !!errorCode || errorType === 'auth' || !!hashError;
    const finalErrorMessage = hashError || errorDescription || errorMsg;

    // 2. Dynamic UI Config
    const config = {
        title: isAuthError ? "Authentication Failed" : "System Encountered a Glitch",
        subtitle: isAuthError ? "Cut!" : "Technical Diff...",
        quote: isAuthError ? "We encountered a script error." : "The scene didn't go as planned.",
        colorClass: isAuthError ? "rose" : "amber",
        primaryActionLabel: isAuthError ? "Sign In Again" : "Try Again",
        primaryActionHref: isAuthError ? "/auth/login" : "/",
        Icon: isAuthError ? ShieldAlert : Wrench,
    };

    return (
        <div className="w-full max-w-4xl">
            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
                <button
                    onClick={() => router.back()}
                    className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Go Back
                </button>
            </div>

            {/* Main Card Container */}
            <div className={`grid md:grid-cols-2 bg-white dark:bg-black border-2 shadow-xl overflow-hidden rounded-lg transition-colors duration-500 ${
                isAuthError ? 'border-rose-200 dark:border-rose-900/50' : 'border-amber-200 dark:border-amber-900/50'
            }`}>

                {/* LEFT COLUMN: Visual Branding */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-10 border-r border-zinc-200 dark:border-zinc-800 relative overflow-hidden min-h-[400px]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className={`absolute inset-0 opacity-90 transition-colors duration-700 bg-radial-gradient to-black/90 ${
                        isAuthError ? 'from-rose-900/20' : 'from-amber-900/20'
                    }`} />

                    <div className="relative z-10 text-center space-y-6 max-w-xs">
                        <div className={`mx-auto w-32 h-32 flex items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
                            isAuthError ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'
                        }`}>
                            <config.Icon className={`w-16 h-16 ${isAuthError ? 'text-rose-500' : 'text-amber-500'}`} />
                        </div>

                        <div className="space-y-3">
                            <h2 className={`${PlayWriteNewZealandFont.className} text-4xl font-bold text-white tracking-tight`}>
                                {config.subtitle}
                            </h2>
                            <p className="text-sm font-medium text-zinc-400 italic">
                                &#34;{config.quote}&#34;
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Action & Details */}
                <div className="flex flex-col justify-center p-8 md:p-10">
                    <div className="mb-6">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">
                            {config.title}
                        </h1>
                        <p className={`text-sm font-medium leading-relaxed p-3 border rounded transition-colors ${
                            isAuthError
                                ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20'
                                : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20'
                        }`}>
                            {finalErrorMessage}
                        </p>
                        {errorCode && (
                            <p className="mt-2 text-xs text-zinc-400 font-mono">Status Code: {errorCode}</p>
                        )}
                    </div>

                    {/* SUGGESTED ACTIONS: Clean Text Layout */}
                    <div className="mb-8 pl-1">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Suggested Actions:
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                <RefreshCw className="h-4 w-4 shrink-0 text-zinc-400" />
                                <span>{isAuthError ? "Check your credentials and try again." : "Refresh the page to restart the session."}</span>
                            </li>
                            <li className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                                <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                                <span>If you believe this is a mistake, please contact support.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        {/* Primary Action */}
                        <Link
                            href={config.primaryActionHref}
                            className="group flex w-full h-10 items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-xs font-bold uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 rounded-sm"
                        >
                            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
                            <span>{config.primaryActionLabel}</span>
                        </Link>

                        {/* Secondary Actions Row */}
                        <div className="flex gap-3">
                            <a
                                href="mailto:developer@deeperweave.com"
                                className={`group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm ${
                                    isAuthError ? 'hover:border-rose-300 dark:hover:border-rose-800' : 'hover:border-amber-300 dark:hover:border-amber-800'
                                }`}
                            >
                                <Mail className={`h-3 w-3 text-zinc-400 transition-colors ${
                                    isAuthError ? 'group-hover:text-rose-500' : 'group-hover:text-amber-500'
                                }`} />
                                <span>Contact Support</span>
                            </a>

                            <Link
                                href="/"
                                className={`group flex flex-1 h-10 items-center justify-center gap-2 bg-white hover:bg-zinc-50 dark:bg-transparent dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-sm ${
                                    isAuthError ? 'hover:border-rose-300 dark:hover:border-rose-800' : 'hover:border-amber-300 dark:hover:border-amber-800'
                                }`}
                            >
                                <Home className={`h-3 w-3 text-zinc-400 transition-colors ${
                                    isAuthError ? 'group-hover:text-rose-500' : 'group-hover:text-amber-500'
                                }`} />
                                <span>Return Home</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">
            {/* Desktop Back Button */}
            <div className="hidden md:block absolute top-8 left-8">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Go Back
                </button>
            </div>

            <Suspense fallback={<div className="animate-pulse text-zinc-500 font-mono text-sm tracking-widest uppercase">Loading Script...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}