// app/ui/profile/StatsSkeleton.tsx
export function StatsSkeleton() {
    return (
        <div className="flex items-center w-full justify-between md:justify-start gap-0 md:gap-10 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center md:items-start gap-1">
                    {/* The Number (e.g., '1.2k') */}
                    <div className="h-5 w-8 md:w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />

                    {/* The Label (e.g., 'Followers') */}
                    <div className="h-3 w-12 md:w-16 bg-zinc-100 dark:bg-zinc-900/50 rounded-md" />
                </div>
            ))}
        </div>
    );
}


// app/ui/skeletons.tsx
const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

// Helper for basic bone blocks
function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div
            className={`bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse ${className}`}
        />
    );
}

// --- 1. TIMELINE ENTRY SKELETON ---
// Matches app/ui/timeline/TimelineEntryCard.tsx
export function TimelineEntrySkeleton() {
    return (
        <div className="flex flex-row w-full mb-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm">
            {/* Poster (Left) */}
            <div className="relative w-24 md:w-32 shrink-0 bg-zinc-200 dark:bg-zinc-900 animate-pulse aspect-[2/3]" />

            {/* Content (Right) */}
            <div className="flex-1 flex flex-col p-4 min-w-0 relative gap-3">
                {/* Header: Date */}
                <div className="flex justify-between items-center">
                    <SkeletonBlock className="h-3 w-20 rounded-full" />
                    <SkeletonBlock className="h-5 w-5 rounded-md" /> {/* Action Menu Placeholder */}
                </div>

                {/* Title */}
                <div className="space-y-1">
                    <SkeletonBlock className="h-6 w-3/4 md:w-1/2 rounded-md" />
                    <SkeletonBlock className="h-3 w-12 rounded-full" />
                </div>

                {/* Metadata Row (Rating, etc) */}
                <div className="flex items-center gap-2 mt-1">
                    <SkeletonBlock className="h-4 w-10 rounded-full" />
                    <SkeletonBlock className="h-4 w-16 rounded-full" />
                    <SkeletonBlock className="h-5 w-16 -space-x-2 rounded-full" /> {/* Avatars */}
                </div>

                {/* Notes (Text block) */}
                <div className="mt-2 space-y-2">
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-5/6" />
                </div>

                {/* Footer Link */}
                <div className="mt-auto pt-1">
                    <SkeletonBlock className="h-3 w-24 rounded-full" />
                </div>
            </div>
        </div>
    );
}

export function TimelineSkeletonList() {
    return (
        <div className="w-full max-w-4xl mx-auto pb-20">
            <TimelineEntrySkeleton />
            <TimelineEntrySkeleton />
            <TimelineEntrySkeleton />
            <TimelineEntrySkeleton />
        </div>
    );
}

// --- 2. PROFILE LIST CARD SKELETON ---
// Matches app/ui/profileLists/ProfileListCard.tsx
export function ProfileListCardSkeleton() {
    return (
        <div className="flex w-full h-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {/* Left: Poster Stack */}
            <div className="relative w-24 sm:w-32 shrink-0 bg-zinc-100 dark:bg-zinc-950/50 border-r border-zinc-100 dark:border-zinc-800 animate-pulse" />

            {/* Right: Info */}
            <div className="flex flex-1 flex-col p-3 sm:p-4 min-w-0 justify-between">
                <div className="space-y-2">
                    <SkeletonBlock className="h-5 w-3/4 rounded-md" /> {/* Title */}
                    <SkeletonBlock className="h-3 w-full rounded-sm" /> {/* Desc line 1 */}
                    <SkeletonBlock className="h-3 w-2/3 rounded-sm" />  {/* Desc line 2 */}
                </div>

                <div className="flex items-center justify-between pt-2">
                    <SkeletonBlock className="h-4 w-16 rounded-full" /> {/* Item count */}
                    <SkeletonBlock className="h-3 w-10 rounded-full" /> {/* View text */}
                </div>
            </div>
        </div>
    );
}

export function ProfileListsSkeletonGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProfileListCardSkeleton />
            <ProfileListCardSkeleton />
            <ProfileListCardSkeleton />
            <ProfileListCardSkeleton />
        </div>
    );
}

