'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export function WelcomeScene() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const firstName = searchParams.get('first') ?? '';
    const username = searchParams.get('username') ?? '';
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (!firstName) {
            router.replace('/');
            return;
        }

        const exitTimer  = setTimeout(() => setExiting(true), 3200);
        const navTimer   = setTimeout(() => {
            router.replace(`/profile/${username}/home?welcome=true&name=${encodeURIComponent(username)}`);
        }, 4100);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(navTimer);
        };
    }, [firstName, username, router]);

    if (!firstName) return null;

    const letters = firstName.split('');

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={exiting ? { duration: 0.85, ease: [0.4, 0, 0.2, 1] } : { duration: 0 }}
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

            {/* Radial glow bloom */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 2.5, ease: 'easeOut' }}
                style={{
                    background:
                        'radial-gradient(ellipse 65% 45% at 50% 52%, rgba(255,255,255,0.055) 0%, transparent 70%)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Brand mark */}
                <motion.p
                    initial={{ opacity: 0, letterSpacing: '0.45em' }}
                    animate={{ opacity: 0.22, letterSpacing: '0.28em' }}
                    transition={{ delay: 0.25, duration: 1.4, ease: 'easeOut' }}
                    className="text-white text-[9px] font-bold uppercase mb-10"
                >
                    DeeperWeave
                </motion.p>

                {/* "Welcome," */}
                <motion.span
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="text-white text-base sm:text-lg font-light tracking-[0.22em] uppercase mb-3"
                >
                    Welcome,
                </motion.span>

                {/* Name — per-letter reveal from below a mask */}
                <div className="flex" aria-label={firstName}>
                    {letters.map((char, i) => (
                        <span
                            key={i}
                            style={{ display: 'inline-block', overflow: 'hidden', lineHeight: 1.15 }}
                        >
                            <motion.span
                                initial={{ y: '108%' }}
                                animate={{ y: 0 }}
                                transition={{
                                    delay: 1.15 + i * 0.055,
                                    duration: 0.8,
                                    ease: [0.16, 1, 0.3, 1],
                                }}
                                style={{ display: 'inline-block' }}
                                className="text-white text-[13vw] sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight"
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        </span>
                    ))}
                </div>

                {/* Underline draw */}
                <div className="w-full overflow-hidden mt-3">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        transition={{ delay: 1.9, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                        className="h-px bg-white/18"
                    />
                </div>

                {/* Subtle tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.25 }}
                    transition={{ delay: 2.5, duration: 0.8 }}
                    className="text-white/50 text-[10px] uppercase tracking-[0.35em] mt-6 font-medium"
                >
                    Your profile is ready
                </motion.p>
            </div>
        </motion.div>
    );
}
