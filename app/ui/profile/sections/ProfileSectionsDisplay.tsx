import Image from 'next/image';
import Link from 'next/link';
import { Film } from 'lucide-react';
import { ProfileSectionWithItems } from '@/lib/definitions';

interface Props {
    sections: ProfileSectionWithItems[];
}

export function ProfileSectionsDisplay({ sections }: Props) {
    if (!sections.length) return null;

    return (
        <div className="px-4 py-6 space-y-8">
            {sections.map(section => (
                <div key={section.id}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                        {section.title}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {section.items.map(item => (
                            <Link
                                key={item.id}
                                href={`/${item.media_type}/${item.media_id}`}
                                className="group block"
                            >
                                <div className="w-20 h-30 rounded-md overflow-hidden bg-muted border group-hover:ring-2 group-hover:ring-ring transition-all">
                                    {item.media_poster ? (
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w185${item.media_poster}`}
                                            alt={item.media_title}
                                            width={80}
                                            height={120}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full" style={{ height: 120 }}>
                                            <Film className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground truncate w-20 group-hover:text-foreground transition-colors">
                                    {item.media_title}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}