// --- 3. BLOG CARD SKELETON ---
// Matches app/ui/blog/BlogCard.tsx
export function BlogCardSkeleton() {
    return (
        <div className="h-full rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
            {/* Media Aspect 16/9 */}
            <div className="relative aspect-[16/9] bg-zinc-200 dark:bg-zinc-900 animate-pulse" />

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-4">
                {/* Header: Date & Author */}
                <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-3 w-20 rounded-full" />
                    <div className="flex items-center gap-2">
                        <SkeletonBlock className="h-5 w-5 rounded-full" />
                        <SkeletonBlock className="h-3 w-20 rounded-full" />
                    </div>
                </div>

                {/* Title */}
                <SkeletonBlock className="h-6 w-full rounded-md" />

                {/* Excerpt */}
                <div className="space-y-2">
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-2/3" />
                </div>

                {/* Footer Metrics */}
                <div className="mt-auto pt-3 flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-900">
                    <SkeletonBlock className="h-3 w-8" />
                    <SkeletonBlock className="h-3 w-8" />
                    <SkeletonBlock className="ml-auto h-3 w-12" />
                </div>
            </div>
        </div>
    );
}

// --- 4. POSTER CARD SKELETON (Discover/Grid) ---
// Matches app/ui/discover/PosterCard.tsx
export function PosterCardSkeleton() {
    return (
        <div className="w-[160px] md:w-[200px] flex-shrink-0">
            {/* Aspect 2/3 Poster */}
            <div className="relative aspect-[2/3] w-full rounded-sm bg-zinc-200 dark:bg-zinc-900 animate-pulse mb-4" />
            {/* Text Lines */}
            <div className="space-y-2 px-1">
                <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                <SkeletonBlock className="h-3 w-1/3 rounded-sm" />
            </div>
        </div>
    );
}

export function PosterGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-900 rounded-sm animate-pulse" />
            ))}
        </div>
    );
}

// --- 5. SEARCH RESULT SKELETON ---
// Matches app/ui/search/CinematicResultCard.tsx
export function CinematicResultSkeleton() {
    return (
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="aspect-[2/3] bg-zinc-200 dark:bg-zinc-900 animate-pulse" />
            <div className="p-3 space-y-2">
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-3 w-1/2" />
            </div>
        </div>
    );
}

// --- 6. USER CARD SKELETON ---
// Matches app/ui/user/UserCard.tsx
export function UserCardSkeleton() {
    return (
        <div className="flex items-center justify-between w-full px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-3.5 flex-1">
                {/* Avatar */}
                <SkeletonBlock className="h-11 w-11 rounded-full shrink-0" />
                {/* Text */}
                <div className="flex flex-col gap-2 w-full max-w-[140px]">
                    <SkeletonBlock className="h-4 w-3/4 rounded-sm" />
                    <SkeletonBlock className="h-3 w-1/2 rounded-sm" />
                </div>
            </div>
            {/* Button Placeholder */}
            <SkeletonBlock className="h-8 w-24 rounded-md ml-4" />
        </div>
    );
}

