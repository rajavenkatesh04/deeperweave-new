import 'server-only';
import { unstable_cache } from 'next/cache';
import { Entity, Movie, TV, Person } from "@/lib/types/tmdb";

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
        .then(res => res.json())
        .then(data => data.results as Entity[])
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


// 1B. Search Movies + TV Only (For Review Attachment)
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