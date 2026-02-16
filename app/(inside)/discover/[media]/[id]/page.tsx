import {Movie, Person, TV} from "@/lib/types/tmdb";
import {Metadata} from "next";
import {notFound} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {getMovieDetails, getPersonDetails, getTVDetails} from "@/lib/tmdb/client";
import {MovieHero} from "@/app/(inside)/discover/[media]/[id]/components/MovieHero";
import {TVHero} from "@/app/(inside)/discover/[media]/[id]/components/TVHero";
import {PersonHero} from "@/app/(inside)/discover/[media]/[id]/components/PersonHero";
import ContentGuard from "@/app/ui/media/ContentGuard";

type Params = Promise<{ media: string; id: string }>;

// --- RESOURCE EFFICIENT HELPERS (Server-Side) ---

function getCertification(data: Movie | TV, type: 'movie' | 'tv', countryCode: string): string | undefined {
    const fallbackCode = 'US';
    if (type === 'movie') {
        const m = data as Movie;
        const localRelease = m.release_dates?.results.find((r) => r.iso_3166_1 === countryCode);
        const usRelease = m.release_dates?.results.find((r) => r.iso_3166_1 === fallbackCode);
        const releaseToUse = localRelease || usRelease;
        return releaseToUse?.release_dates.find((d) => d.certification)?.certification;
    } else {
        const t = data as TV;
        const localRating = t.content_ratings?.results.find((r) => r.iso_3166_1 === countryCode);
        const usRating = t.content_ratings?.results.find((r) => r.iso_3166_1 === fallbackCode);
        return localRating?.rating || usRating?.rating;
    }
}

function getProviders(data: Movie | TV, countryCode: string) {
    return data['watch/providers']?.results?.[countryCode]?.flatrate || [];
}

function getKeywords(data: Movie | TV, type: 'movie' | 'tv') {
    if (type === 'movie') return (data as Movie).keywords?.keywords || [];
    return (data as TV).keywords?.results || [];
}

// ---------------------------------------------------------

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    // Basic metadata for SEO
    return { title: 'Discover • DeeperWeave' };
}

export default async function DiscoverPage({ params }: { params: Params }) {
    const { media, id } = await params;
    const tmdbId = parseInt(id);

    if (isNaN(tmdbId)) notFound();

    // ⚡️ PERFORMANCE: Run Auth Check & TMDB Fetch in PARALLEL
    // This cuts latency because we don't wait for Auth to finish before asking TMDB.
    const supabase = await createClient();

    const [authResult, data] = await Promise.all([
        supabase.auth.getUser(),
        (media === 'movie' ? getMovieDetails(tmdbId) :
            media === 'tv' ? getTVDetails(tmdbId) :
                getPersonDetails(tmdbId))
    ]);

    if (!data) notFound();

    // 1. EXTRACT COUNTRY FROM APP METADATA (Zero DB Cost)
    // Assuming your Trigger now syncs 'country' to app_metadata like it does for username/role
    const user = authResult.data.user;
    const userCountryCode = (user?.app_metadata?.country as string) || 'US';

    // 2. FILTER DATA (Server-Side)
    let content = null;

    if (media === 'movie') {
        const movieData = data as Movie;
        content = (
            <MovieHero
                media={movieData}
                certification={getCertification(movieData, 'movie', userCountryCode)}
                providers={getProviders(movieData, userCountryCode)}
                keywords={getKeywords(movieData, 'movie')}
            />
        );
    }
    else if (media === 'tv') {
        const tvData = data as TV;
        content = (
            <TVHero
                media={tvData}
                certification={getCertification(tvData, 'tv', userCountryCode)}
                providers={getProviders(tvData, userCountryCode)}
                keywords={getKeywords(tvData, 'tv')}
            />
        );
    }
    else if (media === 'person') {
        const personData = data as Person;
        content = <PersonHero person={personData} />;
    }

    // 3. CONTENT GUARD (Adult Filter Check)
    // We check safety pref from app_metadata too if available, or default to safe
    const isAdultContent = data.adult === true;

    if (isAdultContent) {
        return (
            <ContentGuard isAdult={true}>
                {content}
            </ContentGuard>
        );
    }

    return content;
}