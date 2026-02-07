'use client';

import { ReactNode, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    MdEngineering,
    MdSupportAgent,
    MdVerified,
    MdRateReview,
    MdExplicit,
    MdBugReport,
    MdTerminal,
    MdAutoAwesome
} from 'react-icons/md';
import { UserRole } from '@/lib/definitions';
import { DM_Serif_Display } from 'next/font/google';
import { cn } from "@/lib/utils";

// --- Fonts ---
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });

// --- Configuration ---
type BadgeConfigData = {
    title: string;
    description: string;
    icon: ReactNode;
    colors: {
        triggerBg: string;
        triggerText: string;
        triggerBorder: string;
        modalGlow: string;
        modalIconText: string;
        shimmer?: string;
    };
};

const BADGE_CONFIG: Record<string, BadgeConfigData> = {
    newbie: {
        title: "New member!",
        description: "A fresh face in the Weave. They've just joined the community—say hello and help them discover their new favorites.",
        icon: <MdAutoAwesome className="w-full h-full" />,
        colors: {
            triggerBg: "bg-cyan-100 dark:bg-cyan-900/30",
            triggerText: "text-cyan-700 dark:text-cyan-400",
            triggerBorder: "border-cyan-200 dark:border-cyan-800",
            modalGlow: "from-cyan-500/30 to-transparent",
            modalIconText: "text-cyan-600 dark:text-cyan-400",
            shimmer: "rgba(34, 211, 238, 0.2)"
        }
    },
    developer: {
        title: "Core Developer",
        description: "A master architect with direct access to the Deeperweave source code. They build the reality you experience.",
        icon: <MdTerminal className="w-full h-full" />,
        colors: {
            triggerBg: "bg-amber-100 dark:bg-amber-900/30",
            triggerText: "text-amber-700 dark:text-amber-400",
            triggerBorder: "border-amber-200 dark:border-amber-800",
            modalGlow: "from-amber-500/30 to-transparent",
            modalIconText: "text-amber-600 dark:text-amber-400",
            shimmer: "rgba(251, 191, 36, 0.2)"
        }
    },
    staff: {
        title: "Staff Member",
        description: "An official architect of the Deeperweave platform. This user helps build, maintain, and curate the experience.",
        icon: <MdEngineering className="w-full h-full" />,
        colors: {
            triggerBg: "bg-zinc-900 dark:bg-zinc-100",
            triggerText: "text-zinc-100 dark:text-zinc-900",
            triggerBorder: "border-zinc-700",
            modalGlow: "from-zinc-500/20 to-transparent",
            modalIconText: "text-zinc-900 dark:text-white",
            shimmer: "rgba(161, 161, 170, 0.2)"
        }
    },
    support: {
        title: "Official Support",
        description: "A verified support specialist dedicated to resolving technical issues and ensuring account security.",
        icon: <MdSupportAgent className="w-full h-full" />,
        colors: {
            triggerBg: "bg-emerald-100 dark:bg-emerald-900/30",
            triggerText: "text-emerald-700 dark:text-emerald-400",
            triggerBorder: "border-emerald-200 dark:border-emerald-800",
            modalGlow: "from-emerald-500/30 to-transparent",
            modalIconText: "text-emerald-600 dark:text-emerald-400",
            shimmer: "rgba(52, 211, 153, 0.2)"
        }
    },
    verified: {
        title: "Verified Account",
        description: "The authentic presence of a notable public figure, creator, or entity within the cinematic weave.",
        icon: <MdVerified className="w-full h-full" />,
        colors: {
            triggerBg: "bg-transparent",
            triggerText: "text-blue-500 dark:text-blue-400",
            triggerBorder: "border-transparent",
            modalGlow: "from-blue-500/30 to-transparent",
            modalIconText: "text-blue-600 dark:text-blue-400",
            shimmer: "transparent"
        }
    },
    critic: {
        title: "Verified Critic",
        description: "A recognized voice in film criticism. This user provides top-tier analysis and journalistic reviews.",
        icon: <MdRateReview className="w-full h-full" />,
        colors: {
            triggerBg: "bg-indigo-50 dark:bg-indigo-900/30",
            triggerText: "text-indigo-600 dark:text-indigo-300",
            triggerBorder: "border-indigo-200 dark:border-indigo-800",
            modalGlow: "from-indigo-500/30 to-transparent",
            modalIconText: "text-indigo-600 dark:text-indigo-400",
            shimmer: "rgba(129, 140, 248, 0.2)"
        }
    },
    tester: {
        title: "Beta Tester",
        description: "An elite tester who helps identify bugs, provide feedback, and shape the future of Deeperweave through early access.",
        icon: <MdBugReport className="w-full h-full" />,
        colors: {
            triggerBg: "bg-purple-50 dark:bg-purple-900/30",
            triggerText: "text-purple-600 dark:text-purple-300",
            triggerBorder: "border-purple-200 dark:border-purple-800",
            modalGlow: "from-purple-500/30 to-transparent",
            modalIconText: "text-purple-600 dark:text-purple-400",
            shimmer: "rgba(168, 85, 247, 0.2)"
        }
    },
    nsfw: {
        title: "Sensitive Profile",
        description: "This profile may contain content suitable for mature audiences only. Viewer discretion is advised.",
        icon: <MdExplicit className="w-full h-full" />,
        colors: {
            triggerBg: "bg-rose-50 dark:bg-rose-950/30",
            triggerText: "text-rose-600 dark:text-rose-400",
            triggerBorder: "border-rose-200 dark:border-rose-900",
            modalGlow: "from-rose-500/30 to-transparent",
            modalIconText: "text-rose-600 dark:text-rose-500",
            shimmer: "rgba(251, 113, 133, 0.2)"
        }
    }
};

