import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blogs',
    description: 'Long-form writing on cinema, television, and culture from the DeeperWeave community.',
    openGraph: {
        title: 'Blogs | DeeperWeave',
        description: 'Long-form writing on cinema, television, and culture from the DeeperWeave community.',
    },
};

export default function BlogsPage() {
    return (
        <div className="bg-white dark:bg-zinc-950 min-h-full md:pl-20 flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center py-24 space-y-6">
                <div className="flex justify-center">
                    <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                        <BookOpen className="size-8 text-zinc-400" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Blogs are coming
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                        Essays, reviews, and deep dives on cinema and television —
                        written by the community, for the community.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {['Essays', 'Reviews', 'Deep Dives', 'Retrospectives', 'Lists'].map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}