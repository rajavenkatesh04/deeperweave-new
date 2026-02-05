export type UserRole = 'newbie' | 'user' | 'critic' | 'verified' | 'staff' | 'developer' | 'tester' | 'support';
export type TierType = 'free' | 'auteur' | 'cineaste';
export type EntityType = 'movie' | 'series' | 'star';
export type SubscriptionStatus = 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';

export interface Profile {
    id: string; // UUID
    username: string | null; // Nullable until onboarding is done
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;

    country: string | null;
    date_of_birth: string | null; // ISO Date string
    gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say';

    role: UserRole;
    tier: TierType;

    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    payment_provider: 'stripe' | 'system';
    provider_subscription_id: string;
    status: SubscriptionStatus;
    plan_id: string;
    cancel_at_period_end: boolean;
    current_period_start: string;
    current_period_end: string;
}

// "Lazy Mirror" Types (Minimal data we store)
export interface StoredMovie {
    id: number; // TMDB ID
    title: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string | null;
    type: 'movie';
}

export interface StoredSeries {
    id: number; // TMDB ID
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string | null;
    type: 'series';
}

export interface StoredStar {
    id: number; // TMDB ID
    name: string;
    profile_path: string | null;
    type: 'star';
}