'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    WatchHistoryMockup,
    AnalyticsMockup,
    BlogMockup,
    ListsMockup,
    SafetyMockup,
    PodiumMockup,
    DiscoveryMockup
} from './FeatureMockups';
import { geistSans } from "@/app/ui/shared/fonts";
import clsx from 'clsx';

const features = [
    {
        id: 'history',
        label: "Track",
        title: "Precision Logging.",
        description: "Log movies, anime, series & kdrama. Rate, review, and tag your viewing context.",
        component: <WatchHistoryMockup />,
        color: "from-blue-500/20 to-purple-500/20"
    },
    {
        id: 'analytics',
        label: "Analyze",
        title: "Deep Insights.",
        description: "Visualize your habits with cinematic heatmaps and watch time stats.",
        component: <AnalyticsMockup />,
        color: "from-emerald-500/20 to-teal-500/20"
    },
    {
        id: 'blogs',
        label: "Write",
        title: "Full-Length Blogs.",
        description: "Publish essays and reviews with a rich text editor built for cinephiles.",
        component: <BlogMockup />,
        color: "from-orange-500/20 to-red-500/20"
    },
    {
        id: 'lists',
        label: "Curate",
        title: "Custom Lists.",
        description: "Rank, annotate, and share collections with the world.",
        component: <ListsMockup />,
        color: "from-pink-500/20 to-rose-500/20"
    },
    {
        id: 'safety',
        label: "Safety",
        title: "Content Guard.",
        description: "Browse safely with SFW Mode. Explicit posters and backdrops are blurred automatically.",
        component: <SafetyMockup />,
        color: "from-zinc-500/20 to-slate-500/20"
    },
    {
        id: 'podium',
        label: "Identity",
        title: "The Podium.",
        description: "Define your taste. Rank your top 3 movies, shows, or characters in custom sections.",
        component: <PodiumMockup />,
        color: "from-amber-500/20 to-yellow-500/20"
    },
    {
        id: 'discovery',
        label: "Explore",
        title: "Smart Discovery.",
        description: "Localized trending feeds. See what's hitting big in Bollywood, Anime, or K-Drama.",
        component: <DiscoveryMockup />,
        color: "from-cyan-500/20 to-blue-500/20"
    }
];

export default function FeatureCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const slideVariants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    };

    return (
        <section className="relative w-full h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-black p-4 pt-20 md:p-8 md:pt-24 overflow-hidden">

            <div className="relative w-full max-w-7xl h-full max-h-[85vh] flex flex-col md:flex-row bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        className="flex flex-col md:flex-row w-full h-full"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {/* LEFT: Text Content */}
                        <div className="w-full md:w-2/5 shrink-0 px-6 pt-8 pb-6 md:p-12 flex flex-col justify-center items-start z-10 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-100 dark:border-zinc-800">

                            {/* Header Row: Label + Inline Dots */}
                            <div className="flex items-center gap-4 mb-4 md:mb-6 w-full">
                                <span className={clsx("inline-block px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400", geistSans.className)}>
                                    {features[currentIndex].label}
                                </span>

                                {/* Inline Pagination Dots */}
                                <div className="flex gap-1.5">
                                    {features.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentIndex(index)}
                                            className={clsx(
                                                "transition-all duration-300 rounded-full h-1 md:h-1.5",
                                                index === currentIndex
                                                    ? "w-4 md:w-6 bg-zinc-900 dark:bg-white"
                                                    : "w-1 md:w-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                                            )}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 md:space-y-6">
                                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
                                    {features[currentIndex].title}
                                </h2>

                                {/* Increased Font Size */}
                                <p className="text-sm md:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                                    {features[currentIndex].description}
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: Visual/Mockup Area */}
                        <div className="relative w-full md:w-3/5 flex-1 min-h-0 bg-zinc-50 dark:bg-black/40 overflow-hidden flex items-center justify-center p-4 md:p-8">
                            <div className={`absolute inset-0 bg-gradient-to-br ${features[currentIndex].color} opacity-30`} />
                            <div className="relative w-full max-w-sm md:max-w-xl h-full flex items-center justify-center z-10">
                                {features[currentIndex].component}
                            </div>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}