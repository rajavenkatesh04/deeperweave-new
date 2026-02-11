import { searchMulti } from '@/lib/tmdb/client';
import { searchUsers } from '@/lib/actions/search-actions';
import { createClient } from '@/lib/supabase/server';
import SearchBar from '@/app/ui/search/SearchBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { Entity } from '@/lib/types/tmdb';
import { ProfileSearchResult } from '@/lib/definitions';
import { Badge } from '@/components/ui/badge';

// Helper for TMDB Images (Handles Posters AND Profiles)
const getImageUrl = (path: string | null) =>
    path ? `https://image.tmdb.org/t/p/w200${path}` : null;

export default async function SearchPage({
                                             searchParams,
                                         }: {
    searchParams: Promise<{ q?: string; type?: string }>
}) {
    const { q, type = 'all' } = await searchParams;

    let mediaResults: Entity[] = [];
    let userResults: ProfileSearchResult[] = [];

    if (q) {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const includeAdult = user?.user_metadata?.content_preference === 'all';

        const promises = [];

        if (type === 'all' || type === 'media') {
            promises.push(searchMulti(q, includeAdult).then(res => mediaResults = res));
        }

        if (type === 'all' || type === 'users') {
            promises.push(searchUsers(q).then(res => userResults = res));
        }

        await Promise.all(promises);
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Search</h1>

            <SearchBar />

            {!q ? (
                <div className="text-center py-20 text-zinc-500">
                    <p>Type something to discover the DeeperWeave.</p>
                </div>
            ) : (
                <Tabs defaultValue={type} className="w-full">
                    <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-auto p-0 mb-6 gap-6">
                        {['all', 'media', 'users'].map((t) => (
                            <Link
                                key={t}
                                href={`/search?q=${q}&type=${t}`}
                                scroll={false}
                            >
                                <TabsTrigger
                                    value={t}
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2 capitalize"
                                >
                                    {t}
                                </TabsTrigger>
                            </Link>
                        ))}
                    </TabsList>

                    {/* --- ALL RESULTS --- */}
                    <TabsContent value="all" className="space-y-10">
                        {/* 1. App Members (Users) */}
                        {userResults.length > 0 && (
                            <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    Members <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500">{userResults.length}</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userResults.slice(0, 3).map(user => (
                                        <UserCard key={user.id} user={user} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 2. TMDB Results (Movies, TV, AND People) */}
                        {mediaResults.length > 0 && (
                            <section>
                                <h3 className="text-lg font-semibold mb-4">Results</h3>
                                <MediaGrid items={mediaResults} />
                            </section>
                        )}

                        {userResults.length === 0 && mediaResults.length === 0 && (
                            <p className="text-center text-zinc-500 py-10">No results found for "{q}".</p>
                        )}
                    </TabsContent>

                    {/* --- MEDIA ONLY --- */}
                    <TabsContent value="media">
                        <MediaGrid items={mediaResults} />
                    </TabsContent>

                    {/* --- USERS ONLY --- */}
                    <TabsContent value="users">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userResults.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}

// --- COMPONENTS ---

function UserCard({ user }: { user: ProfileSearchResult }) {
    return (
        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-zinc-200 shrink-0">
                {user.avatar_url ? (
                    <Image src={user.avatar_url} alt={user.username} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-zinc-500">{user.full_name?.[0]}</div>
                )}
            </div>
            <div className="overflow-hidden min-w-0">
                <p className="font-semibold truncate">{user.full_name}</p>
                <p className="text-sm text-zinc-500 truncate">@{user.username}</p>
            </div>
        </Link>
    )
}

function MediaGrid({ items }: { items: Entity[] }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* REMOVED .filter() so People are included */}
            {items.map((item: any) => {
                // Determine Image Path (Poster for Movies/TV, Profile for Person)
                const imagePath = item.media_type === 'person' ? item.profile_path : item.poster_path;

                // Determine Title
                const title = item.title || item.name;

                // Determine Subtitle info
                let subInfo = '';
                if (item.media_type === 'movie') subInfo = item.release_date?.split('-')[0] || 'TBA';
                else if (item.media_type === 'tv') subInfo = item.first_air_date?.split('-')[0] || 'TBA';
                else if (item.media_type === 'person') subInfo = item.known_for_department || 'Person';

                return (
                    <Link key={item.id} href={`/discover/${item.media_type}/${item.id}`} className="group space-y-2">
                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                            {imagePath ? (
                                <Image
                                    src={getImageUrl(imagePath)!}
                                    alt={title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs p-2 text-center">
                                    No Image
                                </div>
                            )}

                            {/* Optional: Type Badge for clarity */}
                            {item.media_type === 'person' && (
                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-medium uppercase">
                                    Person
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-sm truncate">{title}</p>
                            <p className="text-xs text-zinc-500 capitalize">
                                {item.media_type === 'movie' || item.media_type === 'tv'
                                    ? `${subInfo} • ${item.media_type === 'tv' ? 'TV' : 'Movie'}`
                                    : subInfo
                                }
                            </p>
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}