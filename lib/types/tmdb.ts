export type EntityType = 'movie' | 'tv' | 'person';

// 1. The Base Interface
export interface BaseEntity {
    id: number;
    media_type: EntityType;
    adult: boolean;
}

// 2. Movie
export interface Movie extends BaseEntity {
    media_type: 'movie';
    title: string;
    original_title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    overview: string;
    vote_average: number;
    original_language: string;
    genre_ids: number[];

    // Optional: Only present if we fetch full details
    runtime?: number;
}

// 3. TV
export interface TV extends BaseEntity {
    media_type: 'tv';
    name: string;
    original_name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    overview: string;
    vote_average: number;
    original_language: string;
    origin_country: string[];
    genre_ids: number[];

    // Optional: Only present if we fetch full details
    number_of_seasons?: number;
    number_of_episodes?: number;
}

// 4. Person
export interface Person extends BaseEntity {
    media_type: 'person';
    name: string;
    profile_path: string | null;
    known_for_department: string;
    known_for?: Entity[];
}

export type Entity = Movie | TV | Person;