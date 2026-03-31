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

// 13. Top Rated TV
export const getTopRatedTV = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/tv/top_rated', {}),
                ['discover-top-rated-tv']
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'tv' as const }));
        },
        ['discover-top-rated-tv'],
        { revalidate: 86400, tags: ['discover-top-rated-tv'] }
    )();
};

// 14. Animation Movies
export const getAnimationMovies = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    with_genres: '16',
                    sort_by: 'popularity.desc',
                    'vote_count.gte': '100',
                }),
                ['discover-animation']
            );
            return (data?.results ?? []).map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-animation'],
        { revalidate: 86400, tags: ['discover-animation'] }
    )();
};

// 15. Adult content functions — all filter where adult === true
// TMDB requires include_adult=true AND the API key must have adult content enabled.

export const getAdultPopular = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    sort_by: 'popularity.desc',
                    'vote_count.gte': '5',
                }),
                ['discover-adult-popular-v3']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-popular-v3'],
        { revalidate: 86400, tags: ['discover-adult-popular-v3'] }
    )();
};

export const getAdultNewReleases = async () => {
    return unstable_cache(
        async () => {
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const minDate = sixtyDaysAgo.toISOString().split('T')[0];

            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    sort_by: 'release_date.desc',
                    'primary_release_date.gte': minDate,
                    'vote_count.gte': '2',
                }),
                ['discover-adult-new']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-new'],
        { revalidate: 86400, tags: ['discover-adult-new'] }
    )();
};

export const getAdultTopRated = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    sort_by: 'vote_average.desc',
                    'vote_count.gte': '50',
                }),
                ['discover-adult-top-rated']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-top-rated'],
        { revalidate: 86400, tags: ['discover-adult-top-rated'] }
    )();
};

// Kept for backwards compat — routes to new function
export const getPopularAdultContent = getAdultPopular;

// Adult JAV — Japanese live-action adult (excludes animation genre 16)
export const getAdultJAV = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    with_original_language: 'ja',
                    without_genres: '16',
                    sort_by: 'popularity.desc',
                    'vote_count.gte': '2',
                }),
                ['discover-adult-jav']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-jav'],
        { revalidate: 86400, tags: ['discover-adult-jav'] }
    )();
};

// Adult Hentai — Japanese animated adult (genre 16 + ja language)
export const getAdultHentai = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    with_original_language: 'ja',
                    with_genres: '16',
                    sort_by: 'popularity.desc',
                    'vote_count.gte': '2',
                }),
                ['discover-adult-hentai']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-hentai'],
        { revalidate: 86400, tags: ['discover-adult-hentai'] }
    )();
};

// Adult Western — English-language adult films
export const getAdultWestern = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    with_original_language: 'en',
                    sort_by: 'popularity.desc',
                    'vote_count.gte': '5',
                }),
                ['discover-adult-western']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-western'],
        { revalidate: 86400, tags: ['discover-adult-western'] }
    )();
};

// Adult European — German-language adult (largest European adult production market)
export const getAdultEuropean = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: DiscoverItem[] }>(
                buildUrl('/discover/movie', {
                    include_adult: 'true',
                    with_original_language: 'de',
                    sort_by: 'popularity.desc',
                    'vote_count.gte': '2',
                }),
                ['discover-adult-european']
            );
            return (data?.results ?? [])
                .filter(i => i.adult === true)
                .map(i => ({ ...i, media_type: 'movie' as const }));
        },
        ['discover-adult-european'],
        { revalidate: 86400, tags: ['discover-adult-european'] }
    )();
};

// 16. Trending People — used for "Stars" section on adult page
export interface TrendingPerson {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
    popularity: number;
    known_for: Array<{
        id: number;
        title?: string;
        name?: string;
        media_type: string;
        poster_path: string | null;
        adult?: boolean;
    }>;
}

export const getTrendingPeople = async () => {
    return unstable_cache(
        async () => {
            const data = await fetchTMDB<{ results: TrendingPerson[] }>(
                buildUrl('/trending/person/week', { include_adult: 'true' }),
                ['trending-people-week']
            );
            return data?.results ?? [];
        },
        ['trending-people-week'],
        { revalidate: 86400, tags: ['trending-people-week'] }
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