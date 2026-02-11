export type EntityType = 'movie' | 'tv' | 'person';

// 1. Basic Parts
export interface BaseEntity {
    id: number;
    media_type: EntityType;
    adult: boolean;
    popularity?: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
}

// 2. Movie (Rich)
export interface Movie extends BaseEntity {
    revenue: number;
    budget: number;
    production_companies: any;
    media_type: 'movie';
    title: string;
    original_title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    overview?: string;
    vote_average?: number;
    vote_count?: number;
    original_language: string;
    runtime?: number;
    tagline?: string;
    status?: string;

    // Rich Data (via append_to_response)
    genres?: Genre[];
    credits?: Credits;
    videos?: { results: Video[] };
    recommendations?: { results: Movie[] };
    images?: { backdrops: { file_path: string }[], logos: { file_path: string }[] };
}

// 3. TV (Rich)
export interface TV extends BaseEntity {
    media_type: 'tv';
    name: string;
    original_name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    overview?: string;
    vote_average?: number;
    vote_count?: number;
    original_language: string;

    number_of_seasons?: number;
    number_of_episodes?: number;
    status?: string;
    tagline?: string;

    // Rich Data
    genres?: Genre[];
    credits?: Credits;
    videos?: { results: Video[] };
    recommendations?: { results: TV[] };
    images?: { backdrops: { file_path: string }[], logos: { file_path: string }[] };
}

// 4. Person (Rich)
export interface Person extends BaseEntity {
    media_type: 'person';
    name: string;
    biography?: string;
    place_of_birth?: string;
    birthday?: string;
    deathday?: string | null;
    profile_path: string | null;
    known_for_department: string;

    // Credits where they acted/worked
    combined_credits?: {
        cast: (Movie | TV)[];
        crew: (Movie | TV)[];
    };
    images?: { profiles: { file_path: string }[] };
}

export type Entity = Movie | TV | Person;