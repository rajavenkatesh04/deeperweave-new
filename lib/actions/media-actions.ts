'use server'

import {getMovieDetails, getTVDetails, getPersonDetails, searchMediaOnly } from '@/lib/tmdb/client';
import {createAdminClient} from "@/lib/supabase/admin";
import {Movie, TV} from "@/lib/types/tmdb";

/**
 * MIRROR MOVIE
 * Fetches from TMDB Cache -> Upserts to Supabase 'movies' table
 */
export async function mirrorMovie(tmdbId: number): Promise<boolean> {
    const supabase = await createAdminClient();

    // 1. Fetch from TMDB (Hit Vercel Cache first)
    const movie = await getMovieDetails(tmdbId);

    if (!movie) {
        console.error(`Mirror Failed: Movie ${tmdbId} not found on TMDB.`);
        return false;
    }

    // 2. Upsert to DB
    const { error } = await supabase
        .from('movies')
        .upsert({
            tmdb_id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            release_date: movie.release_date || null,
            original_language: movie.original_language,
            adult: movie.adult,
            runtime: movie.runtime || null,
            cached_at: new Date().toISOString()
        });

    if (error) {
        console.error('DB Mirror Error (Movie):', error);
        return false;
    }

    return true;
}

/**
 * MIRROR TV SHOW
 * Fetches from TMDB Cache -> Upserts to Supabase 'tv_shows' table
 */
export async function mirrorTV(tmdbId: number): Promise<boolean> {
    const supabase = await createAdminClient();
    const show = await getTVDetails(tmdbId);

    if (!show) {
        console.error(`Mirror Failed: TV ${tmdbId} not found.`);
        return false;
    }

    const { error } = await supabase
        .from('tv_shows')
        .upsert({
            tmdb_id: show.id,
            name: show.name,
            original_name: show.original_name,
            poster_path: show.poster_path,
            backdrop_path: show.backdrop_path,
            first_air_date: show.first_air_date || null,
            original_language: show.original_language,
            adult: show.adult,
            number_of_seasons: show.number_of_seasons || null,
            number_of_episodes: show.number_of_episodes || null,
            cached_at: new Date().toISOString()
        });

    if (error) {
        console.error('DB Mirror Error (TV):', error);
        return false;
    }

    return true;
}

/**
 * MIRROR PERSON
 * Fetches from TMDB Cache -> Upserts to Supabase 'people' table
 */
export async function mirrorPerson(tmdbId: number): Promise<boolean> {
    const supabase = await createAdminClient();
    const person = await getPersonDetails(tmdbId);

    if (!person) return false;

    const { error } = await supabase
        .from('people')
        .upsert({
            tmdb_id: person.id,
            name: person.name,
            profile_path: person.profile_path,
            known_for_department: person.known_for_department,
            cached_at: new Date().toISOString()
        });

    if (error) {
        console.error('DB Mirror Error (Person):', error);
        return false;
    }

    return true;
}



/**
 * 1. SEARCH BRIDGE (MISSING PART)
 * Allows Client Components to search TMDB securely
 */
export async function searchMedia(query: string): Promise<(Movie | TV)[]> {
    if (!query || query.length < 2) return [];

    try {
        return await searchMediaOnly(query);
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}