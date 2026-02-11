import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Film, Tv, Users } from 'lucide-react';

const getImageUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w300${path}` : null;

export default async function SavedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: savedItems, error } = await supabase
        .from('saved_items_with_media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Saved page fetch failed:', error);
    }

    const items = savedItems?.map((item: any) => {
        if (item.media_type === 'movie') {
            return {
                id: item.tmdb_id,
                type: 'movie',
                title: item.movie_title ?? `Movie ${item.tmdb_id}`,
                image: item.movie_poster_path,
                subtitle: item.movie_release_date?.split('-')[0] ?? 'Movie',
            };
        }

        if (item.media_type === 'tv') {
            return {
                id: item.tmdb_id,
                type: 'tv',
                title: item.tv_title ?? `TV ${item.tmdb_id}`,
                image: item.tv_poster_path,
                subtitle: item.tv_first_air_date?.split('-')[0] ?? 'TV',
            };
        }

        // person
        return {
            id: item.tmdb_id,
            type: 'person',
            title: item.person_name ?? `Person ${item.tmdb_id}`,
            image: item.person_profile_path,
            subtitle: 'Person',
        };
    }) ?? [];

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Saved Items</h1>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
                    <BookmarkIcon className="w-12 h-12 opacity-20" />
                    <p>Nothing saved yet.</p>
                    <Link href="/discover" className="text-primary hover:underline">
                        Start exploring
                    </Link>
                </div>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="mb-6 bg-transparent p-0 gap-4 border-b w-full justify-start rounded-none h-auto pb-2">
                        <TabsTrigger value="all" className="data-[state=active]:border-b-2 border-primary rounded-none px-2 pb-2">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> All
                        </TabsTrigger>
                        <TabsTrigger value="movie" className="data-[state=active]:border-b-2 border-primary rounded-none px-2 pb-2">
                            <Film className="w-4 h-4 mr-2" /> Movies
                        </TabsTrigger>
                        <TabsTrigger value="tv" className="data-[state=active]:border-b-2 border-primary rounded-none px-2 pb-2">
                            <Tv className="w-4 h-4 mr-2" /> TV
                        </TabsTrigger>
                        <TabsTrigger value="person" className="data-[state=active]:border-b-2 border-primary rounded-none px-2 pb-2">
                            <Users className="w-4 h-4 mr-2" /> People
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        <SavedGrid items={items} />
                    </TabsContent>
                    <TabsContent value="movie">
                        <SavedGrid items={items.filter(i => i.type === 'movie')} />
                    </TabsContent>
                    <TabsContent value="tv">
                        <SavedGrid items={items.filter(i => i.type === 'tv')} />
                    </TabsContent>
                    <TabsContent value="person">
                        <SavedGrid items={items.filter(i => i.type === 'person')} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

function SavedGrid({ items }: { items: any[] }) {
    if (items.length === 0) {
        return <p className="text-zinc-500 py-10">No items found.</p>;
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(item => (
                <Link
                    key={`${item.type}-${item.id}`}
                    href={`/discover/${item.type}/${item.id}`}
                    className="group space-y-2"
                >
                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        {item.image ? (
                            <Image
                                src={getImageUrl(item.image)!}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs p-2 text-center">
                                {item.title}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-sm truncate">{item.title}</p>
                        <p className="text-xs text-zinc-500">{item.subtitle}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function BookmarkIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={className}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
            />
        </svg>
    );
}