// --- 7. PROFILE HEADER SKELETON ---
// Matches app/ui/user/ProfileHeader.tsx
export function ProfileHeaderSkeleton() {
    return (
        <div className="w-full bg-white dark:bg-black">
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 md:py-10">
                <div className="flex flex-col md:flex-row md:gap-10">

                    {/* Avatar & Mobile Stats */}
                    <div className="grid grid-cols-[auto_1fr] md:flex md:items-start gap-6 items-center">
                        <SkeletonBlock className="w-20 h-20 md:w-40 md:h-40 rounded-full shrink-0" />
                        <div className="flex md:hidden justify-around w-full gap-2">
                            <SkeletonBlock className="h-10 w-16" />
                            <SkeletonBlock className="h-10 w-16" />
                            <SkeletonBlock className="h-10 w-16" />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 mt-4 md:mt-0 flex flex-col gap-4">
                        {/* Name Row */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <SkeletonBlock className="h-8 w-48 rounded-md" />
                            <SkeletonBlock className="hidden md:block h-9 w-28 rounded-lg" />
                        </div>

                        {/* Handle */}
                        <SkeletonBlock className="h-4 w-32 rounded-full" />

                        {/* Desktop Stats */}
                        <div className="hidden md:flex gap-8 py-2">
                            <SkeletonBlock className="h-10 w-16" />
                            <SkeletonBlock className="h-10 w-16" />
                            <SkeletonBlock className="h-10 w-16" />
                        </div>

                        {/* Bio */}
                        <div className="space-y-2 max-w-lg">
                            <SkeletonBlock className="h-3 w-full" />
                            <SkeletonBlock className="h-3 w-5/6" />
                            <SkeletonBlock className="h-3 w-4/6" />
                        </div>

                        {/* Meta Row */}
                        <div className="flex gap-4 pt-1">
                            <SkeletonBlock className="h-3 w-24" />
                            <SkeletonBlock className="h-3 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// app/ui/skeletons.tsx (Add these to the bottom)

// --- 8. TAB NAVIGATION SKELETON ---
// Matches app/(inside)/profile/[username]/TabNavigation.tsx
export function TabNavigationSkeleton() {
    return (
        <div className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-14">
            <div className="max-w-4xl mx-auto px-2 md:px-4 h-full flex items-center gap-1 md:gap-2 overflow-hidden">
                {/* Simulate 5 tabs (Podium, Timeline, Lists, Posts, More) */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="flex-1 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse min-w-[60px]"
                    />
                ))}
            </div>
        </div>
    );
}

// --- 9. PODIUM SKELETON ---
// Matches app/ui/home/ProfileSectionDisplay.tsx
export function PodiumSkeleton() {
    return (
        <div className="w-full max-w-5xl mx-auto md:px-8 py-8 animate-pulse">
            {/* Header Section (Title Left, Number Right) */}
            <div className="flex items-baseline justify-between gap-8 mb-10 md:mb-12 px-4 md:px-0">
                <div className="flex items-center gap-6 w-full">
                    {/* Title Block */}
                    <div className="h-10 md:h-14 w-48 md:w-80 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
                    {/* Line */}
                    <div className="flex-grow h-px border-t-2 border-dotted border-zinc-200 dark:border-zinc-800 opacity-60" />
                </div>
                {/* Number Block */}
                <div className="h-12 md:h-20 w-16 md:w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md shrink-0" />
            </div>

            {/* Grid Section (Strict 3 Columns) */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-10 justify-items-center px-4 md:px-0">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-full">
                        {/* Poster (2/3 Aspect Ratio) */}
                        <div className="aspect-[2/3] w-full rounded-sm bg-zinc-200 dark:bg-zinc-800 mb-3 shadow-sm" />

                        {/* Info Text */}
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                            <div className="h-3 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// app/ui/skeletons.tsx

// --- 10. POST CARD SKELETON ---
// Matches app/ui/blog/BlogCard.tsx or ProfileBlogCard.tsx
// Used in: app/(inside)/profile/[username]/posts/loading.tsx
export function PostCardSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            {/* Media (16/9) */}
            <div className="relative aspect-[16/9] bg-zinc-200 dark:bg-zinc-900 animate-pulse" />

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-4">
                {/* Header: Date & Author Avatar Placeholder */}
                <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-5 w-5 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                </div>

                {/* Title */}
                <div className="h-7 w-11/12 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse" />

                {/* Excerpt lines */}
                <div className="space-y-2">
                    <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>

                {/* Footer Metrics */}
                <div className="mt-auto pt-3 flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-900/50">
                    <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="ml-auto h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );
}

// Optional: If your loading.tsx uses a grid wrapper
export function PostCardGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}


// --- 11. ANALYTICS SKELETONS ---

// Heatmap Skeleton (Mimics app/ui/analytics/heatmap.tsx)
export function HeatmapSkeleton() {
    return (
        <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm h-full">
            {/* Header: Count + Year Pills */}
            <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
                <div className="flex items-baseline gap-2">
                    <SkeletonBlock className="h-10 w-16 rounded-md" />
                    <SkeletonBlock className="h-4 w-24 rounded-full" />
                </div>
                <div className="flex gap-2">
                    <SkeletonBlock className="h-8 w-16 rounded-full" />
                    <SkeletonBlock className="h-8 w-16 rounded-full" />
                </div>
            </div>

            {/* Grid: 4 columns of months */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                        <SkeletonBlock className="h-3 w-10 rounded-sm" />
                        {/* Days Grid (7x5 approx) */}
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, j) => (
                                <div key={j} className="w-full aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-[1px] animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Stats Overview Skeleton (Mimics app/ui/analytics/stats-overview.tsx)
export function StatsOverviewSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Card */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-48 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-4 rounded-full" />
                    <SkeletonBlock className="h-3 w-24 rounded-full" />
                </div>
                <div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <SkeletonBlock className="h-12 w-32 rounded-md" />
                        <SkeletonBlock className="h-6 w-10 rounded-md" />
                    </div>
                    <SkeletonBlock className="h-3 w-40 rounded-full" />
                </div>
            </div>

            {/* Buddy Card */}
            <div className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-48 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                    <SkeletonBlock className="h-4 w-4 rounded-full" />
                    <SkeletonBlock className="h-3 w-32 rounded-full" />
                </div>
                <div className="flex items-center gap-4">
                    <SkeletonBlock className="h-14 w-14 rounded-full shrink-0 border-2 border-zinc-100 dark:border-zinc-800" />
                    <div className="space-y-2">
                        <SkeletonBlock className="h-6 w-32 rounded-md" />
                        <SkeletonBlock className="h-3 w-24 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Platform Chart Skeleton (Mimics app/ui/analytics/platform-chart.tsx)
export function PlatformChartSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <SkeletonBlock className="h-4 w-4 rounded-full" />
                <SkeletonBlock className="h-3 w-32 rounded-full" />
            </div>

            {/* Donut Circle */}
            <div className="flex-1 flex items-center justify-center min-h-[220px]">
                <div className="relative w-48 h-48 rounded-full border-8 border-zinc-100 dark:border-zinc-900 animate-pulse flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <SkeletonBlock className="h-8 w-12 rounded-md" />
                        <SkeletonBlock className="h-2 w-8 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Legend List */}
            <div className="mt-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <SkeletonBlock className="h-2.5 w-2.5 rounded-full" />
                            <SkeletonBlock className="h-3 w-20 rounded-full" />
                        </div>
                        <SkeletonBlock className="h-3 w-8 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Full Analytics Page Skeleton
export function AnalyticsPageSkeleton() {
    return (
        <div className="w-full pb-20 relative z-10 max-w-4xl mx-auto pt-8 px-4 md:px-6">
            {/* Page Title */}
            <div className="mb-10 space-y-2">
                <SkeletonBlock className="h-8 w-40 rounded-md" />
                <SkeletonBlock className="h-4 w-64 rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Col */}
                <div className="lg:col-span-2 space-y-8">
                    <HeatmapSkeleton />
                    <StatsOverviewSkeleton />
                </div>

                {/* Right Col */}
                <div className="h-full">
                    <PlatformChartSkeleton />
                </div>
            </div>
        </div>
    );
}


// ... existing imports

// --- 12. MORE / SETTINGS PAGE SKELETON ---
export function MorePageSkeleton() {
    return (
        <div className="w-full pb-20 relative z-10 max-w-2xl mx-auto pt-8 px-4 md:px-6">
            {/* Header */}
            <div className="mb-10 space-y-2">
                <SkeletonBlock className="h-8 w-32 rounded-md" />
                <SkeletonBlock className="h-4 w-48 rounded-full" />
            </div>

            <div className="space-y-10">
                {/* Section 1 */}
                <div className="space-y-4">
                    <SkeletonBlock className="h-3 w-20 rounded-full" /> {/* Label */}
                    <div className="space-y-3">
                        {/* Menu Item 1 */}
                        <div className="flex items-center p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-20">
                            <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0 mr-4" />
                            <div className="space-y-2 flex-1">
                                <SkeletonBlock className="h-4 w-32 rounded-md" />
                                <SkeletonBlock className="h-3 w-48 rounded-full" />
                            </div>
                        </div>
                        {/* Menu Item 2 */}
                        <div className="flex items-center p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-20">
                            <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0 mr-4" />
                            <div className="space-y-2 flex-1">
                                <SkeletonBlock className="h-4 w-24 rounded-md" />
                                <SkeletonBlock className="h-3 w-40 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-4">
                    <SkeletonBlock className="h-3 w-24 rounded-full" />
                    <div className="space-y-3">
                        <div className="flex items-center p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-16">
                            <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0 mr-4" />
                            <SkeletonBlock className="h-4 w-28 rounded-md" />
                        </div>
                        <div className="flex items-center p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-16">
                            <SkeletonBlock className="w-10 h-10 rounded-xl shrink-0 mr-4" />
                            <SkeletonBlock className="h-4 w-32 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Section 3 (Session) */}
                <div className="space-y-4">
                    <SkeletonBlock className="h-3 w-16 rounded-full" />
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl h-32 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <SkeletonBlock className="h-4 w-24 rounded-md" />
                                <SkeletonBlock className="h-3 w-40 rounded-full" />
                            </div>
                            <SkeletonBlock className="h-6 w-16 rounded-full" />
                        </div>
                        <SkeletonBlock className="h-11 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}