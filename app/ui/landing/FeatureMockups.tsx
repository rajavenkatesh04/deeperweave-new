'use client';

import Image from "next/image";
import {
    StarIcon,
    ArrowPathIcon,
    LinkIcon,
    TvIcon,
    FolderIcon,
    ChevronRightIcon,
    ClockIcon,
    UserGroupIcon,
    EllipsisHorizontalIcon,
    EyeIcon,
    HeartIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    FireIcon,
    EyeSlashIcon
} from "@heroicons/react/24/solid";
import { TicketIcon } from "@heroicons/react/24/outline";
import { geistSans } from "@/app/ui/shared/fonts";
import { clsx } from "clsx";
import { ChartBarIcon } from "lucide-react";

// --- SHARED: Platform Badge Helper ---
const MockupPlatformBadge = ({ platform, bg, text, icon }: any) => (
    <div className={`inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-sm ${bg} shadow-sm border border-black/5 dark:border-white/5`}>
        {icon}
        <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wide ${text}`}>{platform}</span>
    </div>
);

// ==========================================
// 1. WATCH HISTORY MOCKUP (Original)
// ==========================================
export function WatchHistoryMockup() {
    return (
        <div className="w-full h-full flex flex-col justify-center gap-3 select-none pointer-events-none">
            {/* Entry 1 */}
            <div className="flex flex-row w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm shrink-0">
                <div className="relative w-16 md:w-24 shrink-0 bg-zinc-100 dark:bg-zinc-900 aspect-[2/3]">
                    <Image
                        src="https://www.themoviedb.org/t/p/w1280/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
                        alt="Interstellar"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 flex flex-col p-3 min-w-0 justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] uppercase tracking-wide font-semibold text-zinc-500 italic">Just Now</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-sm md:text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100 truncate">Interstellar</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-2">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                            <StarIcon className="w-3 h-3 text-amber-400" />
                            <span>5</span>
                        </div>
                        <MockupPlatformBadge
                            platform="IMAX"
                            bg="bg-rose-600"
                            text="text-white"
                            icon={<TicketIcon className="w-2.5 h-2.5 text-white" />}
                        />
                    </div>
                    <p className={`text-[10px] md:text-xs text-zinc-500 line-clamp-2 ${geistSans.className}`}>
                        The docking scene still gives me chills. Zimmer's score is timeless.
                    </p>
                </div>
            </div>

            {/* Entry 2 */}
            <div className="flex flex-row w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm opacity-80 scale-[0.98] shrink-0">
                <div className="relative w-16 md:w-24 shrink-0 bg-zinc-100 dark:bg-zinc-900 aspect-[2/3]">
                    <Image
                        src="https://www.themoviedb.org/t/p/w1280/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg"
                        alt="AOT"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex-1 flex flex-col p-3 min-w-0 justify-center">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] uppercase tracking-wide font-semibold text-zinc-500 italic">Yesterday</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="text-sm md:text-base font-bold leading-tight text-zinc-900 dark:text-zinc-100 truncate">Attack on Titan</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <div className="flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100">
                            <StarIcon className="w-3 h-3 text-amber-400" />
                            <span>4.5</span>
                        </div>
                        <MockupPlatformBadge
                            platform="Crunchyroll"
                            bg="bg-orange-500"
                            text="text-white"
                            icon={null}
                        />
                        <p className={`text-[10px] md:text-xs text-zinc-500 line-clamp-2 ${geistSans.className}`}>
                            The only reason Shakespeare was considered to be the best writer of all time was because Isayama was not born yet.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 2. ANALYTICS MOCKUP (Original)
// ==========================================
function StatCard({ icon, label, value, sub }: any) {
    return (
        <div className="flex flex-col p-2.5 md:p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl min-w-0">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
                {icon}
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <div className="mt-auto">
                <span className={`text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none ${geistSans.className}`}>
                    {value}
                </span>
                <span className="text-[9px] md:text-[10px] font-medium text-zinc-500 ml-1">{sub}</span>
            </div>
        </div>
    );
}

export function AnalyticsMockup() {
    return (
        <div className="w-full h-full flex flex-col gap-2 md:gap-3 select-none pointer-events-none justify-center">
            {/* Top Row */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 shrink-0">
                <StatCard
                    icon={<ClockIcon className="w-3 h-3" />}
                    label="Time"
                    value="1,240"
                    sub="hrs"
                />
                <StatCard
                    icon={<TicketIcon className="w-3 h-3" />}
                    label="Logs"
                    value="482"
                    sub="films"
                />
                <div className="flex flex-col p-2.5 md:p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl min-w-0">
                    <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
                        <UserGroupIcon className="w-3 h-3" />
                        <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Buddy</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                        <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[9px] font-bold">SJ</div>
                        <div className="leading-none min-w-0">
                            <p className="text-[9px] md:text-[10px] font-bold text-zinc-900 dark:text-zinc-100 truncate">@sarah_j</p>
                            <p className="text-[8px] text-zinc-400 truncate">92% match</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Area */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {/* Heatmap */}
                <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col min-h-0 overflow-hidden relative">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Activity</span>
                        <div className="flex gap-1">
                            <div className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[8px] font-bold text-zinc-400">2024</div>
                            <div className="px-1.5 py-0.5 rounded-full bg-zinc-900 dark:bg-white text-[8px] font-bold text-white dark:text-zinc-900">2025</div>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 flex flex-wrap content-start gap-[2px] opacity-80">
                        {Array.from({ length: 84 }).map((_, i) => {
                            const r = Math.random();
                            let bg = "bg-zinc-100 dark:bg-zinc-900";
                            if (r > 0.9) bg = "bg-red-600";
                            else if (r > 0.8) bg = "bg-orange-500";
                            else if (r > 0.6) bg = "bg-amber-400";
                            else if (r > 0.4) bg = "bg-zinc-200 dark:bg-zinc-800";
                            return <div key={i} className={`w-[8px] h-[8px] md:w-[10px] md:h-[10px] rounded-[1px] ${bg}`} />
                        })}
                    </div>
                </div>

                {/* Platform Breakdown */}
                <div className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col min-h-0">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-2 shrink-0">Platforms</span>
                    <div className="flex-1 min-h-0 flex items-center justify-between gap-2">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#18181b" strokeWidth="12" className="dark:stroke-zinc-800"/>
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E50914" strokeWidth="12" strokeDasharray="140 251" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#00A8E1" strokeWidth="12" strokeDasharray="60 251" strokeDashoffset="-150" strokeLinecap="round" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="12" strokeDasharray="30 251" strokeDashoffset="-220" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <ChartBarIcon className="w-3 h-3 text-zinc-400" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            {[
                                { name: 'Netflix', val: '45%', color: 'bg-[#E50914]' },
                                { name: 'Prime', val: '25%', color: 'bg-[#00A8E1]' },
                                { name: 'Apple TV+', val: '15%', color: 'bg-[#fbbf24]' },
                                { name: 'Other', val: '15%', color: 'bg-zinc-800' },
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-[9px] md:text-[10px]">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                        <span className="text-zinc-600 dark:text-zinc-400 font-medium truncate">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 3. BLOG MOCKUP (Original)
// ==========================================
export function BlogMockup() {
    return (
        <div className="w-full max-w-sm mx-auto h-full flex flex-col select-none pointer-events-none justify-center">
            <div className="group relative w-full flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-lg overflow-hidden h-full max-h-[350px] md:max-h-none">
                <div className="absolute top-3 right-3 z-30">
                    <div className="p-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur text-zinc-600 dark:text-zinc-300 shadow-sm">
                        <EllipsisHorizontalIcon className="w-4 h-4" />
                    </div>
                </div>
                <div className="relative shrink-0 aspect-[2.5/1] md:aspect-[2/1] bg-zinc-100 dark:bg-zinc-900">
                    <Image
                        src="https://jyjynjpznlvezjhnuwhi.supabase.co/storage/v1/object/public/post_banners/b78b33d1-2794-4623-b32a-9d70b2753851/2f89a499-9cec-45a8-b4e4-6d812be34989.avif"
                        alt="Queen of the night?"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-amber-500/90 backdrop-blur text-[9px] font-bold text-white border border-white/10 uppercase tracking-wider shadow-sm">
                            Review
                        </span>
                    </div>
                </div>
                <div className="flex flex-col flex-1 min-h-0 px-4 py-3 md:px-5 md:py-4">
                    <span className="text-[10px] text-zinc-400 mb-1.5 shrink-0">
                        Oct 25, 2025
                    </span>
                    <h2 className="text-lg md:text-xl font-serif font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mb-2 shrink-0">
                        Queen of the night?
                    </h2>
                    <div className="flex-1 min-h-0 overflow-hidden relative">
                        <p className={`text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed ${geistSans.className}`}>
                            Well, to start off, the movie was a visual spectacle with a cyberpunk-like feel. I loved the visuals, especially the elevation shots of Chandra every time. The VFX and post-processing felt spot on. The beginning was good, but it felt a bit mid at times after the intermission...
                        </p>
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white dark:from-zinc-950 to-transparent" />
                    </div>
                    <div className="mt-3 shrink-0 flex items-center gap-4 text-[10px] md:text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2.5">
                        <div className="flex items-center gap-1">
                            <HeartIcon className="w-3.5 h-3.5" /> 124
                        </div>
                        <div className="flex items-center gap-1">
                            <ChatBubbleOvalLeftEllipsisIcon className="w-3.5 h-3.5" /> 42
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 4. LISTS MOCKUP (Original)
// ==========================================
export function ListsMockup() {
    const lists = [
        {
            title: "Cyberpunk Vibes",
            desc: "Neon lights, dystopia, and synthwave. The ultimate collection for rainy nights.",
            count: 12,
            poster: "https://image.tmdb.org/t/p/w200/9m161GawbY3cWxe6txd1NOHTjd0.jpg"
        },
        {
            title: "Ghibli Magic",
            desc: "Whimsical worlds and comforting food. A journey through Miyazaki's best.",
            count: 24,
            poster: "https://www.themoviedb.org/t/p/w1280/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg"
        },
        {
            title: "Mind Benders",
            desc: "Films that require a second watch. Psychological thrillers and plot twists.",
            count: 8,
            poster: "https://image.tmdb.org/t/p/w200/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg"
        }
    ];

    return (
        <div className="w-full max-w-sm mx-auto h-full flex flex-col justify-center gap-2 md:gap-3 select-none pointer-events-none">
            {lists.map((list, i) => (
                <div
                    key={i}
                    className={clsx(
                        "group relative flex w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm shrink-0 transition-transform",
                        i === 0 ? "opacity-100" : "opacity-90 scale-[0.99]"
                    )}
                >
                    <div className="relative w-20 md:w-24 shrink-0 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-r border-zinc-100 dark:border-zinc-800">
                        <div className="relative w-12 h-16 md:w-14 md:h-20">
                            <div className="absolute inset-0 bg-zinc-800 rotate-6 rounded-sm border border-zinc-700 opacity-20 dark:opacity-40"/>
                            <div className="absolute inset-0 bg-zinc-800 rotate-3 rounded-sm border border-zinc-700 opacity-40 dark:opacity-60"/>
                            <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 rounded-sm overflow-hidden border border-zinc-100 dark:border-zinc-700">
                                <Image src={list.poster} alt="" fill className="object-cover" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col p-2.5 md:p-3 min-w-0 justify-center">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                            {list.title}
                        </h3>
                        <p className="text-[9px] md:text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed mt-0.5 md:mt-1">
                            {list.desc}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 md:mt-2">
                            <span className="text-[8px] md:text-[9px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded-full">
                                {list.count} items
                            </span>
                            <ChevronRightIcon className="w-3 h-3 text-zinc-300" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ==========================================
// 5. SAFETY MOCKUP (Added)
// ==========================================
export function SafetyMockup() {
    return (
        <div className="w-full h-full flex items-center justify-center select-none pointer-events-none px-4">
            <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
                {/* Header (Backdrop) */}
                <div className="relative h-40 w-full bg-zinc-800">
                    <Image
                        src="https://image.tmdb.org/t/p/original/mDeUmPekbF718jRz38y0D6G3k9x.jpg"
                        alt="Backdrop"
                        fill
                        className="object-cover opacity-50 blur-xl"
                    />
                    {/* Guard Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                        <EyeSlashIcon className="w-8 h-8 text-zinc-400 mb-2" />
                        <div className="px-3 py-1 bg-zinc-100 dark:bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-wider">
                            SFW Mode Active
                        </div>
                    </div>
                </div>

                {/* Content Body */}
                <div className="relative px-6 pb-6 -mt-10 flex flex-col gap-4">
                    <div className="flex gap-4">
                        {/* Poster (Guarded) */}
                        <div className="shrink-0 relative w-20 h-28 rounded-lg overflow-hidden shadow-2xl ring-2 ring-zinc-900 bg-zinc-800">
                            <div className="absolute inset-0 bg-zinc-800/80 backdrop-blur-xl flex items-center justify-center z-10">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase">Hidden</span>
                            </div>
                            <Image
                                src="https://image.tmdb.org/t/p/w500/9bXQh0U5p9Y4A8z9.jpg"
                                alt="Poster"
                                fill
                                className="object-cover opacity-20"
                            />
                        </div>

                        {/* Rich Data */}
                        <div className="flex-1 pt-10">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-lg font-bold text-white leading-tight">Nymphomaniac: Vol I</h2>
                                <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[8px] font-bold uppercase">Explicit</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[10px] text-zinc-400">
                                <span>2013</span>
                                <span>•</span>
                                <span>Lars von Trier</span>
                                <span>•</span>
                                <span>Drama</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <div className="h-1.5 w-12 bg-zinc-700 rounded-full"/>
                                <div className="h-1.5 w-8 bg-zinc-700 rounded-full"/>
                            </div>
                        </div>
                    </div>

                    {/* Meta Data Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase text-zinc-500 font-bold">Budget</span>
                            <span className="text-xs text-zinc-300 font-mono">$4M</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase text-zinc-500 font-bold">Revenue</span>
                            <span className="text-xs text-green-400 font-mono">$13.5M</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase text-zinc-500 font-bold">Status</span>
                            <span className="text-xs text-zinc-300">Released</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 6. PODIUM MOCKUP (Added)
// ==========================================
export function PodiumMockup() {
    const ranks = [
        { rank: '01', title: "Dune: Part Two", img: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
        { rank: '02', title: "Poor Things", img: "https://www.themoviedb.org/t/p/w600_and_h900_face/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg" },
        { rank: '03', title: "Oppenheimer", img: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center select-none pointer-events-none px-4">
            <div className="flex items-end justify-center gap-3 md:gap-6 w-full max-w-lg">
                {ranks.map((item, i) => (
                    <div key={i} className={`flex flex-col items-center ${i === 0 ? 'order-2 -mt-8' : i === 1 ? 'order-1' : 'order-3'}`}>
                        <span className={`font-black text-zinc-200 dark:text-zinc-800 leading-none -mb-3 z-0 ${i === 0 ? 'text-6xl md:text-8xl' : 'text-4xl md:text-6xl'}`}>
                            {item.rank}
                        </span>
                        <div className={`relative z-10 rounded-lg overflow-hidden shadow-xl border-2 border-white dark:border-zinc-800 ${i === 0 ? 'w-28 md:w-36 aspect-[2/3]' : 'w-20 md:w-24 aspect-[2/3]'}`}>
                            <Image src={item.img} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="mt-3 text-center">
                            <span className="block text-[10px] md:text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[80px] truncate">
                                {item.title}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">My Top 3 Sci-Fi</span>
            </div>
        </div>
    );
}

// ==========================================
// 7. DISCOVERY MOCKUP (Added)
// ==========================================
export function DiscoveryMockup() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 select-none pointer-events-none">
            <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full shadow-lg scale-110">
                    <GlobeAltIcon className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase">Trending in India</span>
                </div>
                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-full opacity-60 scale-90">
                    <span className="text-[10px] font-bold uppercase">Japan</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm px-4">
                {[
                    { t: "Kalki 2898 AD", img: "https://www.themoviedb.org/t/p/w600_and_h900_face/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg" },
                    { t: "RRR", img: "https://image.tmdb.org/t/p/w500/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg" },
                    { t: "Jawan", img: "https://www.themoviedb.org/t/p/w600_and_h900_face/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg" },
                ].map((m, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
                            <Image src={m.img} alt={m.t} fill className="object-cover" />
                            {i === 0 && (
                                <div className="absolute top-1 right-1 p-1 bg-rose-500 rounded-sm shadow-sm">
                                    <FireIcon className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full self-center" />
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                <span>Localized & Curated</span>
            </div>
        </div>
    );
}