'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export function GoodbyeScene() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const displayName = searchParams.get('name') ?? '';
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!displayName) {
            router.replace('/');
            return;
        }

        const exitTimer = setTimeout(() => setExiting(true), 3600);
        const navTimer  = setTimeout(() => router.replace('/'), 4700);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [displayName, router]);

    if (!displayName) return null;

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden select-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={exiting ? { duration: 1.0, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
        >
            {/* Film grain — same texture as welcome */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '180px',
                    opacity: 0.08,
                }}
            />

            {/* Subtle warm glow — amber instead of cool white */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 3, ease: 'easeOut' }}
                style={{
                    background:
                        'radial-gradient(ellipse 60% 40% at 50% 52%, rgba(251,191,36,0.03) 0%, transparent 70%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Brand mark */}
                <motion.p
                    initial={{ opacity: 0, letterSpacing: '0.45em' }}
                    animate={{ opacity: 0.18, letterSpacing: '0.28em' }}
                    transition={{ delay: 0.3, duration: 1.6, ease: 'easeOut' }}
                    className="text-white text-[9px] font-bold uppercase mb-10"
                >
                    DeeperWeave
                </motion.p>

                {/* "Goodbye," */}
                <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.35, y: 0 }}
                    transition={{ delay: 0.9, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                    className="text-white text-base sm:text-lg font-light tracking-[0.22em] uppercase mb-3"
                >
                    Goodbye,
                </motion.span>

                {/* Name — gentle fade-up (no letter animation; quieter tone) */}
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-white text-[13vw] sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none"
                >
                    {displayName}
                </motion.p>

                {/* Underline draw */}
                <div className="w-full overflow-hidden mt-3">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        transition={{ delay: 2.0, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-px bg-white/12"
                    />
                </div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.22 }}
                    transition={{ delay: 2.7, duration: 1.0 }}
                    className="text-white/40 text-[10px] uppercase tracking-[0.35em] mt-6 font-medium"
                >
                    Thank you for being part of this.
                </motion.p>
            </div>
        </motion.div>
    );
}
