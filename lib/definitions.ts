// lib/definitions.ts

/**
 * =====================================================================
 * 1. ENUMS & CONSTANTS
 * Maps to Postgres Enums and logic types.
 * =====================================================================
 */
export type UserRole = 'newbie' | 'user' | 'critic' | 'verified' | 'staff' | 'developer' | 'tester' | 'support';
export type TierType = 'free' | 'auteur' | 'cineaste';
export type GenderType = 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';
export type ProfileVisibility = 'public' | 'private';
export type ContentPreference = 'sfw' | 'all';
export type FollowStatus = 'pending' | 'accepted';

/**
 * =====================================================================
 * 2. DATABASE ENTITIES (Matches Supabase Tables 1:1)
 * Use these when performing raw DB inserts/selects.
 * =====================================================================
 */

// Table: public.profiles
export interface Profile {
    id: string; // UUID
    updated_at: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    country: string | null;
    date_of_birth: string | null; // ISO Date YYYY-MM-DD
    gender: GenderType;
    role: UserRole;
    visibility: ProfileVisibility;
    content_preference: ContentPreference;
    tier: TierType;
    newbie_until: string | null;
    trial_until: string | null;
    created_at: string;
    // fts column is internal, usually not needed in frontend
}

// Table: public.follows
export interface Follow {
    follower_id: string;
    following_id: string;
    status: FollowStatus;
    created_at: string;
}

// Table: public.blocks
export interface Block {
    blocker_id: string;
    blocked_id: string;
    created_at: string;
}

// Table: public.movies (The "Lazy Mirror" Cache)
export interface StoredMovie {
    tmdb_id: number;
    title: string;
    original_title: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string | null;
    original_language: string | null;
    adult: boolean;
    runtime: number | null; // Nullable if only fetched via search
    cached_at: string;
}

// Table: public.tv_shows (The "Lazy Mirror" Cache)
export interface StoredTV {
    tmdb_id: number;
    name: string;
    original_name: string | null;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string | null;
    original_language: string | null;
    adult: boolean;
    number_of_seasons: number | null;
    number_of_episodes: number | null;
    cached_at: string;
}

// Table: public.people (The "Lazy Mirror" Cache)
export interface StoredPerson {
    tmdb_id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string | null;
    cached_at: string;
}

// Table: public.reviews (The "Loom" Threads)
export interface Review {
    id: string; // UUID
    user_id: string;

    // Polymorphic Foreign Keys
    movie_id: number | null;
    tv_show_id: number | null;

    rating: number | null; // numeric(3,1)
    content: string | null;

    watched_on: string; // Date YYYY-MM-DD
    is_rewatch: boolean;
    rewatch_count: number;
    contains_spoilers: boolean;

    viewing_method: string | null; // e.g., 'theatre', 'ott'
    viewing_service: string | null; // e.g., 'Netflix', 'IMAX'

    attachments: string[]; // text[] (URLs)

    // Cached Counts
    like_count: number;
    comment_count: number;

    created_at: string;
    updated_at: string;
}

// Table: public.likes
export interface Like {
    user_id: string;
    review_id: string;
    created_at: string;
}

// Table: public.comments
export interface Comment {
    id: string;
    user_id: string;
    review_id: string;
    content: string;
    like_count: number;
    created_at: string;
    updated_at: string;
}

// Table: public.review_mentions
export interface ReviewMention {
    review_id: string;
    user_id: string;
    created_at: string;
}

/**
 * =====================================================================
 * 3. VIEW MODELS / DTOs (Data Transfer Objects)
 * These are the types used in your UI Components (Feeds, Headers).
 * They combine data from multiple tables.
 * =====================================================================
 */

// Used in ProfileHeader.tsx
export interface CachedProfile extends Profile {
    _count: {
        followers: number;
        following: number;
        logs: number;
    };
}

// Used in Followers/Following Lists
export interface FollowerWithStatus {
    user_id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    is_following: boolean; // Computed by RPC
    is_pending: boolean;   // Computed by RPC
}

// Used in "The Loom" (Timeline) & Feeds
export interface TimelineEntry extends Review {
    // 1. Who wrote it?
    user?: Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'tier' | 'role'>;

    // 2. What did they watch? (Polymorphic Media)
    media?: {
        id: number;
        title: string; // Normalized (Title for Movie, Name for TV)
        poster_path: string | null;
        backdrop_path: string | null;
        release_date: string | null;
        media_type: 'movie' | 'tv';
    };

    // 3. UI State (For interactivity)
    is_liked_by_me: boolean;
}

// Used in Comment Sections
export interface CommentWithAuthor extends Comment {
    author: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>;
}