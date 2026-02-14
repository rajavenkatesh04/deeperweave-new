'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

// FIX 1: Remove props. Pages do not accept custom props.
export default function ProfilePage() {
    return (
        <Suspense fallback={null}>
            <ProfileContent />
        </Suspense>
    );
}

// FIX 2: Remove props here too.
function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const showWelcomeModal = searchParams.get('welcome') === 'true';
    const nameParam = searchParams.get('name');

    // FIX 3: Get name ONLY from URL. Default to "Creator" if missing.
    const displayName = nameParam ? decodeURIComponent(nameParam) : "Creator";

    const handleCloseWelcome = () => {
        // Removes 'welcome' and 'name' params to clean up the URL
        router.replace(pathname, { scroll: false });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">

            {/* Background Content */}
            <h1 className="text-zinc-400">Profile Content Loaded Here</h1>

            {/* --- WELCOME MODAL --- */}
            <AnimatePresence>
                {showWelcomeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="w-full max-w-[400px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 flex flex-col items-center text-center">

                                {/* Icon */}
                                <div className="mb-6 flex flex-col items-center gap-3">
                                    <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-full">
                                        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-500 fill-amber-600/20" />
                                    </div>
                                    <div>
                                        {/* Dynamic Name from URL */}
                                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white capitalize">
                                            Welcome, {displayName}.
                                        </h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                                            We&#39;re glad you&#39;re here. As a welcome gift, we&#39;ve upgraded your account to the <span className="text-amber-600 dark:text-amber-500 font-medium">Auretor Plan</span> for 30 days.
                                        </p>
                                    </div>
                                </div>

                                {/* Feature List */}
                                <div className="w-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 rounded-lg p-5 mb-8">
                                    <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-3 text-left">
                                        Your Unlocked Perks
                                    </div>
                                    <ul className="space-y-2.5 text-left">
                                        <FeatureItem>5 Custom Profile Sections</FeatureItem>
                                        <FeatureItem>Unlimited Story Generations</FeatureItem>
                                        <FeatureItem>&#34;Watch Next&#34; Widget</FeatureItem>
                                        <FeatureItem>Exclusive Blog Publishing</FeatureItem>
                                    </ul>
                                </div>

                                {/* Button */}
                                <Button
                                    onClick={handleCloseWelcome}
                                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all font-medium h-11"
                                >
                                    Thanks!
                                </Button>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
            <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" strokeWidth={2.5} />
            <span>{children}</span>
        </li>
    );
}