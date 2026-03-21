import Image from 'next/image';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { ProfileSectionResolved } from '@/lib/definitions';

function ItemCard({ item }: { item: ProfileSectionResolved['items'][number] }) {
    const isTV = item.media_type === 'tv';
    const badgeLabel = isTV ? 'Series' : item.media_type;
    const href = `/discover/${item.media_type}/${item.media_id}`;

    return (
        <Link href={href} className="group flex flex-col gap-2.5 focus:outline-none">
            <div className="aspect-2/3 relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-800">
                {item.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2 p-2 text-center bg-zinc-100 dark:bg-zinc-900">
                        <Film className="w-8 h-8 opacity-20" />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold uppercase tracking-wider shadow-lg border border-white/10">
                    {badgeLabel}
                </div>
            </div>
            <div className="px-0.5">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                </p>
            </div>
        </Link>
    );
}

export function ProfileSectionsDisplay({ sections }: { sections: ProfileSectionResolved[] }) {
    const visible = sections.filter(s => s.items.length > 0);
    if (visible.length === 0) return null;

    return (
        <div className="space-y-6">
            {visible.map(section => (
                <div
                    key={section.id}
                    className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-5"
                >
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">
                        {section.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        {section.items.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}