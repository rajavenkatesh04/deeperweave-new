'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { LogOut } from 'lucide-react';

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

export function GoodbyeScene() {
    const searchParams = useSearchParams();
    const displayName = searchParams.get('name') ?? '';

    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!displayName) {
            window.location.replace('/');
            return;
        }

        // Give it 2 seconds to admire the UI before exiting
        const exitTimer = setTimeout(() => setExiting(true), 2000);
        // Hard navigation to the deleted confirmation page
        const navTimer = setTimeout(() => window.location.replace('/account-deleted'), 2500);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [displayName]);

    if (!displayName) return null;

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

                        {/* LogOut Icon Ring */}
                        <motion.div variants={itemVariants} className="relative flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 mb-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.3, stiffness: 200, damping: 20 }}
                            >
                                <LogOut className="w-7 h-7 stroke-[2.5] ml-1" />
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
                                Goodbye, {displayName}
                            </h2>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                Your account has been permanently deleted.
                            </p>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}