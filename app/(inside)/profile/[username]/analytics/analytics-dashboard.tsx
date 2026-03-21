'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    FilmIcon,
    TvIcon,
    StarIcon,
    FireIcon,
    ClockIcon,
    TicketIcon,
    GlobeAltIcon,
    LockClosedIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    CreditCardIcon,
    TrophyIcon,
    CalendarDaysIcon,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

/* ─── Types ────────────────────────────────────────────────────── */

interface ReviewRow {
    id: string;
    watched_on: string | null;
    rating: number | null;
    viewing_method: string | null;
    viewing_service: string | null;
    is_rewatch: boolean | null;
    movie_id: number | null;
    tv_show_id: number | null;
    created_at: string;
    movie: { title: string; poster_path: string | null; runtime: number | null; original_language: string | null } | null;
    tv: { name: string; poster_path: string | null } | null;
}

interface Props {
    reviews: ReviewRow[];
    username: string;
    isOwnProfile: boolean;
}

/* ─── Constants ─────────────────────────────────────────────────── */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Stable "today" computed once at module load — analytics doesn't need real-time updates
const TODAY = new Date();

// Approximate monthly costs (USD) — shown as estimates only
const SERVICE_META: Record<string, { name: string; cost: number; color: string }> = {
    netflix:   { name: 'Netflix',         cost: 6.99,  color: '#E50914' },
    prime:     { name: 'Prime Video',     cost: 2.99,  color: '#00A8E1' },
    disney:    { name: 'Disney+ Hotstar', cost: 3.99,  color: '#113CCF' },
    appletv:   { name: 'Apple TV+',       cost: 9.99,  color: '#1a1a1a' },
    youtube:   { name: 'YouTube Premium', cost: 13.99, color: '#FF0000' },
    max:       { name: 'Max',             cost: 9.99,  color: '#6A4ECC' },
    zee5:      { name: 'Zee5',            cost: 2.99,  color: '#8B2FC9' },
    sonyliv:   { name: 'SonyLIV',         cost: 2.99,  color: '#F47920' },
    jiocinema: { name: 'JioCinema',       cost: 1.99,  color: '#4B1ADB' },
    mubi:      { name: 'MUBI',            cost: 12.99, color: '#1B1C1E' },
};

/* ─── Helpers ───────────────────────────────────────────────────── */

