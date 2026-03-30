'use client';

import { useEffect, useRef, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';

export function GoodbyeScene() {
    const searchParams = useSearchParams();
    const displayName = searchParams.get('name') ?? '';

    const containerRef = useRef<HTMLDivElement>(null);

    // Generate 150 particles: a mix of glowing embers and dead grey ashes
    const particles = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => {
            const isEmber = Math.random() > 0.6; // 40% embers, 60% ash
            return {
                id: i,
                isEmber,
                size: Math.random() * 4 + 1,
                // Cluster them roughly around the center where the text is
                startX: Math.random() * 60 - 30,
                startY: Math.random() * 40 - 20,
            };
        });
    }, []);

    useLayoutEffect(() => {
        if (!displayName || !containerRef.current) return;

        let ctx = gsap.context(() => {
            // 1. Initial State
            gsap.set('.gsap-brand, .gsap-goodbye, .gsap-tagline', { opacity: 0 });
            gsap.set('.gsap-line', { scaleX: 0, transformOrigin: 'center' });
            gsap.set('.gsap-char', { opacity: 0, y: 10 });
            gsap.set('.gsap-particle', { opacity: 0, scale: 0 });
            gsap.set('.gsap-fire-glow', { opacity: 0, y: '50vh' }); // Fire starts low

            const tl = gsap.timeline({
                onComplete: () => {
                    // Hard redirect to clear session/cache once the screen is dead black
                    window.location.replace('/account-deleted');
                }
            });

            // --- PHASE 1: The Solemn Goodbye ---
            tl.to('.gsap-brand', { opacity: 0.2, duration: 1.5, ease: 'power2.out' })
                .to('.gsap-goodbye', { opacity: 0.6, duration: 1, ease: 'power2.out' }, "-=0.5")
                .to('.gsap-char', {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    stagger: 0.05,
                    ease: 'power3.out'
                }, "-=0.5")
                .to('.gsap-line', { scaleX: 1, duration: 1, ease: 'expo.inOut' }, "-=0.5")
                .to('.gsap-tagline', { opacity: 0.45, duration: 1 }, "-=0.5");

            // Hold the solemn state for 1.5 seconds...
            tl.addLabel("hold", "+=1.5");

            // --- PHASE 2: The Ignition ---
            // A fiery glow creeps up from the bottom right
            tl.to('.gsap-fire-glow', {
                opacity: 0.8,
                y: '10vh',
                duration: 2,
                ease: 'power1.inOut'
            }, "hold");

            // The letters heat up, turning into glowing embers (from right to left)
            tl.to('.gsap-char', {
                color: '#fb923c', // Ember orange
                textShadow: '0 0 20px #ea580c, 0 0 40px #dc2626',
                duration: 0.8,
                stagger: { from: 'end', amount: 0.5 }, // Starts heating from the right
                ease: 'power2.in'
            }, "hold+=0.5");

            // --- PHASE 3: The Ashing & The Wind ---
            // The letters disintegrate and blow top-left
            tl.to('.gsap-char', {
                x: '-=200',
                y: '-=200',
                rotation: 'random(-45, 45)',
                opacity: 0,
                filter: 'blur(12px)',
                duration: 1.5,
                stagger: { from: 'end', amount: 0.5 },
                ease: 'power3.in'
            }, "hold+=1.2");

            // The UI elements burn away
            tl.to('.gsap-brand, .gsap-goodbye, .gsap-line, .gsap-tagline', {
                opacity: 0,
                filter: 'blur(8px)',
                y: '-=50',
                x: '-=50',
                duration: 1.5,
                ease: 'power2.in'
            }, "hold+=1.2");

            // The Ash Particles explode from the text and ride the wind top-left
            tl.to('.gsap-particle', {
                opacity: (i, el) => el.classList.contains('is-ember') ? 1 : 0.6,
                scale: 'random(0.5, 1.5)',
                x: () => `-=${Math.random() * 800 + 400}`, // Aggressive wind to the left
                y: () => `-=${Math.random() * 800 + 400}`, // Aggressive wind upwards
                rotation: 'random(-720, 720)',
                duration: 'random(1.5, 2.5)',
                ease: 'power2.out',
                stagger: { amount: 0.3 }
            }, "hold+=1.3");

            // Embers burn out into dead ash mid-flight
            tl.to('.is-ember', {
                backgroundColor: '#52525b', // Turn to grey ash
                boxShadow: 'none',
                duration: 0.5,
                stagger: { amount: 0.5 }
            }, "hold+=1.8");

            // Fade all particles out as they scatter into the distance
            tl.to('.gsap-particle', {
                opacity: 0,
                duration: 1,
                ease: 'power1.inOut'
            }, "hold+=2.5");

            // --- PHASE 4: The Void ---
            // Extinguish the fire glow, leaving pure black
            tl.to('.gsap-fire-glow', {
                opacity: 0,
                duration: 1,
                ease: 'power2.inOut'
            }, "hold+=2.5");

            // Add a tiny buffer of pure black before the navigation triggers
            tl.to({}, { duration: 0.5 });

        }, containerRef);

        return () => ctx.revert();
    }, [displayName]);

    // Fast fail for bad routes
    useEffect(() => {
        if (!displayName) window.location.replace('/');
    }, [displayName]);

    if (!displayName) return null;

    const letters = displayName.split('');

    return (
        <div ref={containerRef} className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center overflow-hidden select-none pointer-events-none">

            {/* Film grain (keeps it feeling cinematic, not flat) */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '150px',
                }}
            />

            {/* The Fire Glow (Rises from bottom right) */}
            <div className="gsap-fire-glow absolute bottom-0 right-0 w-[80vw] h-[80vh] rounded-full blur-[100px] bg-gradient-to-tl from-orange-600/30 via-red-600/10 to-transparent mix-blend-screen translate-x-1/4 translate-y-1/4 z-[1]" />

            {/* The Ash/Ember Particle Engine */}
            <div className="absolute inset-0 z-[2] flex items-center justify-center pointer-events-none">
                {particles.map((p) => (
                    <div
                        key={p.id}
                        className={`gsap-particle absolute rounded-full ${p.isEmber ? 'is-ember bg-orange-500 shadow-[0_0_10px_#ea580c]' : 'bg-zinc-500'}`}
                        style={{
                            width: p.size,
                            height: p.size,
                            marginLeft: `${p.startX}vw`,
                            marginTop: `${p.startY}vh`,
                        }}
                    />
                ))}
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-[90vw]">

                {/* Brand mark */}
                <p className="gsap-brand text-white text-[9px] font-bold uppercase mb-10 tracking-[0.28em]">
                    DeeperWeave
                </p>

                {/* "Goodbye," */}
                <span className="gsap-goodbye text-white font-light tracking-[0.22em] uppercase mb-3 text-sm sm:text-base">
                    Goodbye,
                </span>

                {/* Name — Split into characters for independent burning */}
                <div className="flex flex-wrap justify-center overflow-visible">
                    {letters.map((char, i) => (
                        <span
                            key={i}
                            className="gsap-char inline-block text-white text-[9vw] sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-none"
                            style={{ width: char === ' ' ? '0.3em' : 'auto' }}
                        >
                            {char}
                        </span>
                    ))}
                </div>

                {/* Underline */}
                <div className="w-full max-w-md h-px bg-white/10 mt-5 overflow-hidden">
                    <div className="gsap-line w-full h-full bg-white/40" />
                </div>

                {/* Tagline */}
                <p className="gsap-tagline text-white/70 text-[11px] uppercase tracking-[0.35em] mt-6 font-medium text-center">
                    Thank you for being part of this.
                </p>
            </div>
        </div>
    );
}