'use client';

import { useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';

export function WelcomeScene() {
    const searchParams = useSearchParams();
    const firstName = searchParams.get('first') ?? '';
    const username = searchParams.get('username') ?? '';

    const containerRef = useRef<HTMLDivElement>(null);

    // Generate cinematic "Projector Sparks" (fast, glowing embers)
    const sparks = useMemo(() => {
        const colors = ['#ffffff', '#fcd34d', '#fb923c', '#60a5fa']; // White, Gold, Orange, Light Blue
        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 1,
            left: Math.random() * 100,
            delay: Math.random() * 2
        }));
    }, []);

    useLayoutEffect(() => {
        if (!firstName || !containerRef.current) return;

        let ctx = gsap.context(() => {
            // 1. Initial Reset State
            gsap.set('.gsap-brand', { opacity: 0, letterSpacing: '0.8em', y: -20 });
            gsap.set('.gsap-welcome-text', { opacity: 0, y: 20 });
            gsap.set('.gsap-char', {
                opacity: 0,
                scale: 5,
                z: -500, // Deep 3D space
                rotationX: -45,
                filter: 'blur(20px)',
                textShadow: '0px 0px 0px rgba(255,0,0,0), 0px 0px 0px rgba(0,255,255,0)'
            });
            gsap.set('.gsap-line', { scaleX: 0, transformOrigin: 'center' });
            gsap.set('.gsap-tagline', { opacity: 0, y: 10 });
            gsap.set('.gsap-spark', { y: '100vh', opacity: 0 });
            gsap.set('.gsap-main-wrapper', { transformOrigin: 'center center' });

            // 2. The Master Timeline
            const tl = gsap.timeline({
                onComplete: () => {
                    // Cache-busting hard navigation the exact millisecond the screen goes black
                    window.location.replace(`/profile/${username}/home?welcome=true&name=${encodeURIComponent(username)}`);
                }
            });

            // --- THE SETUP ---
            tl.to('.gsap-brand', { opacity: 0.3, letterSpacing: '0.3em', y: 0, duration: 1.5, ease: 'expo.out' })
                .to('.gsap-welcome-text', { opacity: 0.7, y: 0, duration: 1, ease: 'power3.out' }, "-=1");

            // --- THE 3D SLAM (Name Reveal) ---
            tl.to('.gsap-char', {
                opacity: 1,
                scale: 1,
                z: 0,
                rotationX: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                stagger: 0.08,
                ease: 'back.out(1.2)'
            }, "-=0.5");

            // --- CHROMATIC ABERRATION GLITCH (The Hollywood Touch) ---
            // As soon as the letters land, they briefly flash RGB channels
            tl.to('.gsap-char', {
                textShadow: '-4px 0px 10px rgba(255,0,0,0.6), 4px 0px 10px rgba(0,255,255,0.6)',
                duration: 0.1,
                stagger: 0.08,
                yoyo: true,
                repeat: 1
            }, "-=0.8"); // Sync with the slam

            // --- THE UNDERLINE & TAGLINE ---
            tl.to('.gsap-line', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, "-=0.4")
                .to('.gsap-tagline', { opacity: 0.5, y: 0, duration: 1, ease: 'power2.out' }, "-=0.8");

            // --- THE SPARKS (Continuous Background Action) ---
            gsap.to('.gsap-spark', {
                y: '-20vh', // Fly past the top of the screen
                opacity: 'random(0.2, 0.8)',
                x: 'random(-50, 50)', // Subtle drifting
                duration: 'random(1.5, 3)',
                stagger: { amount: 2, repeat: -1 }, // Infinite looping stagger
                ease: 'power1.in'
            });

            // --- THE CRT TV TURN-OFF EXIT ---
            // Wait ~1.5 seconds to admire the name, then hyperdrive exit
            tl.to('.gsap-main-wrapper', {
                scaleY: 0.005, // Squash it flat immediately
                scaleX: 3, // Stretch it wide
                opacity: 1, // Keep it bright for the flash
                filter: 'brightness(3) blur(4px)', // Overexpose it
                duration: 0.25,
                ease: 'expo.in'
            }, "+=1.5")
                .to('.gsap-main-wrapper', {
                    scaleX: 0, // Collapse the horizontal line to nothing
                    opacity: 0,
                    duration: 0.15,
                    ease: 'power4.out'
                });

        }, containerRef);

        return () => ctx.revert();
    }, [firstName, username]);

    // Fast fail for bad routes
    useEffect(() => {
        if (!firstName) window.location.replace('/');
    }, [firstName]);

    if (!firstName) return null;

    const letters = firstName.split('');

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none perspective-[1000px]">

            {/* Film grain */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.15]"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                     backgroundRepeat: 'repeat',
                     backgroundSize: '150px',
                 }}
            />

            {/* Glowing Spotlight Bloom */}
            <div className="absolute inset-0 pointer-events-none z-[1]"
                 style={{
                     background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 80%)',
                 }}
            />

            {/* Cinematic Sparks */}
            <div className="absolute inset-0 z-[2] overflow-hidden">
                {sparks.map((spark) => (
                    <div
                        key={spark.id}
                        className="gsap-spark absolute rounded-full blur-[1px]"
                        style={{
                            width: spark.size,
                            height: spark.size * 2, // Slightly elongated like moving sparks
                            backgroundColor: spark.color,
                            left: `${spark.left}%`,
                            boxShadow: `0 0 ${spark.size * 3}px ${spark.color}`
                        }}
                    />
                ))}
            </div>

            {/* Main Animating Wrapper (This is what gets "CRT Squashed" at the end) */}
            <div className="gsap-main-wrapper relative z-10 flex flex-col items-center px-6 w-full max-w-[90vw]">

                {/* Brand mark */}
                <p className="gsap-brand text-white text-[9px] font-bold uppercase mb-12 tracking-[0.45em]">
                    DeeperWeave
                </p>

                {/* "Welcome," */}
                <span className="gsap-welcome-text text-white/80 text-sm sm:text-base font-medium tracking-[0.25em] uppercase mb-2">
                    Welcome,
                </span>

                {/* Name — Per-Letter 3D Slam Reveal */}
                <div className="flex flex-wrap justify-center overflow-visible" aria-label={firstName}>
                    {letters.map((char, i) => (
                        <span
                            key={i}
                            className="gsap-char inline-block text-white text-[10vw] sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight"
                            style={{
                                // Fix for spaces taking up no width in inline blocks
                                width: char === ' ' ? '0.3em' : 'auto',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            {char}
                        </span>
                    ))}
                </div>

                {/* Underline draw */}
                <div className="w-full max-w-lg h-px bg-white/20 mt-6 overflow-hidden">
                    <div className="gsap-line w-full h-full bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                </div>

                {/* Tagline */}
                <p className="gsap-tagline text-white/60 text-[10px] sm:text-[11px] uppercase tracking-[0.4em] mt-8 font-semibold">
                    Your profile is ready
                </p>
            </div>

        </div>
    );
}