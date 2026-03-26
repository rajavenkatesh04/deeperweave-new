import { Skeleton } from "@/components/ui/skeleton";

// Mirrors a ToggleRow: icon box + label/desc + switch pill
function ToggleRowSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-52 rounded" />
                </div>
            </div>
            <Skeleton className="w-11 h-6 rounded-full shrink-0" />
        </div>
    );
}

// Mirrors an ActionRow: icon box + label/desc + chevron
function ActionRowSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
            <div className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                </div>
            </div>
            <Skeleton className="size-4 rounded shrink-0" />
        </div>
    );
}

// Mirrors a section label
function SectionLabel({ width = "w-20" }: { width?: string }) {
    return <Skeleton className={`h-2.5 ${width} rounded-full mb-4`} />;
}

export default function SettingsLoading() {
    return (
        <div className="w-full pb-20 max-w-3xl mx-auto pt-8 px-4 md:px-6">

            {/* Header: back arrow + title + subtitle */}
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="size-9 rounded-full shrink-0" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-3 w-52 rounded" />
                </div>
            </div>

            <div className="space-y-8">

                {/* Visibility */}
                <section>
                    <SectionLabel width="w-20" />
                    <ToggleRowSkeleton />
                </section>

                {/* Content */}
                <section>
                    <SectionLabel width="w-16" />
                    <ToggleRowSkeleton />
                </section>

                {/* Subscription — gradient icon + tier name + trial badge area */}
                <section>
                    <SectionLabel width="w-24" />
                    <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-10 rounded-xl shrink-0" />
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-20 rounded" />
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-36 rounded" />
                            </div>
                        </div>
                        <Skeleton className="size-4 rounded shrink-0" />
                    </div>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* Identity Parameter — 2×2 grid inside a box */}
                <section>
                    <SectionLabel width="w-32" />
                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            {['w-28', 'w-20', 'w-24', 'w-16'].map((w, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-2 w-12 rounded-full" />
                                    <Skeleton className={`h-4 ${w} rounded`} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-2.5 w-64 rounded-full mt-3 ml-1" />
                </section>

                {/* Security */}
                <section>
                    <SectionLabel width="w-16" />
                    <div className="flex items-center p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
                        <Skeleton className="size-10 rounded-xl shrink-0 mr-4" />
                        <div className="space-y-1.5 flex-1">
                            <Skeleton className="h-4 w-32 rounded" />
                            <Skeleton className="h-3 w-full max-w-sm rounded" />
                            <Skeleton className="h-3 w-3/4 max-w-xs rounded" />
                        </div>
                    </div>
                </section>

                {/* Data */}
                <section>
                    <SectionLabel width="w-10" />
                    <div className="space-y-3">
                        <ActionRowSkeleton />
                        <ActionRowSkeleton />
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-6">
                    <Skeleton className="h-2.5 w-24 rounded-full mb-4 bg-red-200 dark:bg-red-900/40" />
                    <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-36 rounded bg-red-200 dark:bg-red-900/40" />
                            <Skeleton className="h-3 w-full max-w-sm rounded bg-red-100 dark:bg-red-900/20" />
                            <Skeleton className="h-3 w-4/5 max-w-xs rounded bg-red-100 dark:bg-red-900/20" />
                        </div>
                        <Skeleton className="h-11 w-36 rounded-xl bg-red-100 dark:bg-red-900/20" />
                    </div>
                </section>

            </div>
        </div>
    );
}