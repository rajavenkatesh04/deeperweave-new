import 'server-only'; // 🛡️ Prevents client-side usage (Security)
import { unstable_cache } from 'next/cache';
import {Entity, Movie} from "@/lib/types/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// The "Generic" Fetcher that respects Vercel Cache
async function fetchTMDB<T>(
    endpoint: string,
    params: Record<string, string> = {},
    cacheTag: string
): Promise<T> {
    const queryString = new URLSearchParams({
        api_key: TMDB_API_KEY!,
        ...params
    }).toString();

    const url = `${BASE_URL}${endpoint}?${queryString}`;

    const res = await fetch(url, {
        next: {
            revalidate: 86400, // 24 Hours Cache
            tags: [cacheTag]   // Tag for purging
        }
    });

    if (!res.ok) throw new Error(`TMDB Error: ${res.statusText}`);
    return res.json();
}

// 1. Search (Lightweight, No Runtime)
export const searchMulti = async (query: string) => {
    return fetchTMDB<{ results: Entity[] }>(
        '/search/multi',
        { query },
        `search-${query}`
    );
};

// 2. Details (Heavy, Has Runtime) - Used for "Log" or "Full Page"
export const getMovieDetails = async (id: number) => {
    return unstable_cache(
        async () => fetchTMDB<Movie>(`/movie/${id}`, {}, `movie-${id}`),
        [`movie-${id}`],
        { revalidate: 86400, tags: [`movie-${id}`] }
    )();
};