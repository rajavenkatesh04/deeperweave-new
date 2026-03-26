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
    const { media, id } = await params;
    const tmdbId = parseInt(id);
    if (isNaN(tmdbId)) return { title: 'Discover | DeeperWeave' };

    // Next.js deduplicates fetch() calls with the same URL — this costs no extra network request.
    const data = await (
        media === 'movie' ? getMovieDetails(tmdbId) :
        media === 'tv'    ? getTVDetails(tmdbId) :
                            getPersonDetails(tmdbId)
    );

    if (!data) return { title: 'Discover | DeeperWeave' };

    const name =
        (data as Movie).title ||
        (data as TV).name ||
        (data as Person).name ||
        'Discover';

    const overview =
        (data as Movie).overview ||
        (data as TV).overview ||
        ((data as Person).known_for_department
            ? `Known for ${(data as Person).known_for_department}`
            : undefined);

    const posterPath =
        (data as Movie | TV).poster_path ||
        (data as Person).profile_path;

    const imageUrl = posterPath
        ? `https://image.tmdb.org/t/p/w780${posterPath}`
        : undefined;

    return {
        title: `${name} | DeeperWeave`,
        description: overview,
        openGraph: {
            title: name,
            description: overview,
            ...(imageUrl && { images: [{ url: imageUrl, width: 780, height: 1170 }] }),
        },
        twitter: {
            card: 'summary_large_image',
            title: name,
            description: overview,
            ...(imageUrl && { images: [imageUrl] }),
        },
    };
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

    // 3. JSON-LD structured data (zero cost — data already fetched above)
    let jsonLd: Record<string, unknown> | null = null;
    if (media === 'movie') {
        const m = data as Movie;
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Movie',
            name: m.title,
            description: m.overview,
            ...(m.poster_path && { image: `https://image.tmdb.org/t/p/w780${m.poster_path}` }),
            ...(m.release_date && { datePublished: m.release_date }),
        };
    } else if (media === 'tv') {
        const t = data as TV;
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'TVSeries',
            name: t.name,
            description: t.overview,
            ...(t.poster_path && { image: `https://image.tmdb.org/t/p/w780${t.poster_path}` }),
            ...(t.first_air_date && { startDate: t.first_air_date }),
        };
    } else if (media === 'person') {
        const p = data as Person;
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: p.name,
            jobTitle: p.known_for_department,
            ...(p.profile_path && { image: `https://image.tmdb.org/t/p/w780${p.profile_path}` }),
        };
    }

    // 4. CONTENT GUARD (Adult Filter Check)
    const isAdultContent = data.adult === true;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {isAdultContent ? (
                <ContentGuard isAdult={true}>{content}</ContentGuard>
            ) : content}
        </>
    );
}