function toDateStr(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatHours(minutes: number) {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function intensityClass(count: number) {
    if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800/60';
    if (count === 1) return 'bg-zinc-300 dark:bg-zinc-600';
    if (count === 2) return 'bg-zinc-500 dark:bg-zinc-500';
    if (count === 3) return 'bg-zinc-700 dark:bg-zinc-400';
    return 'bg-zinc-900 dark:bg-zinc-200';
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatCard({ value, label, icon: Icon, sub }: {
    value: string | number; label: string; icon: React.ElementType; sub?: string;
}) {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{label}</p>
                <Icon className="w-4 h-4 text-zinc-400" />
            </div>
            <p className="text-3xl font-light text-zinc-900 dark:text-zinc-100 tabular-nums">{value}</p>
            {sub && <p className="text-xs text-zinc-400">{sub}</p>}
        </div>
    );
}

function ComingSoonCard({ icon: Icon, title, description }: {
    icon: React.ElementType; title: string; description: string;
}) {
    return (
        <div className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-5 overflow-hidden">
            <div className="absolute inset-0 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-[1px]" />
            <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{title}</p>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            <LockClosedIcon className="w-2 h-2" /> Soon
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
                </div>
            </div>
        </div>
    );
}

/* ─── Activity Graph sub-views (module-level to avoid "create during render") ── */

function MonthCalendar({ selectedYear, selectedMonth, dayCounts }: {
    selectedYear: number;
    selectedMonth: number;
    dayCounts: Map<string, number>;
}) {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="space-y-1">
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LETTERS.map((d, i) => (
                    <div key={i} className="text-center text-[10px] text-zinc-400 font-bold">{d}</div>
                ))}
            </div>
            {Array.from({ length: cells.length / 7 }, (_, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-1">
                    {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
                        if (!day) return <div key={di} />;
                        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isFuture = new Date(dateStr + 'T12:00:00') > TODAY;
                        const count = dayCounts.get(dateStr) ?? 0;
                        return (
                            <div
                                key={di}
                                title={isFuture ? '' : `${dateStr}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                                className={cn(
                                    'aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-colors cursor-default',
                                    isFuture
                                        ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700'
                                        : count > 0
                                            ? cn(intensityClass(count), 'text-white dark:text-zinc-900')
                                            : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 dark:text-zinc-600'
                                )}
                            >
                                {day}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function YearHeatmap({ selectedYear, dayCounts }: {
    selectedYear: number;
    dayCounts: Map<string, number>;
}) {
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    const clampedEnd = yearEnd > TODAY ? TODAY : yearEnd;

    const gridStart = new Date(yearStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const weeks: Date[][] = [];
    const cursor = new Date(gridStart);
    while (cursor <= clampedEnd) {
        const week: Date[] = [];
        for (let d = 0; d < 7; d++) {
            week.push(new Date(cursor));
            cursor.setDate(cursor.getDate() + 1);
        }
        weeks.push(week);
    }

    const monthLabels: { label: string; col: number }[] = [];
    weeks.forEach((week, col) => {
        week.forEach(day => {
            if (day.getDate() === 1 && day.getFullYear() === selectedYear) {
                monthLabels.push({ label: MONTH_NAMES[day.getMonth()], col });
            }
        });
    });

    return (
        <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <div className="inline-block min-w-full">
                <div className="flex mb-1" style={{ gap: '3px' }}>
                    {weeks.map((_, col) => {
                        const lbl = monthLabels.find(m => m.col === col);
                        return (
                            <div key={col} className="w-2.75 shrink-0 text-[9px] text-zinc-400 font-medium leading-none">
                                {lbl?.label ?? ''}
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-col" style={{ gap: '3px' }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(dow => (
                        <div key={dow} className="flex" style={{ gap: '3px' }}>
                            {weeks.map((week, col) => {
                                const day = week[dow];
                                const isFuture = day > TODAY;
                                const isWrongYear = day.getFullYear() !== selectedYear;
                                const dateStr = toDateStr(day);
                                const count = dayCounts.get(dateStr) ?? 0;
                                return (
                                    <div
                                        key={col}
                                        title={isFuture || isWrongYear ? '' : `${dateStr}: ${count} ${count === 1 ? 'entry' : 'entries'}`}
                                        className={cn(
                                            'w-2.75 h-2.75 rounded-[2px]',
                                            isFuture || isWrongYear ? 'opacity-0 pointer-events-none' : intensityClass(count)
                                        )}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-1.5 mt-2 justify-end">
                    <span className="text-[9px] text-zinc-400">Less</span>
                    {[0, 1, 2, 3, 4].map(n => (
                        <div key={n} className={cn('w-2.75 h-2.75 rounded-[2px]', intensityClass(n))} />
                    ))}
                    <span className="text-[9px] text-zinc-400">More</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Activity Graph ─────────────────────────────────────────────── */

function ActivityGraph({ dayCounts }: { dayCounts: Map<string, number> }) {
    const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
    const [selectedYear, setSelectedYear] = useState(TODAY.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(TODAY.getMonth());

    const availableYears = useMemo(() => {
        const years = new Set<number>();
        dayCounts.forEach((_, d) => years.add(parseInt(d.slice(0, 4))));
        years.add(TODAY.getFullYear());
        return [...years].sort((a, b) => b - a).slice(0, 5);
    }, [dayCounts]);

    // Navigate months
    const prevMonth = () => {
        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
        else setSelectedMonth(m => m - 1);
    };
    const nextMonth = () => {
        const isCurrentMonth = selectedYear === TODAY.getFullYear() && selectedMonth === TODAY.getMonth();
        if (isCurrentMonth) return;
        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
        else setSelectedMonth(m => m + 1);
    };
    const isAtCurrentMonth = selectedYear === TODAY.getFullYear() && selectedMonth === TODAY.getMonth();

    // Monthly total for header
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    const monthTotal = useMemo(() => {
        let t = 0;
        dayCounts.forEach((count, d) => { if (d.startsWith(monthPrefix)) t += count; });
        return t;
    }, [dayCounts, monthPrefix]);

    // Year total
    const yearTotal = useMemo(() => {
        let t = 0;
        dayCounts.forEach((count, d) => { if (d.startsWith(String(selectedYear))) t += count; });
        return t;
    }, [dayCounts, selectedYear]);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Activity</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        {viewMode === 'month'
                            ? `${monthTotal} ${monthTotal === 1 ? 'entry' : 'entries'} in ${MONTH_NAMES_FULL[selectedMonth]}`
                            : `${yearTotal} ${yearTotal === 1 ? 'entry' : 'entries'} in ${selectedYear}`}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Mode toggle */}
                    <div className="flex rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs">
                        {(['month', 'year'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    'px-3 py-1.5 font-semibold transition-colors capitalize',
                                    viewMode === mode
                                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    {/* Month navigator */}
                    {viewMode === 'month' && (
                        <div className="flex items-center gap-1">
                            <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <ChevronLeftIcon className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 w-24 text-center">
                                {MONTH_NAMES_FULL[selectedMonth].slice(0, 3)} {selectedYear}
                            </span>
                            <button onClick={nextMonth} disabled={isAtCurrentMonth} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30">
                                <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-500" />
                            </button>
                        </div>
                    )}

                    {/* Year selector */}
                    {viewMode === 'year' && availableYears.length > 1 && (
                        <div className="flex rounded-full border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs">
                            {availableYears.map(y => (
                                <button
                                    key={y}
                                    onClick={() => setSelectedYear(y)}
                                    className={cn(
                                        'px-3 py-1.5 font-semibold transition-colors',
                                        selectedYear === y
                                            ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                    )}
                                >
                                    {y}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'month'
                ? <MonthCalendar selectedYear={selectedYear} selectedMonth={selectedMonth} dayCounts={dayCounts} />
                : <YearHeatmap selectedYear={selectedYear} dayCounts={dayCounts} />}
        </div>
    );
}

/* ─── Year in Review ─────────────────────────────────────────────── */

function YearInReview({ reviews, year }: { reviews: ReviewRow[]; year: number }) {
    const yearReviews = reviews.filter(r => r.watched_on?.startsWith(String(year)));
    if (yearReviews.length === 0) return null;

    const totalMins = yearReviews.reduce((a, r) => a + (r.movie?.runtime ?? 0), 0);
    const rated = yearReviews.filter(r => r.rating && r.rating > 0);
    const avgRating = rated.length > 0 ? (rated.reduce((a, r) => a + r.rating!, 0) / rated.length).toFixed(1) : '—';

    const topFilm = [...yearReviews]
        .filter(r => r.rating && r.rating > 0 && (r.movie || r.tv))
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];

    const monthCounts = Array.from({ length: 12 }, (_, i) => {
        const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
        return yearReviews.filter(r => r.watched_on?.startsWith(prefix)).length;
    });
    const bestMonthIdx = monthCounts.indexOf(Math.max(...monthCounts));

    const moviesCount = yearReviews.filter(r => r.movie_id).length;
    const rewatches = yearReviews.filter(r => r.is_rewatch).length;

    return (
        <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-5 space-y-4 text-white dark:text-zinc-900">
            <div className="flex items-center gap-2">
                <TrophyIcon className="w-4 h-4 text-amber-400 dark:text-amber-500" />
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 dark:text-zinc-600">{year} in Review</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                    <p className="text-2xl font-light tabular-nums">{yearReviews.length}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Films logged</p>
                </div>
                <div>
                    <p className="text-2xl font-light">{formatHours(totalMins)}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Watch time</p>
                </div>
                <div>
                    <p className="text-2xl font-light">{avgRating}<span className="text-base text-zinc-500"> ★</span></p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Avg rating</p>
                </div>
                <div>
                    <p className="text-2xl font-light">{MONTH_NAMES[bestMonthIdx]}</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">Most active</p>
                </div>
            </div>

            {topFilm && (
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-800 dark:border-zinc-200">
                    <StarIcon className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500 shrink-0" />
                    <div className="flex items-center gap-3 min-w-0">
                        {(topFilm.movie?.poster_path ?? topFilm.tv?.poster_path) && (
                            <div className="relative w-7 h-10 shrink-0 rounded overflow-hidden">
                                <Image
                                    src={`https://image.tmdb.org/t/p/w92${topFilm.movie?.poster_path ?? topFilm.tv?.poster_path}`}
                                    alt="" fill className="object-cover" unoptimized
                                />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Top pick</p>
                            <p className="text-sm font-semibold truncate">
                                {topFilm.movie?.title ?? topFilm.tv?.name}
                            </p>
                        </div>
                    </div>
                    <div className="ml-auto shrink-0 flex flex-col items-end gap-0.5">
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">{moviesCount} films · {rewatches} rewatches</span>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Subscription Insights ──────────────────────────────────────── */

function SubscriptionInsights({ reviews }: { reviews: ReviewRow[] }) {
    const insights = useMemo(() => {
        const ottReviews = reviews.filter(r => r.viewing_method === 'ott' && r.viewing_service);
        if (ottReviews.length === 0) return null;

        const now = new Date();
        const ago30  = new Date(now); ago30.setDate(ago30.getDate() - 30);
        const ago90  = new Date(now); ago90.setDate(ago90.getDate() - 90);
        const str30  = toDateStr(ago30);
        const str90  = toDateStr(ago90);

        const serviceMap = new Map<string, { total: number; last30: number; last90: number; lastSeen: string }>();

        ottReviews.forEach(r => {
            const svc = r.viewing_service!;
            const date = r.watched_on?.slice(0, 10) ?? '';
            const cur = serviceMap.get(svc) ?? { total: 0, last30: 0, last90: 0, lastSeen: '' };
            cur.total++;
            if (date >= str30) cur.last30++;
            if (date >= str90) cur.last90++;
            if (!cur.lastSeen || date > cur.lastSeen) cur.lastSeen = date;
            serviceMap.set(svc, cur);
        });

        const nowMs = TODAY.getTime();
        return Array.from(serviceMap.entries())
            .map(([id, data]) => ({
                id,
                meta: SERVICE_META[id] ?? { name: id, cost: 0, color: '#888' },
                ...data,
                avgPerMonth: parseFloat((data.last90 / 3).toFixed(1)),
                daysSinceLast: data.lastSeen
                    ? Math.floor((nowMs - new Date(data.lastSeen + 'T12:00:00').getTime()) / 86400000)
                    : null,
            }))
            .sort((a, b) => b.last90 - a.last90);
    }, [reviews]);

    if (!insights || insights.length === 0) return null;

    const underused = insights.filter(s => s.avgPerMonth < 2);
    const healthy   = insights.filter(s => s.avgPerMonth >= 2);
    const estimatedWaste = underused.reduce((a, s) => a + s.meta.cost, 0);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-5">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                    <CreditCardIcon className="w-3.5 h-3.5" /> Subscription Insights
                </p>
                {estimatedWaste > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                        ~${estimatedWaste.toFixed(2)}/mo potentially unused
                    </span>
                )}
            </div>

            {/* Healthy services */}
            {healthy.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Active</p>
                    {healthy.map(s => (
                        <div key={s.id} className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.meta.color }} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{s.meta.name}</span>
                                    <span className="text-zinc-400 tabular-nums">{s.avgPerMonth}/mo avg</span>
                                </div>
                                <div className="mt-1 h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (s.avgPerMonth / 10) * 100)}%`, backgroundColor: s.meta.color, opacity: 0.7 }} />
                                </div>
                            </div>
                            <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                        </div>
                    ))}
                </div>
            )}

            {/* Underused services */}
            {underused.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">Consider Pausing</p>
                    {underused.map(s => (
                        <div key={s.id} className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-3 flex gap-3 items-start">
                            <ExclamationTriangleIcon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{s.meta.name}</p>
                                    {s.meta.cost > 0 && (
                                        <span className="text-xs font-bold text-zinc-500">${s.meta.cost}/mo est.</span>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {s.last90 === 0
                                        ? `No films logged in the last 90 days`
                                        : `Only ${s.last90} ${s.last90 === 1 ? 'film' : 'films'} in 90 days (${s.avgPerMonth}/mo avg)`}
                                    {s.daysSinceLast !== null && s.lastSeen && ` · last watched ${s.daysSinceLast}d ago`}
                                </p>
                            </div>
                        </div>
                    ))}
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                        * Estimated prices may vary by region and plan. Based on your logged watch history — actual usage may differ.
                    </p>
                </div>
            )}
        </div>
    );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */

export function AnalyticsDashboard({ reviews, isOwnProfile }: Props) {
    const currentYear = TODAY.getFullYear();

    const stats = useMemo(() => {
        if (reviews.length === 0) return null;

        const dayCounts = new Map<string, number>();
        reviews.forEach(r => {
            if (r.watched_on) {
                const d = r.watched_on.slice(0, 10);
                dayCounts.set(d, (dayCounts.get(d) ?? 0) + 1);
            }
        });

        const totalMinutes = reviews.reduce((acc, r) => acc + (r.movie?.runtime ?? 0), 0);

        const rated = reviews.filter(r => r.rating !== null && r.rating! > 0);
        const avgRating = rated.length > 0
            ? (rated.reduce((a, r) => a + r.rating!, 0) / rated.length).toFixed(1)
            : '—';

        const uniqueDates = [...new Set(reviews.map(r => r.watched_on?.slice(0, 10)).filter(Boolean) as string[])].sort().reverse();
        let streak = 0;
        let cursor = new Date(); cursor.setHours(0, 0, 0, 0);
        for (const d of uniqueDates) {
            const rd = new Date(d + 'T12:00:00'); rd.setHours(0, 0, 0, 0);
            const diff = Math.round((cursor.getTime() - rd.getTime()) / 86400000);
            if (diff <= 1) { streak++; cursor = rd; } else break;
        }

        const moviesCount = reviews.filter(r => r.movie_id !== null).length;
        const tvCount = reviews.filter(r => r.tv_show_id !== null).length;

        const methodMap: Record<string, number> = {};
        reviews.forEach(r => {
            const m = r.viewing_method ?? 'unknown';
            methodMap[m] = (methodMap[m] ?? 0) + 1;
        });
        const totalMethods = Object.values(methodMap).reduce((a, b) => a + b, 0);
        const methods = Object.entries(methodMap)
            .sort((a, b) => b[1] - a[1])
            .map(([key, count]) => ({
                key, count, pct: Math.round((count / totalMethods) * 100),
                label: { theatre: 'Theatre', ott: 'OTT / Streaming', bluray: 'Blu-ray / DVD', broadcast: 'Broadcast' }[key] ?? key,
            }));

        const seen = new Set<string>();
        const topFilms = reviews
            .filter(r => r.rating && r.rating > 0 && (r.movie || r.tv))
            .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
            .filter(r => {
                const key = r.movie_id ? `m${r.movie_id}` : `t${r.tv_show_id}`;
                if (seen.has(key)) return false;
                seen.add(key); return true;
            })
            .slice(0, 5);

        const monthly = MONTH_NAMES.map((name, i) => {
            const prefix = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
            return { name, count: reviews.filter(r => r.watched_on?.startsWith(prefix)).length };
        });
        const maxMonth = Math.max(...monthly.map(m => m.count), 1);

        const langMap: Record<string, number> = {};
        reviews.forEach(r => {
            const lang = r.movie?.original_language;
            if (lang) langMap[lang] = (langMap[lang] ?? 0) + 1;
        });
        const topLangs = Object.entries(langMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

        return { dayCounts, totalMinutes, avgRating, streak, moviesCount, tvCount, methods, topFilms, monthly, maxMonth, topLangs };
    }, [reviews, currentYear]);

    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-24">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between pb-2">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Analytics {reviews.length > 0 && <span className="text-zinc-400 font-normal text-base">({reviews.length})</span>}
                </h2>
                {isOwnProfile && (
                    <Link href="/profile/reviews/create" className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium">
                        + Log Entry
                    </Link>
                )}
            </div>

            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <CalendarDaysIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-4" />
                    <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">No data yet</h3>
                    <p className="text-sm text-zinc-400 mt-1 text-center max-w-xs">Start logging films and your analytics will appear here.</p>
                </div>
            ) : stats ? (
                <>
                    {/* ── YEAR IN REVIEW ── */}
                    <YearInReview reviews={reviews} year={currentYear} />

                    {/* ── ACTIVITY GRAPH ── */}
                    <ActivityGraph dayCounts={stats.dayCounts} />

                    {/* ── STAT CARDS ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={FilmIcon} label="Logged" value={reviews.length} sub={`${stats.moviesCount} films · ${stats.tvCount} shows`} />
                        <StatCard icon={ClockIcon} label="Watch Time" value={formatHours(stats.totalMinutes)} sub="films only" />
                        <StatCard icon={StarIcon} label="Avg Rating" value={stats.avgRating} sub={`from ${reviews.filter(r => r.rating && r.rating > 0).length} ratings`} />
                        <StatCard icon={FireIcon} label="Streak" value={`${stats.streak}d`} sub="consecutive days" />
                    </div>

                    {/* ── TOP FILMS + MONTHLY BAR ── */}
                    <div className="grid md:grid-cols-5 gap-6">
                        <div className="md:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Top Rated</p>
                            <div className="space-y-3">
                                {stats.topFilms.map((r, i) => {
                                    const title = r.movie?.title ?? r.tv?.name ?? '—';
                                    const poster = r.movie?.poster_path ?? r.tv?.poster_path;
                                    const href = r.movie_id ? `/discover/movie/${r.movie_id}` : `/discover/tv/${r.tv_show_id}`;
                                    return (
                                        <Link key={r.id} href={href} className="flex items-center gap-3 group">
                                            <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600 w-4 shrink-0 tabular-nums">{i + 1}</span>
                                            <div className="relative w-8 h-12 shrink-0 rounded overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                                                {poster
                                                    ? <Image src={`https://image.tmdb.org/t/p/w92${poster}`} alt={title} fill className="object-cover" unoptimized />
                                                    : <div className="w-full h-full flex items-center justify-center"><FilmIcon className="w-4 h-4 text-zinc-400" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate grou
                                                p-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                                                    {title}
                                                </p>
                                                <p className="text-xs text-zinc-400">{r.movie ? 'Movie' : 'TV'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <StarIcon className="w-3 h-3 text-amber-400" />
                                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{r.rating}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{currentYear} by Month</p>
                            <div className="flex items-end gap-1 h-28">
                                {stats.monthly.map(({ name, count }) => (
                                    <div key={name} className="flex-1 flex flex-col items-center gap-1">
                                        <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                                            <div
                                                className="w-full bg-zinc-900 dark:bg-zinc-100 rounded-sm transition-all duration-500"
                                                style={{ height: count === 0 ? '2px' : `${Math.max(4, (count / stats.maxMonth) * 80)}px`, opacity: count === 0 ? 0.15 : 1 }}
                                            />
                                        </div>
                                        <span className="text-[8px] text-zinc-400 font-medium">{name.slice(0, 1)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── SUBSCRIPTION INSIGHTS ── */}
                    <SubscriptionInsights reviews={reviews} />

                    {/* ── HOW + LANGUAGES ── */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {stats.methods.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                                    <TicketIcon className="w-3 h-3" /> How You Watch
                                </p>
                                <div className="space-y-3">
                                    {stats.methods.map(({ key, label, count, pct }) => (
                                        <div key={key} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{label}</span>
                                                <span className="text-zinc-400 tabular-nums">{count} · {pct}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {stats.topLangs.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-1.5">
                                    <GlobeAltIcon className="w-3 h-3" /> Original Language
                                </p>
                                <div className="space-y-3">
                                    {stats.topLangs.map(([lang, count]) => {
                                        const total = reviews.filter(r => r.movie_id).length || 1;
                                        const pct = Math.round((count / total) * 100);
                                        return (
                                            <div key={lang} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-zinc-700 dark:text-zinc-300 font-medium uppercase tracking-wide">{lang}</span>
                                                    <span className="text-zinc-400 tabular-nums">{count} · {pct}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── FILMS VS TV ── */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Films vs TV</p>
                        <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-700" style={{ width: `${Math.round((stats.moviesCount / (reviews.length || 1)) * 100)}%` }} />
                            <div className="h-full flex-1 bg-zinc-300 dark:bg-zinc-600" />
                        </div>
                        <div className="flex gap-6 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900 dark:bg-zinc-100" />
                                <span className="text-zinc-600 dark:text-zinc-400"><span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.moviesCount}</span> Films ({Math.round((stats.moviesCount / (reviews.length || 1)) * 100)}%)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
                                <span className="text-zinc-600 dark:text-zinc-400"><span className="font-bold text-zinc-900 dark:text-zinc-100">{stats.tvCount}</span> TV ({Math.round((stats.tvCount / (reviews.length || 1)) * 100)}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* ── COMING SOON ── */}
                    <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold px-1">Coming Soon</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <ComingSoonCard icon={SparklesIcon} title="Genre Breakdown" description="See your taste across Drama, Thriller, Comedy, Horror, and more." />
                            <ComingSoonCard icon={FilmIcon} title="Director & Cast Stats" description="Your most-watched directors, actors, and cinematographers." />
                            <ComingSoonCard icon={TvIcon} title="Binge Patterns" description="Time-of-day and binge-session analysis across your history." />
                            <ComingSoonCard icon={StarIcon} title="Taste Score" description="How your ratings compare to critics and the DeeperWeave community." />
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}