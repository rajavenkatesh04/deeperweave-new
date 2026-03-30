'use client';

import { useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import gsap from 'gsap';

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = rating >= star ? '100%' : rating >= star - 0.5 ? '50%' : '0%';
                return (
                    <div key={star} className="relative w-4 h-4">
                        <svg viewBox="0 0 24 24" className="absolute inset-0 w-4 h-4 fill-current text-zinc-300 dark:text-zinc-700">
                            <path d={STAR_PATH} />
                        </svg>
                        <div className="absolute top-0 left-0 h-full overflow-hidden" style={{ width: fill }}>
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-amber-500 shrink-0">
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
    const searchParams = useSearchParams();

    const title = searchParams.get('title') ?? '';
    const type = searchParams.get('type') ?? 'movie';
    const poster = searchParams.get('poster') ?? '';
    const rating = parseFloat(searchParams.get('rating') ?? '0');
    const dest = searchParams.get('dest') ?? '/discover';

    const containerRef = useRef<HTMLDivElement>(null);

    // Generate 60 particles for the Vercel-style confetti burst
    const particles = useMemo(() => {
        const colors = ['#0070F3', '#7928CA', '#FF0080', '#F5A623', '#00DFD8', '#10B981'];
        return Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            shape: Math.random() > 0.5 ? 'circle' : 'rect'
        }));
    }, []);

    useLayoutEffect(() => {
        if (!title || !containerRef.current) return;

        let ctx = gsap.context(() => {
            // 1. Initial State
            gsap.set('.gsap-bg', { opacity: 0 });
            gsap.set('.gsap-card-wrapper', { scale: 0.5, opacity: 0, rotationY: -90, transformPerspective: 1200 });
            gsap.set('.gsap-particle', { x: 0, y: 0, scale: 0, opacity: 1 });
            gsap.set('.gsap-glow', { opacity: 0, scale: 0.8 });

            // 2. The Master Timeline
            const tl = gsap.timeline({
                onComplete: () => {
                    // Force cache-busting hard navigation when the spectacle ends
                    window.location.replace(dest);
                }
            });

            // --- THE SPECTACLE ENTRANCE ---
            tl.to('.gsap-bg', { opacity: 1, duration: 0.4, ease: 'power2.out' })
                // Pop the radial glow
                .to('.gsap-glow', { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, '-=0.2')
                // 3D Flip the card into existence
                .to('.gsap-card-wrapper', {
                    scale: 1,
                    opacity: 1,
                    rotationY: 0,
                    duration: 1,
                    ease: 'back.out(1.2)'
                }, '-=0.6');

            // --- THE CONFETTI EXPLOSION ---
            // Triggered exactly as the card hits its final scale
            gsap.to('.gsap-particle', {
                x: 'random(-500, 500)',
                y: 'random(-500, 500)',
                z: 'random(-200, 200)', // 3D depth for particles
                rotationX: 'random(-720, 720)',
                rotationY: 'random(-720, 720)',
                rotationZ: 'random(-720, 720)',
                scale: 'random(0.4, 1.5)',
                opacity: 0,
                duration: 'random(1.5, 3)',
                ease: 'expo.out',
                stagger: { amount: 0.1, from: 'center' },
                delay: 0.4 // Timed to sync with the card locking in
            });

            // --- INFINITE SPINNING RAINBOW BORDER ---
            gsap.to('.gsap-spin', {
                rotation: 360,
                duration: 4,
                repeat: -1,
                ease: 'linear'
            });

            // --- THE HOLD & DRAMATIC EXIT ---
            tl.to('.gsap-card-wrapper', {
                scale: 1.15,
                opacity: 0,
                filter: 'blur(20px)',
                duration: 0.5,
                ease: 'power3.in'
            }, "+=2.2") // Hold for 2.2 seconds to admire the burst
                .to('.gsap-bg', { opacity: 0, duration: 0.3 }, "-=0.2");

        }, containerRef);

        return () => ctx.revert();
    }, [title, dest]);

    useEffect(() => {
        if (!title) window.location.replace(dest);
    }, [title, dest]);

    if (!title) return null;

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none pointer-events-none">

            {/* The Vercel Dark/Light Background */}
            <div className="gsap-bg absolute inset-0 bg-zinc-50 dark:bg-[#0A0A0A]" />

            {/* The Epic Radial Glow Behind the Card */}
            <div className="gsap-glow absolute inset-0 flex items-center justify-center">
                <div className="w-[600px] h-[600px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-[80px]" />
            </div>

            {/* Confetti Particle Emitter */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className={`gsap-particle absolute w-3 h-3 ${p.shape === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
                        style={{ backgroundColor: p.color }}
                    />
                ))}
            </div>

            {/* The Main Card Wrapper */}
            <div className="gsap-card-wrapper relative z-30 flex flex-col items-center gap-8 max-w-sm w-full px-6 pointer-events-auto">

                {/* Header Text */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 mb-2 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                        <Check className="w-6 h-6 stroke-[3]" />
                    </div>
                    <h2 className="text-zinc-900 dark:text-white font-black text-3xl tracking-tight leading-tight">
                        Successfully Logged
                    </h2>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Added to your cinematic timeline.
                    </p>
                </div>

                {/* The Rainbow Border Card */}
                <div className="relative w-full rounded-2xl p-[2px] overflow-hidden shadow-2xl shadow-blue-500/20">

                    {/* The Spinning Conic Gradient (The Vercel Magic) */}
                    <div className="gsap-spin absolute inset-[-100%] w-[300%] h-[300%] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#0070F3_75%,#FF0080_100%)] dark:bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,#0070F3_75%,#00DFD8_100%)]" />

                    {/* Inner Card Content */}
                    <div className="relative flex items-center gap-4 w-full p-4 rounded-xl bg-white dark:bg-zinc-950/90 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 h-full">
                        {poster ? (
                            <div className="shrink-0 w-16 rounded-md overflow-hidden ring-1 ring-zinc-200 dark:ring-white/10 shadow-lg">
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${poster}`}
                                    alt={title}
                                    className="w-full aspect-[2/3] object-cover"
                                />
                            </div>
                        ) : (
                            <div className="shrink-0 w-16 aspect-[2/3] rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                <span className="text-zinc-400 text-[10px] uppercase font-bold">No img</span>
                            </div>
                        )}

                        <div className="flex flex-col min-w-0 text-left gap-2 flex-1">
                            <p className="font-bold text-zinc-900 dark:text-white text-lg leading-tight truncate">
                                {title}
                            </p>
                            <div className="flex items-center gap-2.5">
                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-widest ring-1 ring-zinc-200 dark:ring-white/5">
                                    {type === 'movie' ? 'Movie' : 'TV'}
                                </span>
                                {rating > 0 && <Stars rating={rating} />}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}