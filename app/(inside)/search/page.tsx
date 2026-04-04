import { searchMulti } from '@/lib/tmdb/client';
import { searchUsers } from '@/lib/actions/search-actions';
import { getUser } from '@/lib/supabase/get-user';
import { SearchShell } from '@/app/ui/search/SearchShell';
import { Entity } from '@/lib/types/tmdb';
import { ProfileSearchResult, UserRole } from '@/lib/definitions';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import { Film, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export async function generateMetadata({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
    const { q } = await searchParams;
    return { title: q ? `"${q}" — Search` : 'Search' };
}

const TMDB_IMG = (path: string | null, size = 'w300') =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// ─── Role Badge ───────────────────────────────────────────────────────────────

const ROLE_BADGE: Partial<Record<UserRole, { label: string; className: string }>> = {
    critic:    { label: 'Critic',    className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    verified:  { label: 'Verified',  className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
    staff:     { label: 'Staff',     className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' },
    developer: { label: 'Dev',       className: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' },
    tester:    { label: 'Tester',    className: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700' },
    support:   { label: 'Support',   className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800' },
};

function RoleBadge({ role }: { role: UserRole }) {
    const config = ROLE_BADGE[role];
    if (!config) return null;
    return (
        <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-4 leading-none', config.className)}>
            {config.label}
        </Badge>
    );
}

// ─── Empty / Idle State ───────────────────────────────────────────────────────

function IdleState() {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
            <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                <Search className="size-8 text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
                <p className="font-medium text-zinc-700 dark:text-zinc-300">Search DeeperWeave</p>
                <p className="text-sm text-zinc-400">Movies, TV shows, people, and members</p>
            </div>
        </div>
    );
}

function NoResults({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
            <p className="font-medium text-zinc-700 dark:text-zinc-300">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-zinc-400">Try a different spelling or search term</p>
        </div>
    );
}

// ─── Media Card (untouched) ───────────────────────────────────────────────────

function MediaCard({ item }: { item: Entity }) {
    let imagePath: string | null;
    let title: string;
    let year: string | null = null;
    let typeLabel: string;

    if (item.media_type === 'movie') {
        imagePath  = TMDB_IMG(item.poster_path);
        title      = item.title;
        year       = item.release_date?.split('-')[0] ?? null;
        typeLabel  = 'Movie';
    } else if (item.media_type === 'tv') {
        imagePath  = TMDB_IMG(item.poster_path);
        title      = item.name;
        year       = item.first_air_date?.split('-')[0] ?? null;
        typeLabel  = 'Series';
    } else {
        imagePath  = TMDB_IMG(item.profile_path);
        title      = item.name;
        typeLabel  = 'Person';
    }

    return (
        <Link href={`/discover/${item.media_type}/${item.id}`} className="group flex flex-col gap-2.5">
            <div className="aspect-2/3 relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-800">
                {imagePath ? (
                    <Image
                        src={imagePath}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-2 p-2 text-center bg-zinc-100 dark:bg-zinc-900">
                        <Film className="size-8 opacity-20" strokeWidth={1.5} />
                        <span className="text-xs font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-bold uppercase tracking-wider shadow-lg border border-white/10">
                    {typeLabel}
                </div>
            </div>
            <div className="space-y-0.5 px-0.5">
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {title}
                </p>
                {year && <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{year}</p>}
            </div>
        </Link>
    );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({ user }: { user: ProfileSearchResult }) {
    return (
        <Link
            href={`/profile/${user.username}/home`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all"
        >
            <Avatar className="size-10 shrink-0">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.full_name ?? ''} />
                <AvatarFallback className="text-sm font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                    {user.full_name?.[0]?.toUpperCase() ?? '?'}
                </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100 leading-snug">
                    {user.full_name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-zinc-500 truncate">@{user.username}</span>
                    <RoleBadge role={user.role} />
                </div>
            </div>
        </Link>
    );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function SearchResults({
    mediaResults,
    userResults,
    query,
    type,
}: {
    mediaResults: Entity[];
    userResults: ProfileSearchResult[];
    query: string;
    type: string;
}) {
    const showMedia = type === 'all' || type === 'media';
    const showUsers = type === 'all' || type === 'users';
    const hasResults = mediaResults.length > 0 || userResults.length > 0;

    if (!hasResults) return <NoResults query={query} />;

    return (
        <div className="space-y-10">
            {showUsers && userResults.length > 0 && (
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Members</h2>
                        <Badge variant="secondary" className="text-xs tabular-nums">{userResults.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                        {userResults.map((user) => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                </section>
            )}

            {showMedia && mediaResults.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Movies & TV</h2>
                        <Badge variant="secondary" className="text-xs tabular-nums">{mediaResults.length}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {mediaResults.map((item) => (
                            <MediaCard key={`${item.media_type}-${item.id}`} item={item} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; type?: string }>;
}) {
    const { q, type = 'all' } = await searchParams;
    const query = q?.trim() ?? '';

    let mediaResults: Entity[] = [];
    let userResults: ProfileSearchResult[] = [];

    if (query) {
        const user = await getUser();
        const includeAdult = user?.app_metadata?.content_preference === 'all';

        const fetchMedia = type === 'all' || type === 'media';
        const fetchUsers = type === 'all' || type === 'users';

        await Promise.all([
            fetchMedia
                ? searchMulti(query, includeAdult).then((r) => { mediaResults = r ?? []; })
                : Promise.resolve(),
            fetchUsers
                ? searchUsers(query).then((r) => { userResults = r; })
                : Promise.resolve(),
        ]);
    }

    return (
        <div className="relative bg-white dark:bg-zinc-950 min-h-full md:pl-20">
            {/* Polka dot — light */}
            <div
                className="dark:hidden absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Polka dot — dark */}
            <div
                className="hidden dark:block absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            <div className="relative z-10">
            <SearchShell query={query} type={type}>
                {query ? (
                    <SearchResults
                        mediaResults={mediaResults}
                        userResults={userResults}
                        query={query}
                        type={type}
                    />
                ) : (
                    <IdleState />
                )}
            </SearchShell>
            </div>
        </div>
    );
}
