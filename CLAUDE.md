# DeeperWeave — Claude Code Rules

## Stack
- Next.js 16 App Router, React 19, TypeScript 5
- Supabase (auth + DB + storage), TMDB API
- Tailwind CSS v4, shadcn/ui, Zod, React Hook Form, TanStack Query
- Package manager: **pnpm**

## Supabase Client Variants
| Variant | File | When to use |
|---------|------|-------------|
| `createClient` | `lib/supabase/client.ts` | Client components (browser) |
| `createClient` | `lib/supabase/server.ts` | Server components, Server Actions, Route Handlers |
| `createAdminClient` | `lib/supabase/admin.ts` | Privileged ops that bypass RLS (server only) |
| Proxy | `lib/supabase/proxy.ts` | Middleware only |

## Lazy Mirror Pattern (REQUIRED)
**Any time an entity (movie, TV show, or person) from TMDB is attached to a user account — e.g. when creating a review, adding to a saved list, or adding to a profile section — it MUST first be mirrored into the local DB before storing the reference.**

Use the existing mirror functions in `lib/actions/media-actions.ts`:
```ts
await mirrorMovie(tmdbId);   // upserts to public.movies
await mirrorTV(tmdbId);      // upserts to public.tv_shows
await mirrorPerson(tmdbId);  // upserts to public.people
```
This ensures FK integrity and keeps our local cache warm.

## Loading Spinner
Always use the project's `Spinner` component for loading states. **Never use `Loader2` from lucide-react directly.**
```ts
import { Spinner } from '@/components/ui/spinner';
// Usage: <Spinner />  or  <Spinner className="text-zinc-400" />
```

## Server Actions Shape
```ts
// Standard shape
async function myAction(prevState: ActionState | null, formData: FormData): Promise<ActionState>

// ActionState
interface ActionState {
  error?: string;
  success?: boolean;
  // + any extra return fields e.g. reviewId
}
```

## Key Patterns
- `app_metadata` (not `user_metadata`) stores `username` and `tier` in Supabase auth
- Profile metadata cached 24h via `unstable_cache` with tag `profile-{username}`
- `revalidateTag(tag, 'max')` — second arg required in this project's Next.js version
- All types live in `lib/definitions.ts` and `lib/types/tmdb.ts`
- `components/ui/` = shadcn primitives (do not edit); `app/ui/` = feature components

## Routing
- `app/(inside)/` = authenticated routes (sidebar layout)
- `app/auth/` = auth flows
- Middleware in `lib/supabase/proxy.ts`

## Tier Limits
```ts
// Defined in lib/definitions.ts → TIER_LIMITS
free:     { sections: 2, items: 3 }
auteur:   { sections: 3, items: 3 }
cineaste: { sections: 10, items: 6 }
```

## Subscription Pricing (₹ INR)
| Tier | Monthly | Yearly | Notes |
|------|---------|--------|-------|
| Starter | Free | Free | Default for new users |
| Auteur | ₹79/mo | ₹799/yr | ~₹66/mo billed yearly |
| Cineaste | ₹149/mo | ₹1,499/yr | ~₹124/mo billed yearly |

- Payments not yet live — buttons show "coming soon" toast
- Trial period tracked in `profiles.trial_until` (timestamptz)
- Read current tier from `profile.tier` (DB), fallback `user.app_metadata?.tier`
- **Never use `user.user_metadata?.tier`** — tier is in `app_metadata`

## Coming Soon Features (not yet built)
- Blog posts (`posts` table exists; UI not built)
- Profile banner (column doesn't exist yet)
- Analytics dashboard
- Verified badge
- Priority support

## Database Schema

```sql
-- profiles
id uuid PK → auth.users(id)
username text UNIQUE, full_name, avatar_url, bio, country, date_of_birth date
gender, role, visibility, content_preference, tier (user_role/tier_type enums)
newbie_until timestamptz, trial_until timestamptz
created_at timestamptz, updated_at timestamptz, fts tsvector

-- movies
tmdb_id int PK, title, original_title, poster_path, backdrop_path
release_date date, original_language, adult bool, runtime int, cached_at timestamptz

-- tv_shows
tmdb_id int PK, name, original_name, poster_path, backdrop_path
first_air_date date, original_language, adult bool
number_of_seasons int, number_of_episodes int, cached_at timestamptz

-- people
tmdb_id int PK, name, profile_path, known_for_department, cached_at timestamptz

-- reviews
id uuid PK, user_id uuid → profiles(id)
movie_id int → movies(tmdb_id), tv_show_id int → tv_shows(tmdb_id)
rating numeric(0–5), content text
watched_on timestamptz DEFAULT now()   ← date+time (stored UTC)
is_rewatch bool, rewatch_count int DEFAULT 1
contains_spoilers bool, viewing_method text, viewing_service text
attachments text[] DEFAULT '{}'
like_count int DEFAULT 0, comment_count int DEFAULT 0
created_at timestamptz, updated_at timestamptz

-- comments
id uuid PK, user_id → profiles, review_id → reviews
content text, like_count int, created_at timestamptz, updated_at timestamptz

-- likes
user_id → profiles, review_id → reviews  (composite PK)
created_at timestamptz

-- follows
follower_id → profiles, following_id → profiles  (composite PK)
status follow_status DEFAULT 'accepted', created_at timestamptz

-- blocks
blocker_id → profiles, blocked_id → profiles  (composite PK)
created_at timestamptz

-- lists
id uuid PK, user_id → profiles
title text, description text, is_public bool DEFAULT true
created_at timestamptz, updated_at timestamptz

-- list_entries
id uuid PK, list_id → lists
media_type text CHECK(movie|tv|person), media_id int, rank int
note text, is_private bool, created_at timestamptz

-- saved_items
user_id → profiles, media_type text CHECK(movie|tv|person), tmdb_id int  (composite PK)
created_at timestamptz

-- profile_sections
id uuid PK, user_id → profiles
title text, rank int, type text CHECK(custom|list)
linked_list_id → lists (nullable), created_at timestamptz

-- section_items
id uuid PK, section_id → profile_sections
media_type text CHECK(movie|tv|person), media_id int, rank int
is_private bool, created_at timestamptz

-- review_mentions
review_id → reviews, user_id → profiles  (composite PK)
created_at timestamptz

-- notifications
id uuid PK, recipient_id → profiles, actor_id → profiles
type notification_type (enum), is_read bool DEFAULT false, created_at timestamptz

-- posts
id uuid PK, author_id → profiles
title text, slug text, summary text, content jsonb
banner_url text, is_published bool, is_premium bool, contains_spoilers bool
published_at timestamptz
associated_media_type text CHECK(movie|tv|person), associated_media_id int
created_at timestamptz, updated_at timestamptz
```
