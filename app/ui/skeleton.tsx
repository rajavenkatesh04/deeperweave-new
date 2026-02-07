// app/ui/profile/StatsSkeleton.tsx
export function StatsSkeleton() {
    return (
        <div className="flex flex-row items-center justify-start gap-5 md:gap-8 w-full animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-start gap-1.5">
                    {/* The Number (e.g., '1.2k') */}
                    <div className="h-5 w-8 md:w-12 bg-zinc-200 dark:bg-zinc-800 rounded-md" />

                    {/* The Label (e.g., 'Followers') */}
                    <div className="h-3.5 w-14 md:w-20 bg-zinc-100 dark:bg-zinc-900/50 rounded-md" />
                </div>
            ))}
        </div>
    );
}