import 'server-only';
import { unstable_cache } from 'next/cache';
import { Entity, Movie, TV, Person, DiscoverItem } from "@/lib/types/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Helper to construct URLs with params
function buildUrl(endpoint: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams({
        api_key: TMDB_API_KEY!,
        language: 'en-US',
        ...params
    });
    return `${BASE_URL}${endpoint}?${searchParams.toString()}`;
}

// Generic Fetcher Wrapper
async function fetchTMDB<T>(url: string, tags: string[], revalidate: number = 86400): Promise<T | null> {
    try {
        const res = await fetch(url, {
            next: {
                revalidate, // Cache duration in seconds
                tags        // Tags for cache invalidation
            }
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`TMDB Error ${res.status}: ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error(`[TMDB Fetch Error]`, error);
        return null;
    }
}

// 1. Search (Dynamic Adult Filter)
// Cache Key includes 'adult' or 'safe' to segregate results
export const searchMulti = async (query: string, includeAdult: boolean = false) => {
    const url = buildUrl('/search/multi', {
        query,
        include_adult: includeAdult ? 'true' : 'false'
    });

    const cacheTag = `search-${query}-${includeAdult ? 'adult' : 'safe'}`;

    // Short cache (1 hour) for search results
    return fetch(url, { next: { revalidate: 3600, tags: [cacheTag] } })
        .then(res => {
            if (!res.ok) throw new Error(`TMDB ${res.status}`);
            return res.json();
        })
        .then(data => (data?.results ?? []) as Entity[])
        .catch(() => [] as Entity[]);
};

// 2. Movie Details (SUPER FETCH)
export const getMovieDetails = async (id: number) => {
    return unstable_cache(
        async () => fetchTMDB<Movie>(
            buildUrl(`/movie/${id}`, {
                append_to_response: 'credits,videos,recommendations,images,release_dates,keywords,watch/providers',
                include_image_language: 'en,null'
            }),
            [`movie-${id}`]
        ),
        [`movie-${id}`],
        { revalidate: 86400, tags: [`movie-${id}`] }
    )();
};

// 3. TV Details (SUPER FETCH)
export const getTVDetails = async (id: number) => {
    return unstable_cache(
        async () => fetchTMDB<TV>(
            buildUrl(`/tv/${id}`, {
                append_to_response: 'credits,videos,recommendations,images,content_ratings,keywords,watch/providers',
                include_image_language: 'en,null'
            }),
            [`tv-${id}`]
        ),
        [`tv-${id}`],
        { revalidate: 86400, tags: [`tv-${id}`] }
    )();
};

// 4. Person Details (SUPER FETCH)
export const getPersonDetails = async (id: number) => {
    return unstable_cache(
        async () => fetchTMDB<Person>(
            buildUrl(`/person/${id}`, {
                append_to_response: 'combined_credits,images,external_ids'
            }),
            [`person-${id}`]
        ),
        [`person-${id}`],
        { revalidate: 86400, tags: [`person-${id}`] }
    )();
};


// ================================================================
// DISCOVER PAGE FUNCTIONS
// All cached 24h via unstable_cache, keyed by region where applicable.
// List endpoints don't include media_type — we attach it manually.
// ================================================================

// 5. Trending All (movies + TV mixed, includes genre_ids, excludes persons)
export const getTrendingAll = async (timeWindow: 'day' | 'week' = 'week') => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl(`/trending/all/${timeWindow}`, {}),
                [`discover-trending-all-${timeWindow}`]
            );
            return (data?.results ?? []).filter(
                (i): i is DiscoverItem => i.media_type === 'movie' || i.media_type === 'tv'
            );
        },
        [`discover-trending-all-${timeWindow}`],
        { revalidate: 86400, tags: [`discover-trending-all-${timeWindow}`] }
    )();
};

// 6. Trending Movies (weekly)
export const getTrendingMovies = async (timeWindow: 'day' | 'week' = 'week') => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl(`/trending/movie/${timeWindow}`, {}),
                [`discover-trending-movies-${timeWindow}`]
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'movie' as const }));
        },
        [`discover-trending-movies-${timeWindow}`],
        { revalidate: 86400, tags: [`discover-trending-movies-${timeWindow}`] }
    )();
};

// 7. Trending TV (weekly)
export const getTrendingTV = async (timeWindow: 'day' | 'week' = 'week') => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl(`/trending/tv/${timeWindow}`, {}),
                [`discover-trending-tv-${timeWindow}`]
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'tv' as const }));
        },
        [`discover-trending-tv-${timeWindow}`],
        { revalidate: 86400, tags: [`discover-trending-tv-${timeWindow}`] }
    )();
};

// 8. Now Playing — region-specific, shared cache per country code
export const getNowPlaying = async (region: string = 'US') => {
    const r = region.toUpperCase();
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/movie/now_playing', { region: r }),
                [`discover-now-playing-${r}`]
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'movie' as const }));
        },
        [`discover-now-playing-${r}`],
        { revalidate: 86400, tags: [`discover-now-playing-${r}`] }
    )();
};

// 9. Upcoming — region-specific
export const getUpcoming = async (region: string = 'US') => {
    const r = region.toUpperCase();
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/movie/upcoming', { region: r }),
                [`discover-upcoming-${r}`]
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'movie' as const }));
        },
        [`discover-upcoming-${r}`],
        { revalidate: 86400, tags: [`discover-upcoming-${r}`] }
    )();
};

// 10. Popular TV Shows
export const getPopularTV = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/tv/popular', {}),
                ['discover-popular-tv']
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'tv' as const }));
        },
        ['discover-popular-tv'],
        { revalidate: 86400, tags: ['discover-popular-tv'] }
    )();
};

// 11. Top Rated Movies
export const getTopRatedMovies = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/movie/top_rated', {}),
                ['discover-top-rated-movies']
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-top-rated-movies'],
        { revalidate: 86400, tags: ['discover-top-rated-movies'] }
    )();
};

// 12. Regional Language Movies — for India (ta=Tamil, hi=Hindi, te=Telugu, ml=Malayalam)
// Date is computed fresh each cache cycle (24h), so "last 30 days" stays current.
export const getRegionalLanguageMovies = async (language: string, region: string = 'IN') => {
    const r = region.toUpperCase();
    return unstable_cache(
        async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const minDate = thirtyDaysAgo.toISOString().split('T')[0];

            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    with_original_language: language,
                    sort_by: 'release_date.desc',
                    'primary_release_date.gte': minDate,
                    region: r,
                    'vote_count.gte': '3',
                }),
                [`discover-regional-${language}-${r}`]
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'movie' as const }));
        },
        [`discover-regional-${language}-${r}`],
        { revalidate: 86400, tags: [`discover-regional-${language}-${r}`] }
    )();
};

// 1B. Search Movies + TV Only (For Review Attachment [media-actions used] )
export const searchMediaOnly = async (
    query: string,
    includeAdult: boolean = false
): Promise<(Movie | TV)[]> => {

    const movieUrl = buildUrl('/search/movie', {
        query,
        include_adult: includeAdult ? 'true' : 'false'
    });

    const tvUrl = buildUrl('/search/tv', {
        query
    });

    const cacheTag = `search-media-${query}-${includeAdult ? 'adult' : 'safe'}`;

    try {
        const [movieRes, tvRes] = await Promise.all([
            fetch(movieUrl, { next: { revalidate: 3600, tags: [cacheTag] } }),
            fetch(tvUrl, { next: { revalidate: 3600, tags: [cacheTag] } }),
        ]);

        const movieData = movieRes.ok ? await movieRes.json() : { results: [] };
        const tvData = tvRes.ok ? await tvRes.json() : { results: [] };

        const movies = (movieData.results || []).map((m: Movie) => ({
            ...m,
            media_type: 'movie' as const
        }));

        const tvShows = (tvData.results || []).map((t: TV) => ({
            ...t,
            media_type: 'tv' as const
        }));

        // Merge + sort by popularity
        return [...movies, ...tvShows]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    } catch (error) {
        console.error('[TMDB Media Search Error]', error);
        return [];
    }
};