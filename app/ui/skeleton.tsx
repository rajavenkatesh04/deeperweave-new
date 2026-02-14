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