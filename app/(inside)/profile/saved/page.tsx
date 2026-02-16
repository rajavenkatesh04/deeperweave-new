import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Film, Tv, Users, BookmarkIcon } from 'lucide-react';

// Helper for TMDB Images
const getImageUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w300${path}` : null;

// --- TYPES ---
type SavedItemDisplay = {
    id: number;
    type: 'movie' | 'tv' | 'person';
    title: string;
    image: string | null;
    subtitle: string;
};

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

    // Transform Data
    const items: SavedItemDisplay[] = savedItems?.map((item: any) => {
        if (item.media_type === 'movie') {
            return {
                id: item.tmdb_id,
                type: 'movie',
                title: item.movie_title ?? `Movie ${item.tmdb_id}`,
                image: item.movie_poster_path,
                subtitle: item.movie_release_date?.split('-')[0] ?? 'TBA',
            };
        }
        if (item.media_type === 'tv') {
            return {
                id: item.tmdb_id,
                type: 'tv',
                title: item.tv_title ?? `TV ${item.tmdb_id}`,
                image: item.tv_poster_path,
                subtitle: item.tv_first_air_date?.split('-')[0] ?? 'TBA',
            };
        }
        // person
        return {
            id: item.tmdb_id,
            type: 'person',
            title: item.person_name ?? `Person ${item.tmdb_id}`,
            image: item.person_profile_path,
            subtitle: item.known_for_department ?? 'Person',
        };
    }) ?? [];

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2">Library</h1>
                <p className="text-zinc-500 dark:text-zinc-400">Your collection of saved movies, shows, and people.</p>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-zinc-500 space-y-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                        <BookmarkIcon className="w-8 h-8 opacity-40" />
                    </div>
                    <div className="text-center space-y-1">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">Nothing saved yet</p>
                        <p className="text-sm">Items you bookmark will appear here.</p>
                    </div>
                    <Link
                        href="/discover"
                        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
                    >
                        Start Exploring
                    </Link>
                </div>
            ) : (
                <Tabs defaultValue="all" className="w-full">
                    {/* Responsive Tabs List: Icons only on mobile, Text on desktop */}
                    <TabsList className="w-full justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none h-auto p-0 mb-8 gap-2 sm:gap-6">
                        <TabItem value="all" icon={LayoutDashboard} label="All Items" />
                        <TabItem value="movie" icon={Film} label="Movies" />
                        <TabItem value="tv" icon={Tv} label="TV Shows" />
                        <TabItem value="person" icon={Users} label="People" />
                    </TabsList>

                    <TabsContent value="all" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SavedGrid items={items} />
                    </TabsContent>
                    <TabsContent value="movie" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SavedGrid items={items.filter(i => i.type === 'movie')} />
                    </TabsContent>
                    <TabsContent value="tv" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SavedGrid items={items.filter(i => i.type === 'tv')} />
                    </TabsContent>
                    <TabsContent value="person" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SavedGrid items={items.filter(i => i.type === 'person')} />
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

// --- SUB-COMPONENTS ---

function TabItem({ value, icon: Icon, label }: { value: string, icon: any, label: string }) {
    return (
        <TabsTrigger
            value={value}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 dark:data-[state=active]:border-zinc-100 rounded-none px-2 sm:px-4 pb-3 text-zinc-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 transition-all hover:text-zinc-700 dark:hover:text-zinc-300"
        >
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5" />
                {/* Hidden on mobile (default), Inline on medium screens and up */}
                <span className="hidden md:inline font-medium">{label}</span>
            </div>
        </TabsTrigger>
    );
}

function SavedGrid({ items }: { items: SavedItemDisplay[] }) {
    if (items.length === 0) {
        return (
            <div className="py-20 text-center text-zinc-500">
                <p>No items found in this category.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {items.map((item) => (
                <Link
                    key={`${item.type}-${item.id}`}
                    href={`/discover/${item.type}/${item.id}`}
                    className="group flex flex-col gap-2.5"
                >
                    {/* Image Card */}
                    <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        {item.image ? (
                            <Image
                                src={getImageUrl(item.image)!}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2 p-2 text-center bg-zinc-100 dark:bg-zinc-900">
                                <Film className="w-8 h-8 opacity-20" />
                                <span className="text-xs font-medium">No Image</span>
                            </div>
                        )}

                        {/* Badge Overlay - Consistent with SearchPage style */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold uppercase tracking-wider shadow-lg border border-white/10">
                            {item.type === 'tv' ? 'Series' : item.type}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-0.5 px-0.5">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize truncate">
                            {item.subtitle}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}