import { QueueListIcon } from '@heroicons/react/24/solid';
import { LockClosedIcon } from '@heroicons/react/24/solid';

export default function ListsPage() {
    return (
        <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between pb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Lists</h2>
            </div>

            <div className="flex flex-col items-center justify-center py-28 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-5">
                <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <QueueListIcon className="w-7 h-7 text-zinc-400" />
                </div>
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">Lists</h3>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                            <LockClosedIcon className="w-2 h-2" /> Coming Soon
                        </span>
                    </div>
                    <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
                        Curate and share your favourite films with custom lists — watchlists, rankings, themes, and more.
                    </p>
                </div>
            </div>
        </div>
    );
}