// --- Single Interactive Badge Component ---
function InteractiveBadge({ type, config }: { type: string, config: BadgeConfigData }) {
    const [isOpen, setIsOpen] = useState(false); // Controlled state

    const isBoxyStyle = type === 'nsfw';
    const isVerified = type === 'verified';
    const isDeveloper = type === 'developer';

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "group relative flex items-center justify-center focus:outline-none transition-transform active:scale-95 overflow-hidden shrink-0", // Added shrink-0
                        isVerified
                            ? ''
                            : isBoxyStyle
                                ? `px-1.5 py-0.5 rounded-[2px] border ${config.colors.triggerBg} ${config.colors.triggerBorder}`
                                : `gap-1.5 px-2.5 py-0.5 rounded-full border ${config.colors.triggerBg} ${config.colors.triggerBorder}`
                    )}
                >
                    {/* Continuous Background Shimmer Effect */}
                    {!isVerified && config.colors.shimmer && config.colors.shimmer !== 'transparent' && (
                        <>
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: `linear-gradient(90deg, transparent, ${config.colors.shimmer}, transparent)`,
                                    animation: 'shimmer 3s linear infinite'
                                }}
                            />
                            <style jsx>{`
                                @keyframes shimmer {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(200%); }
                                }
                            `}</style>
                        </>
                    )}

                    {/* Pulse Effect for Verified */}
                    {isVerified && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 rounded-full bg-blue-400/20 dark:bg-blue-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                        </div>
                    )}

                    {/* Badge Content */}
                    {isVerified ? (
                        <div className={`relative ${config.colors.triggerText} hover:brightness-110 transition-all hover:scale-110 duration-300`}>
                            <div className="w-5 h-5">{config.icon}</div>
                        </div>
                    ) : isBoxyStyle ? (
                        <span className={`relative text-[9px] font-bold uppercase tracking-widest leading-none select-none ${config.colors.triggerText}`}>
                            NSFW
                        </span>
                    ) : (
                        <>
                            <div className={`relative w-3.5 h-3.5 ${config.colors.triggerText} group-hover:scale-110 transition-transform duration-300`}>
                                {config.icon}
                            </div>
                            <span className={cn(
                                "relative text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
                                config.colors.triggerText,
                                isDeveloper && "font-mono"
                            )}>
                                {type === 'staff' ? 'Staff' : type === 'developer' ? 'Dev' : type}
                            </span>
                        </>
                    )}
                </button>
            </DialogTrigger>

            {/* --- Modal Content --- */}
            {/* 1. [&>button]:hidden -> Hides the default shadcn close 'X' button
                2. w-[90vw] -> Ensures it fits on mobile screens (90% width)
                3. max-w-sm -> Ensures it doesn't get huge on desktop
            */}
            <DialogContent className="w-[90vw] max-w-sm p-0 overflow-hidden rounded-3xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-xl shadow-2xl [&>button]:hidden">

                {/* Glow Effect Top */}
                <div className={`absolute top-0 inset-x-0 h-40 bg-gradient-to-b ${config.colors.modalGlow} opacity-40 pointer-events-none`} />

                <div className="relative flex flex-col items-center text-center p-6 md:p-8 pt-10 md:pt-12">

                    {/* Icon Section */}
                    <div className="relative mb-6">
                        <div
                            className={`absolute inset-0 blur-2xl opacity-50 animate-pulse`}
                            style={{
                                animationDuration: '3s',
                                backgroundColor: 'currentColor'
                            }}
                        >
                            <div className={`${config.colors.modalIconText} w-full h-full opacity-0`}>.</div>
                        </div>
                        <div className={`relative z-10 w-14 h-14 md:w-16 md:h-16 ${config.colors.modalIconText} drop-shadow-sm`}>
                            {config.icon}
                        </div>
                    </div>

                    <DialogHeader className="mb-3 space-y-0">
                        <DialogTitle className={`${dmSerif.className} text-2xl md:text-3xl text-zinc-900 dark:text-white text-center`}>
                            {config.title}
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-[260px] mx-auto">
                        {config.description}
                    </p>

                    {/* Custom Close Button */}
                    <div className="mt-8 w-full">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="group w-full relative overflow-hidden rounded-full bg-zinc-900 dark:bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-white dark:text-black transition-transform active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-zinc-800 dark:hover:bg-zinc-200"
                        >
                            <span className="relative z-10">Understood</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Export ---
export default function UserBadge({ role, isNsfw }: { role: UserRole, isNsfw?: boolean }) {
    const activeBadges: { type: string, config: BadgeConfigData }[] = [];

    // Prioritize developer/staff roles, but always allow NSFW
    if (isNsfw && BADGE_CONFIG.nsfw) {
        activeBadges.push({ type: 'nsfw', config: BADGE_CONFIG.nsfw });
    }

    if (role && role !== 'user' && BADGE_CONFIG[role]) {
        activeBadges.push({ type: role, config: BADGE_CONFIG[role] });
    }

    if (activeBadges.length === 0) return null;

    // Added flex-wrap for extreme edge cases where a user might have many badges on a tiny screen
    return (
        <div className="flex flex-wrap items-center gap-2">
            {activeBadges.map((badge) => (
                <InteractiveBadge key={badge.type} type={badge.type} config={badge.config} />
            ))}
        </div>
    );
}