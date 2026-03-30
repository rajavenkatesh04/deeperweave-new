'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Check } from 'lucide-react';

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = rating >= star ? '100%' : rating >= star - 0.5 ? '50%' : '0%';
                return (
                    <div key={star} className="relative w-4 h-4">
                        <svg viewBox="0 0 24 24" className="absolute inset-0 w-4 h-4 fill-current text-zinc-200 dark:text-zinc-800">
                            <path d={STAR_PATH} />
                        </svg>
                        <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: fill }}>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-zinc-900 dark:text-zinc-100 shrink-0">
                                <path d={STAR_PATH} />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// -- Animation Variants for that sleek Shadcn/Vercel vibe --
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

export function ReviewScene() {
    const searchParams = useSearchParams();

    const title  = searchParams.get('title') ?? '';
    const type   = searchParams.get('type') ?? 'movie';
    const poster = searchParams.get('poster') ?? '';
    const rating = parseFloat(searchParams.get('rating') ?? '0');
    const dest   = searchParams.get('dest') ?? '/discover';

    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!title) {
            window.location.replace(dest);
            return;
        }

        // Give it a solid 2 seconds to admire the UI before exiting
        const exitTimer = setTimeout(() => setExiting(true), 2000);
        // Hard navigation to bust the Next.js router cache
        const navTimer  = setTimeout(() => window.location.replace(dest), 2500);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [title, dest]);

    if (!title) return null;

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

                        {/* Success Checkmark Ring */}
                        <motion.div variants={itemVariants} className="relative flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 mb-2">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.3, stiffness: 200, damping: 20 }}
                            >
                                <Check className="w-8 h-8 stroke-[3]" />
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
                                Successfully Logged
                            </h2>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                Your review has been saved to your timeline.
                            </p>
                        </motion.div>

                        {/* Media Card */}
                        <motion.div
                            variants={itemVariants}
                            className="mt-4 flex items-center gap-4 w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 shadow-sm"
                        >
                            {poster ? (
                                <div className="shrink-0 w-14 rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 ring-1 ring-zinc-900/5 dark:ring-white/10">
                                    <img
                                        src={`https://image.tmdb.org/t/p/w185${poster}`}
                                        alt={title}
                                        className="w-full aspect-[2/3] object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="shrink-0 w-14 aspect-[2/3] rounded-md bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                                    <span className="text-zinc-400 text-xs uppercase font-bold">No img</span>
                                </div>
                            )}

                            <div className="flex flex-col min-w-0 text-left gap-1.5 flex-1">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-tight truncate">
                                    {title}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                                        {type === 'movie' ? 'Movie' : 'TV'}
                                    </span>
                                    {rating > 0 && <Stars rating={rating} />}
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}