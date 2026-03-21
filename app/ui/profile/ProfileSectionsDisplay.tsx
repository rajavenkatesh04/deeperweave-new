import Image from 'next/image';
import Link from 'next/link';
import { ProfileSectionResolved } from '@/lib/definitions';
import { FilmIcon, TvIcon, UserIcon } from '@heroicons/react/24/solid';

function ItemCard({ item }: { item: ProfileSectionResolved['items'][number] }) {
    const isMovie  = item.media_type === 'movie';
    const isTV     = item.media_type === 'tv';
    const isPerson = item.media_type === 'person';

    const href = isMovie  ? `/discover/movie/${item.media_id}`
               : isTV    ? `/discover/tv/${item.media_id}`
               : null; // people don't have a discover page yet

    const Icon = isMovie ? FilmIcon : isTV ? TvIcon : UserIcon;

    const inner = (
        <div className="flex flex-col items-center gap-2 w-20 shrink-0 group">
            <div className={`relative w-16 overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm transition-transform group-hover:scale-105 ${isPerson ? 'h-16 rounded-full' : 'h-24 rounded-lg'}`}>
                {item.poster_path ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Icon className="w-6 h-6 text-zinc-400" />
                    </div>
                )}
            </div>
            <p className="text-[10px] text-zinc-600 dark:text-zinc-400 text-center leading-tight line-clamp-2 w-full">
                {item.title}
            </p>
        </div>
    );

    return href ? (
        <Link href={href} className="focus:outline-none">
            {inner}
        </Link>
    ) : (
        <div>{inner}</div>
    );
}

export function ProfileSectionsDisplay({ sections }: { sections: ProfileSectionResolved[] }) {
    const visible = sections.filter(s => s.items.length > 0);
    if (visible.length === 0) return null;

    return (
        <div className="space-y-6">
            {visible.map(section => (
                <div key={section.id} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 px-1">
                        {section.title}
                    </h3>
                    <div className="flex gap-4 flex-wrap">
                        {section.items.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}