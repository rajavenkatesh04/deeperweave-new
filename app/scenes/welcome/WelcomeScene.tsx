'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    },
    exit: {
        opacity: 0,
        scale: 0.96,
        filter: 'blur(10px)',
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

export function WelcomeScene() {
    const searchParams = useSearchParams();
    const firstName = searchParams.get('first') ?? '';
    const username = searchParams.get('username') ?? '';

    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!firstName || !username) {
            window.location.replace('/');
            return;
        }

        const dest = `/profile/${username}/home?welcome=true&name=${encodeURIComponent(username)}`;

        // Give it 2 seconds to admire the UI before exiting
        const exitTimer = setTimeout(() => setExiting(true), 2000);
        // Hard navigation to bust the Next.js router cache
        const navTimer = setTimeout(() => window.location.replace(dest), 2500);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [firstName, username]);

    if (!firstName) return null;

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md flex items-center justify-center overflow-hidden select-none"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={containerVariants}
                >
                    <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 max-w-sm w-full">

                        {/* Sparkles Icon Ring */}
                        <motion.div variants={itemVariants} className="relative flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 mb-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.3, stiffness: 200, damping: 20 }}
                            >
                                <Sparkles className="w-8 h-8 stroke-[2.5]" />
                            </motion.div>
                            {/* Outer animated ring */}
                            <motion.svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                                <motion.circle
                                    cx="32" cy="32" r="30"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.3 }}
                                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                />
                            </motion.svg>
                        </motion.div>

                        {/* Text Group */}
                        <motion.div variants={itemVariants} className="flex flex-col items-center gap-1.5">
                            <h2 className="text-zinc-900 dark:text-zinc-50 font-bold text-2xl tracking-tight leading-tight">
                                Welcome, {firstName}
                            </h2>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                Your profile is ready to go.
                            </p>
                        </motion.div>

                        {/* Mock User Card */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-4 flex items-center gap-4 w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 shadow-sm"
                        >
                            <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-lg ring-1 ring-zinc-900/5 dark:ring-white/10">
                                {firstName.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex flex-col min-w-0 text-left gap-0.5 flex-1">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-tight truncate">
                                    @{username}
                                </p>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">
                                    DeeperWeave Member
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}