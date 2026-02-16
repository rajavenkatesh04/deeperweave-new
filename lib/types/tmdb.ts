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

export interface ProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface ExternalIds {
    imdb_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
    facebook_id: string | null;
}

export interface Creator {
    id: number;
    name: string;
    profile_path: string | null;
}

export interface Network {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface Provider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
    display_priority?: number;
}
// 2. The main Watch Providers response
export interface WatchProviders {
    results: {
        [countryCode: string]: {
            link: string;
            flatrate?: Provider[];
            rent?: Provider[];
            buy?: Provider[];
            ads?: Provider[];
            free?: Provider[];
        }
    }
}

// 3. Keywords (Perfectly handles the API inconsistency)
export interface Keywords {
    keywords?: { id: number; name: string }[]; // Movie response
    results?: { id: number; name: string }[];  // TV response
}

export interface Keyword {
    id: number;
    name: string;
}

// 2. Movie (Rich)
export interface Movie extends BaseEntity {
    revenue: number;
    budget: number;
    production_companies?: ProductionCompany[];
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

    release_dates?: {
        results: {
            iso_3166_1: string;
            release_dates: { certification: string; type: number }[];
        }[];
    };
    keywords?: { keywords: { id: number; name: string }[] };
    'watch/providers'?: WatchProviders;
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

    // 👇 ADD THESE
    created_by?: Creator[];
    origin_country?: string[];
    networks?: Network[];
    production_companies?: ProductionCompany[];

    // Rich Data
    genres?: Genre[];
    credits?: Credits;
    videos?: { results: Video[] };
    recommendations?: { results: TV[] };
    images?: { backdrops: { file_path: string }[], logos: { file_path: string }[] };

    content_ratings?: {
        results: {
            iso_3166_1: string;
            rating: string;
        }[];
    };
    keywords?: { results: { id: number; name: string }[] };
    'watch/providers'?: WatchProviders;
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

    gender?: number;
    also_known_as?: string[];

    external_ids?: ExternalIds;

    combined_credits?: {
        cast: (Movie | TV)[];
        crew: (Movie | TV)[];
    };

    images?: { profiles: { file_path: string }[] };
}

export type Entity = Movie | TV | Person;