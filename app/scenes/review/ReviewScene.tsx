'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = rating >= star ? '100%' : rating >= star - 0.5 ? '50%' : '0%';
                return (
                    <div key={star} className="relative w-4 h-4">
                        <svg viewBox="0 0 24 24" className="absolute inset-0 w-4 h-4 fill-current text-white/15">
                            <path d={STAR_PATH} />
                        </svg>
                        <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: fill }}>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white shrink-0">
                                <path d={STAR_PATH} />
                            </svg>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function ReviewScene() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const title  = searchParams.get('title') ?? '';
    const type   = searchParams.get('type') ?? 'movie';
    const poster = searchParams.get('poster') ?? '';
    const rating = parseFloat(searchParams.get('rating') ?? '0');
    const dest   = searchParams.get('dest') ?? '/discover';

    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!title) {
            router.replace(dest);
            return;
        }

        const exitTimer = setTimeout(() => setExiting(true), 1900);
        const navTimer  = setTimeout(() => router.replace(dest), 2700);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [title, dest, router]);

    if (!title) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden select-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={exiting ? { duration: 0.75, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
        >
            {/* Film grain */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '180px',
                    opacity: 0.10,
                }}
            />

            {/* Radial glow */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{
                    background: 'radial-gradient(ellipse 55% 50% at 50% 50%, rgba(255,255,255,0.045) 0%, transparent 70%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center gap-7 px-8 max-w-md w-full">

                {/* Poster */}
                {poster && (
                    <motion.div
                        initial={{ opacity: 0, x: -20, scale: 0.96 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ delay: 0.08, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        className="shrink-0 w-[88px] rounded-lg overflow-hidden shadow-2xl shadow-black/70 ring-1 ring-white/10"
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/w185${poster}`}
                            alt={title}
                            className="w-full aspect-[2/3] object-cover"
                        />
                    </motion.div>
                )}

                {/* Text */}
                <div className="flex flex-col gap-2.5 min-w-0 flex-1">

                    {/* Brand mark */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        transition={{ delay: 0.05, duration: 0.9, ease: 'easeOut' }}
                        className="text-white text-[8px] font-bold uppercase tracking-[0.32em]"
                    >
                        DeeperWeave
                    </motion.p>

                    {/* Title */}
                    <div style={{ overflow: 'hidden' }}>
                        <motion.p
                            initial={{ y: '115%' }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            className="text-white font-bold text-xl sm:text-2xl leading-tight"
                        >
                            {title}
                        </motion.p>
                    </div>

                    {/* Type + Stars */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.45, duration: 0.55 }}
                        className="flex items-center gap-2.5"
                    >
                        <span className="text-white/35 text-[9px] uppercase tracking-widest font-semibold shrink-0">
                            {type === 'movie' ? 'Movie' : 'TV Series'}
                        </span>
                        {rating > 0 && (
                            <>
                                <span className="w-px h-2.5 bg-white/20 shrink-0" />
                                <Stars rating={rating} />
                            </>
                        )}
                    </motion.div>

                    {/* Divider */}
                    <div className="overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            transition={{ delay: 0.55, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                            className="h-px bg-white/10"
                        />
                    </div>

                    {/* "Logged." */}
                    <div style={{ overflow: 'hidden' }}>
                        <motion.p
                            initial={{ y: '115%' }}
                            animate={{ y: 0 }}
                            transition={{ delay: 0.8, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                            className="text-white/45 text-[10px] uppercase tracking-[0.38em] font-medium"
                        >
                            Logged.
                        </motion.p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
