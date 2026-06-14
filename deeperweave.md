# DeeperWeave — Project Documentation

> Last updated: 2026-06-13. This is the living technical reference for the DeeperWeave codebase.

---

## What Is DeeperWeave?

DeeperWeave is a social platform for cinephiles — people who track, review, and discuss movies and TV shows. Think Letterboxd meets iOS-polished profile widgets, with a strong South Asian focus (regional language films, INR pricing, India-first region detection).

Users can:
- Log and review movies/TV shows with ratings, spoiler flags, viewing method, and photos
- Build public profile showcases (pinned movies/people/shows)
- Track what they're currently watching and maintain a "Up Next" queue (paid)
- Follow other users, like and comment on reviews
- Save media to a personal watchlist
- Subscribe to paid tiers for expanded showcase limits and widget features

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript 5 |
| Database & Auth | Supabase (PostgreSQL 17, RLS, Auth, Storage) |
| External API | TMDB (The Movie Database) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Forms | React Hook Form + Zod |
| Client Cache | TanStack Query (React Query) |
| Email | Resend |
| Payments | Razorpay (skeleton ready, not yet live) |
| Package Manager | pnpm |

---

## Repository Structure

```
deeperweave/
├── app/                        # Next.js App Router pages & layouts
│   ├── (inside)/               # Authenticated route group (sidebar layout)
│   │   ├── discover/           # TMDB content discovery
│   │   ├── profile/            # User profiles (public + self)
│   │   └── search/             # Global search
│   ├── auth/                   # Auth flows (login, signup, oauth, recovery)
│   ├── api/                    # Route handlers (checkout, webhooks)
│   ├── onboarding/             # Post-signup username & preferences setup
│   ├── policies/               # Legal pages (terms, privacy)
│   ├── scenes/                 # Animated transition pages
│   ├── support/                # Support contact form
│   ├── ui/                     # Feature components (non-shadcn)
│   ├── layout.tsx              # Root HTML wrapper, theme, providers
│   ├── page.tsx                # Landing page (unauthenticated)
│   ├── robots.ts               # SEO robots.txt
│   └── sitemap.ts              # Dynamic sitemap
├── components/ui/              # shadcn primitives (DO NOT EDIT)
├── lib/
│   ├── actions/                # Server Actions (all DB mutations)
│   ├── data/                   # Server-side data fetching with ISR caching
│   ├── emails/                 # Resend email templates
│   ├── hooks/                  # Client-side React hooks
│   ├── supabase/               # Supabase client variants
│   ├── tmdb/                   # TMDB API client (all fetches + caching)
│   ├── validations/            # Zod schemas
│   ├── definitions.ts          # ALL TypeScript types and interfaces
│   ├── types/tmdb.ts           # TMDB-specific response types
│   ├── utils.ts                # cn() class merge utility
│   ├── site-url.ts             # Canonical URL helper
│   └── countries.ts            # Country list for dropdowns
├── next.config.ts              # Next.js config (image domains, caching)
├── middleware.ts               # Auth session refresh (delegates to proxy.ts)
└── deeperweave.md              # This file
```

---

## Architecture Overview

### Core Patterns

**1. Server Components + Server Actions**
All data fetching happens in Server Components. All mutations go through Server Actions (`'use server'`). Minimal JS is sent to the client.

**2. Lazy Mirror Pattern**
TMDB is the source of truth for media metadata. Before attaching any TMDB entity to a user record (review, section item, saved item, queue entry), the entity is upserted into the local DB mirror tables (`movies`, `tv_shows`, `people`). This ensures FK integrity and keeps a local cache warm.

```ts
await mirrorMovie(tmdbId);   // upserts to public.movies
await mirrorTV(tmdbId);      // upserts to public.tv_shows
await mirrorPerson(tmdbId);  // upserts to public.people
```

**3. ISR + Tag-Based Cache Invalidation**
TMDB fetches are wrapped in `unstable_cache()` with 24h revalidation and named tags. Profile data is cached per-username with tags. Mutations call `revalidateTag()` to bust only the relevant cache.

**4. Optimistic UI**
Client hooks (`use-like`, `use-follow`, `use-saved`) apply updates immediately and roll back on error.

**5. Tier-Based Access Control**
Features are gated by `tier` (`free` | `auteur` | `cineaste`), read from `profiles.tier` (DB) or `user.app_metadata.tier` (auth). **Never read from `user_metadata`.**

**6. Content Preference Gating**
Adult content requires `content_preference = 'all'`. The `ContentGuard` component handles the gate. Auth-side, `getUser()` is deduplicated per-request via `React.cache()`.

---

## Supabase Client Variants

| Variant | File | When to use |
|---|---|---|
| `createClient` | `lib/supabase/client.ts` | Client components (browser) |
| `createClient` | `lib/supabase/server.ts` | Server components, Actions, Route Handlers |
| `createAdminClient` | `lib/supabase/admin.ts` | Privileged reads that bypass RLS (server only) |
| `updateSession` | `lib/supabase/proxy.ts` | Middleware only — cookie sync + JWT refresh |

---

## Routing

### Public Routes (no auth required)
- `/` — Landing page
- `/auth/*` — Login, signup, recovery, oauth callbacks
- `/discover/*` — All discover pages and media detail pages
- `/explore`, `/blogs/*` — Coming soon placeholders
- `/policies/*` — Terms of service, privacy policy
- `/support` — Contact form
- `/scenes/*` — Animated transition screens
- `/account-deleted` — Post-deletion confirmation
- `/profile/[username]/home` — Public profiles (unless private)

### Private Routes (auth + ownership required)
- `/profile/edit` — Edit own profile
- `/profile/settings` — Account settings
- `/profile/subscriptions` — Subscription management
- `/profile/notifications` — Notification feed
- `/profile/saved` — Saved items library
- `/profile/reviews/create` — Create review
- `/profile/analytics` — Analytics (own profile only)
- `/profile/delete` — Account deletion flow
- `/onboarding` — Post-signup setup (username-less users only)

### Auth Rules (enforced in `lib/supabase/proxy.ts`)
1. No `app_metadata.username` → forced to `/onboarding`
2. Auth pages inaccessible to logged-in users with username
3. Private segments (`edit`, `settings`, etc.) scoped to self only
4. Unauthenticated users → redirect to `/auth/login`

---

## Route Reference

### `app/(inside)/layout.tsx`
Authenticated shell with `SideBar`. Wraps all `(inside)` routes.
- Renders: `SideBar` (desktop fixed left, mobile bottom bar) + `{children}`
- No data fetching at layout level

### `app/(inside)/discover/page.tsx`
Main content discovery hub.
- Fetches user (for region + content preference)
- Detects geo from `x-vercel-ip-country` header, falls back to user's `country` metadata
- 14 parallel TMDB fetches, all cached 24h per region
- Shows regional language rows for Indian users (Tamil, Hindi, Telugu, Malayalam, Kannada)
- Data: `lib/tmdb/client.ts` (all discover functions)

### `app/(inside)/discover/[media]/[id]/page.tsx`
Full detail page for a movie, TV show, or person.
- `generateStaticParams()` pre-builds top 20 trending movies + 20 TV shows at build time
- All other IDs generate on first request (ISR), cached 24h
- Fetches full TMDB detail including credits, videos, providers, keywords
- Renders `MovieHero` | `TVHero` | `PersonHero` based on `media` param
- `dynamicParams = true` (default) — unknown IDs are valid

### `app/(inside)/discover/adult/page.tsx`
Adult content discovery. Gated by `ContentGuard` (requires `content_preference = 'all'`).

### `app/(inside)/discover/coming-soon/page.tsx`
Region-aware upcoming theatrical releases from TMDB.

### `app/(inside)/discover/now-in-theatres/page.tsx`
Region-aware current theatrical releases from TMDB.

### `app/(inside)/search/page.tsx`
Global search across media (movies/TV/people via TMDB) and users (Supabase FTS). Renders `SearchShell` client component.

### `app/(inside)/profile/[username]/layout.tsx`
Public profile wrapper. Fetches profile metadata (24h cache), follow status (fresh), and current user. Shows `PrivateProfileScreen` if profile is private and viewer is not authorized.

### `app/(inside)/profile/[username]/home/page.tsx`
Profile home tab. Shows custom showcase sections (`ProfileSectionsDisplay`) and widget stack (Currently Watching + Up Next — paid feature). If owner, shows editor if no sections exist yet.

### `app/(inside)/profile/[username]/reviews/page.tsx`
User's review timeline with infinite scroll.

### `app/(inside)/profile/[username]/analytics/page.tsx`
Viewing stats dashboard (Suspense-wrapped, loads lazily).

### `app/(inside)/profile/[username]/followers/page.tsx`
Paginated list of followers with follow-back status.

### `app/(inside)/profile/[username]/following/page.tsx`
Paginated list of who the user follows.

### `app/(inside)/profile/[username]/lists/page.tsx`
User's curated lists.

### `app/(inside)/profile/[username]/posts/page.tsx`
User's blog posts (reserved — posts table exists, UI coming soon).

### `app/(inside)/profile/edit/page.tsx`
Edit own profile: full name, username (with availability check), bio, avatar (crop/upload). Uses `ProfileEditForm` client component. Auth-gated.

### `app/(inside)/profile/settings/page.tsx`
Account settings: content preference, profile visibility, gender, country, date of birth. Password change via dialog. Auth-gated.

### `app/(inside)/profile/subscriptions/page.tsx`
Subscription status + pricing cards. Razorpay integration pending — buttons show "coming soon" toast.

### `app/(inside)/profile/saved/page.tsx`
Personal saved library (movies, TV, people). Auth-gated.

### `app/(inside)/profile/reviews/create/page.tsx`
Review creation form. Searches TMDB, picks media, fills rating + content + metadata. Mirrors media to DB on submit. Auth-gated.

### `app/(inside)/profile/notifications/page.tsx`
Notification feed with real-time polling. Auth-gated.

### `app/(inside)/profile/delete/page.tsx`
Account deletion flow with reason capture + email confirmation.

### `app/onboarding/page.tsx`
Post-signup setup: choose username, bio, gender, country, DOB (18+), content preference, visibility. Redirects to profile home on completion.

### `app/api/checkout/route.ts`
POST — initiates Razorpay subscription checkout. Currently returns 503 (stub).

### `app/api/webhooks/razorpay/route.ts`
POST — verifies Razorpay webhook signature (HMAC-SHA256), handles payment events. Skeleton ready with TODO blocks.

---

## Database Schema

### `public.profiles`
Core user record. One row per auth user.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | → `auth.users(id)` |
| `username` | text UNIQUE | 3+ chars, lowercase |
| `full_name` | text | Display name |
| `avatar_url` | text | Supabase Storage URL |
| `bio` | text | Max 160 chars (enforced in UI) |
| `country` | text | ISO country code |
| `date_of_birth` | date | Used for 18+ verification |
| `gender` | gender_enum | male/female/non-binary/prefer_not_to_say |
| `role` | user_role | newbie/user/critic/verified/staff/developer/tester/support |
| `visibility` | profile_visibility | public/private |
| `content_preference` | content_preference | sfw/all |
| `tier` | tier_type | free/auteur/cineaste |
| `newbie_until` | timestamptz | Default now()+3d |
| `trial_until` | timestamptz | Default now()+30d (new users get 30d Auteur trial) |
| `subscription_expires_at` | timestamptz | Denormalised fast-lookup for expiry |
| `follower_count` | int | Maintained by DB trigger |
| `following_count` | int | Maintained by DB trigger |
| `fts` | tsvector | Full-text search (username + full_name) |

### `public.movies` — Lazy Mirror Cache
| Column | Type |
|---|---|
| `tmdb_id` | int PK |
| `title`, `original_title` | text |
| `poster_path`, `backdrop_path` | text |
| `release_date` | date |
| `original_language` | text |
| `adult` | bool |
| `runtime` | int |
| `cached_at` | timestamptz |

### `public.tv_shows` — Lazy Mirror Cache
| Column | Type |
|---|---|
| `tmdb_id` | int PK |
| `name`, `original_name` | text |
| `poster_path`, `backdrop_path` | text |
| `first_air_date` | date |
| `original_language` | text |
| `adult` | bool |
| `number_of_seasons`, `number_of_episodes` | int |
| `cached_at` | timestamptz |

### `public.people` — Lazy Mirror Cache
| Column | Type |
|---|---|
| `tmdb_id` | int PK |
| `name` | text |
| `profile_path` | text |
| `known_for_department` | text |
| `cached_at` | timestamptz |

### `public.reviews`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | → profiles |
| `movie_id` | int nullable | → movies(tmdb_id) |
| `tv_show_id` | int nullable | → tv_shows(tmdb_id) |
| `rating` | numeric | 0–5 |
| `content` | text | Max 1000 chars |
| `watched_on` | timestamptz | Date+time stored UTC |
| `is_rewatch` | bool | |
| `rewatch_count` | int | Auto-calculated on create |
| `contains_spoilers` | bool | |
| `viewing_method` | text | theatre/ott/etc. |
| `viewing_service` | text | Netflix/IMAX/etc. |
| `attachments` | text[] | Storage URLs |
| `like_count`, `comment_count` | int | Cached counts |

### `public.comments`
| Column | Type |
|---|---|
| `id` | uuid PK |
| `user_id` | uuid → profiles |
| `review_id` | uuid → reviews |
| `content` | text (non-empty) |
| `like_count` | int |

### `public.likes`
Composite PK: `(user_id, review_id)`.

### `public.follows`
Composite PK: `(follower_id, following_id)`. Status: accepted/pending/blocked.

### `public.blocks`
Composite PK: `(blocker_id, blocked_id)`.

### `public.notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `recipient_id`, `actor_id` | uuid → profiles | |
| `type` | notification_type | follow_request/follow_accepted/new_follower/like/comment/mention |
| `is_read` | bool | |
| `metadata` | jsonb | actor_username, actor_avatar_url, review_id, comment_preview, etc. |
| `source_id`, `source_type` | uuid/text | Generic source reference |

### `public.saved_items`
Composite PK: `(user_id, media_type, tmdb_id)`. Saves movies/TV/people.

### `public.profile_sections`
Profile showcase sections. Ordered by `rank`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → profiles | |
| `title` | text | |
| `rank` | int | Display order |
| `type` | text | custom/list |
| `linked_list_id` | uuid → lists | nullable, for list-type sections |

### `public.section_items`
Items inside profile sections. Ordered by `rank`.

| Column | Type |
|---|---|
| `section_id` | uuid → profile_sections |
| `media_type` | text (movie/tv/person) |
| `media_id` | int (TMDB ID) |
| `rank` | int |
| `is_private` | bool |

### `public.lists`
User-created curated lists.

### `public.list_entries`
Items in a list. `rank` controls display order.

### `public.currently_watching`
One row per user (UNIQUE on `user_id`). Widget: what the user is actively watching.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid UNIQUE → profiles | One active entry per user |
| `media_type` | text | movie/tv |
| `media_id` | int | TMDB ID (mirrored) |
| `current_season` | int nullable | For TV: current season number |
| `current_episode` | int nullable | For TV: current episode number |
| `note` | text nullable | Max 140 chars — quick thought |
| `started_at` | timestamptz | When they started |
| `updated_at` | timestamptz | Auto-updated on changes |

RLS: owner can INSERT/UPDATE/DELETE; public can SELECT (for profile viewing).

### `public.watch_queue`
Ordered queue of what to watch next. Multiple entries per user.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → profiles | |
| `media_type` | text | movie/tv |
| `media_id` | int | TMDB ID (mirrored) |
| `rank` | int | Display order (lower = sooner) |
| `added_at` | timestamptz | |

UNIQUE constraint on `(user_id, media_type, media_id)` — no duplicates.
RLS: owner can INSERT/UPDATE/DELETE; public can SELECT (for profile viewing).

### `public.subscriptions`
Payment and subscription tracking.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → profiles | |
| `tier` | tier_type | auteur/cineaste |
| `status` | subscription_status | trial/active/cancelled/expired |
| `billing_cycle` | billing_cycle nullable | monthly/yearly |
| `amount_paise` | int | ₹ in paise (null for trial) |
| `started_at`, `expires_at`, `cancelled_at` | timestamptz | |
| `razorpay_*` | text | Payment provider IDs |

### `public.posts`
Blog posts (reserved — table exists, UI not built yet).

### `public.deletion_feedback`
Captures reason when a user deletes their account.

---

## Tier Limits

```ts
free:     { sections: 2,  items: 3  }
auteur:   { sections: 3,  items: 3  }
cineaste: { sections: 10, items: 6  }
```

Enforced in server actions (`lib/actions/section-actions.ts`), not at DB level.

## Subscription Pricing (₹ INR)

| Tier | Monthly | Yearly |
|---|---|---|
| Auteur | ₹79/mo | ₹799/yr |
| Cineaste | ₹149/mo | ₹1,499/yr |

Payments not yet live (Razorpay approval pending). New users get a 30-day Auteur trial via DB trigger.

---

## Server Actions (`lib/actions/`)

### `auth-actions.ts`
- `signInWithEmail(prevState, formData)` — Login with hCaptcha
- `signUpNewUser(prevState, formData)` — Register + create profile row
- `signOutUser()` — Logout

### `profile-actions.ts`
- `checkUsernameAvailability(username)` — RPC uniqueness check
- `completeOnboarding(data)` — Sets username + prefs, sends welcome email
- `updateProfile(prevState, formData)` — Updates name, username, bio
- `updateAvatar(file)` — Uploads to Storage, updates `avatar_url`

### `review-actions.ts`
- `createReview(prevState, formData)` — Creates review: mirrors media, calculates rewatch count, uploads photos, records mentions
- `deleteReview(reviewId)` — Auth-checked delete

### `media-actions.ts`
- `mirrorMovie(tmdbId)` — Upserts movie to `public.movies`
- `mirrorTV(tmdbId)` — Upserts show to `public.tv_shows`
- `mirrorPerson(tmdbId)` — Upserts person to `public.people`
- `searchMedia(query)` — TMDB search (proxied for Server Actions)

### `social-actions.ts`
- `toggleFollowAction(targetUserId)` — Follow/unfollow via RPC
- `getFollowStatusAction(targetUserId)` — Current follow relationship

### `save-actions.ts`
- `toggleSave(mediaType, tmdbId, path)` — Toggle save (mirrors first)
- `getIsSaved(mediaType, tmdbId)` — Initial save state

### `section-actions.ts`
- `createSection(title)` — Create showcase section (tier-gated)
- `updateSectionTitle(sectionId, title)` — Rename section
- `deleteSection(sectionId)` — Delete section + items
- `reorderSections(orderedIds)` — Bulk rank update
- `addItemToSection(sectionId, items[])` — Batch add (mirrors + inserts, tier-gated)

### `widget-actions.ts` *(to be created)*
- `setCurrentlyWatching(mediaType, mediaId, note?)` — Upsert (paid: auteur/cineaste only)
- `updateWatchProgress(season?, episode?)` — Update episode for TV
- `clearCurrentlyWatching()` — Remove the current row
- `addToQueue(mediaType, mediaId)` — Insert into watch_queue (mirrors first, paid only)
- `removeFromQueue(itemId)` — Delete queue entry
- `reorderQueue(orderedIds)` — Bulk rank update

### `subscription-actions.ts`
- `getActiveSubscription()` — Current trial/active sub
- `getSubscriptionHistory()` — All billing records
- `initiateCheckout(tier, billingCycle)` — Returns `{comingSoon: true}` (stub)
- `activateSubscription(...)` — Called by webhook after payment
- `cancelSubscription()` — Mark cancelled; access until `expires_at`

### `settings-actions.ts`
- `updateSettings(data)` — Content pref, visibility, country, gender, DOB
- `requestPasswordReset(captchaToken?)` — Sends recovery email
- `setNewPassword(password)` — Set password after recovery
- `deleteAccount(reason?, comment?)` — Full deletion + email confirmation

### `search-actions.ts`
- `searchUsers(query)` — FTS against profiles (respects content_preference)

### `support-actions.ts`
- `sendSupportTicket(prevState, formData)` — Email via Resend

---

## Data Fetching (`lib/data/`)

### `profile-data.ts`
All functions are server-side and most use `unstable_cache()`.

| Function | Cache | Tag |
|---|---|---|
| `getProfileMetadata(username)` | 24h | `profile-{username}` |
| `getProfileCounts(userId)` | 1h | `profile-counts-{userId}` |
| `getProfileSections(userId)` | 1h | `profile-sections-{userId}` |
| `getFollowStatus(viewerId, targetId)` | None (always fresh) | — |
| `getProfileTimeline(userId, limit, offset)` | None | — |
| `getCurrentlyWatching(userId)` | None (fresh — changes often) | — |
| `getWatchQueue(userId)` | None (fresh) | — |

---

## TMDB Client (`lib/tmdb/client.ts`)

All functions use `unstable_cache()` with 24h revalidation (search: 1h).
Base URL: `https://api.themoviedb.org/3`

### Detail Functions
- `getMovieDetails(id)` — Full movie with credits, videos, providers, keywords
- `getTVDetails(id)` — Full show with credits, videos, providers, content ratings
- `getPersonDetails(id)` — Person with combined credits, images, external IDs
- `searchMulti(query, includeAdult)` — Multi-type search (1h cache)

### Discover Functions
- `getTrendingMovies(timeWindow)` — week/day
- `getTrendingTV(timeWindow)` — week/day
- `getTrendingAll(timeWindow)` — mixed
- `getNowPlaying(region)` — Current theatrical releases
- `getUpcoming(region)` — Upcoming releases
- `getPopularTV()` — Popular series
- `getTopRatedMovies()`, `getTopRatedTV()` — Top rated
- `getAnimationMovies()` — Genre 16
- `getRegionalLanguageMovies(language, region)` — Tamil/Hindi/Telugu/Malayalam/Kannada

### Adult Functions (require `include_adult=true`)
- `getAdultPopular()`, `getAdultNewReleases()`, `getAdultTopRated()`
- `getAdultJAV()`, `getAdultHentai()`, `getAdultWestern()`, `getAdultEuropean()`

---

## UI Components (`app/ui/`)

### SideBar/
- `SideBar.tsx` — Main sidebar, delegates to desktop/mobile variants
- `DesktopNavLinks.tsx` — Fixed left sidebar with icons + tooltips
- `MobileNavLinks.tsx` — Bottom tab bar for mobile
- `user-profile.tsx` — Avatar + username + tier badge in sidebar footer

### Profile/
- `ProfileHeader.tsx` — Profile card: avatar, name, bio, follow button
- `ProfileStats.tsx` — Followers/following/logs counts (Suspense)
- `ProfileSectionsDisplay.tsx` — Renders showcase sections (grid of poster cards)
- `ProfileSectionsEditor.tsx` — Drag-to-reorder + add/remove section items
- `FollowButton.tsx` — Follow/unfollow/pending states with optimistic update
- `AvatarEditorModal.tsx` — Crop + upload avatar image
- `UserBadge.tsx` — Role and tier badge chips
- `PrivateProfileScreen.tsx` — Locked state for private profiles

### Reviews/
- `review-card.tsx` — Individual review (author, poster, rating, content, like/comment buttons)
- `review-drawer.tsx` — Full review detail in a bottom drawer
- `reviews-feed.tsx` — Timeline grid of review cards

### Social/
- `LikeButton.tsx` — Heart button with optimistic count update
- `CommentSection.tsx` — Comment list + add comment input
- `FollowerList.tsx` — Paginated grid of followers
- `FollowingList.tsx` — Paginated grid of following
- `NotificationItem.tsx` — Single notification card with type-specific messaging

### Widgets/ *(to be created)*
- `WidgetStack.tsx` — iOS-style stackable card container (swipe/tap to cycle)
- `CurrentlyWatchingWidget.tsx` — Active watch card: poster, title, episode progress, note
- `UpNextWidget.tsx` — Ordered queue list with add/remove/reorder

### Media/
- `ContentGuard.tsx` — Gates adult content, redirects if content_preference = 'sfw'
- `MediaEngagement.tsx` — Like + comment + save buttons on media detail pages

### Search/
- `SearchShell.tsx` — Search input + tabbed results (media / users)

### Save/
- `SaveButton.tsx` — Bookmark button with optimistic toggle

### Landing/
- `LandingPageClient.tsx` — Hero, features, CTA, pricing preview (unauthenticated)
- `LandingNavbar.tsx` — Top nav for unauthenticated landing
- `FeatureCarousel.tsx` — Rotating feature highlight cards
- `FeatureMockups.tsx` — Static UI mockup illustrations

---

## React Hooks (`lib/hooks/`)

| Hook | Purpose | Pattern |
|---|---|---|
| `use-like.ts` | Toggle review likes | Optimistic, RPC `toggle_like` |
| `use-follow.ts` | Follow/unfollow/accept/reject | RPC-based, status-aware |
| `use-saved.ts` | Toggle saved items | Optimistic toggle |
| `use-comments.ts` | Comment CRUD for a review | React Query |
| `use-notifications.ts` | Notification feed with polling | Polls every 5–10s |
| `use-block.ts` | Block/unblock user | RPC-based |

---

## Caching Strategy

### Server (Next.js ISR + `unstable_cache`)

| Data | TTL | Invalidated by |
|---|---|---|
| TMDB media details | 24h | Tag: `movie-{id}`, `tv-{id}`, `person-{id}` |
| TMDB discover lists | 24h | Tag: `discover-{category}-{region}` |
| TMDB search | 1h | Tag: `search-{query}-{adult|safe}` |
| Profile metadata | 24h | Tag: `profile-{username}` |
| Profile counts | 1h | Tag: `profile-counts-{userId}` |
| Profile sections | 1h | Tag: `profile-sections-{userId}` |
| Currently Watching | No cache (fresh) | — |
| Watch Queue | No cache (fresh) | — |

### Client (TanStack Query)
- Stale time: 30 minutes
- No refetch on window focus
- Used for: user search results, follow status, save state, notification polling

---

## TypeScript Types (`lib/definitions.ts`)

### Enums
```ts
UserRole = 'newbie' | 'user' | 'critic' | 'verified' | 'staff' | 'developer' | 'tester' | 'support'
TierType = 'free' | 'auteur' | 'cineaste'
GenderType = 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
ProfileVisibility = 'public' | 'private'
ContentPreference = 'sfw' | 'all'
FollowStatus = 'pending' | 'accepted'
RelationshipStatus = 'self' | 'none' | 'accepted' | 'pending' | 'blocked_by_you' | 'blocked_by_them'
NotificationType = 'follow_request' | 'follow_accepted' | 'new_follower' | 'like' | 'comment' | 'mention'
SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired'
BillingCycle = 'monthly' | 'yearly'
```

### Key Interfaces
- `Profile` — DB profile row
- `CachedProfile` — Profile + `_count` (followers, following, logs)
- `TimelineEntry` — Review + author + media info + `is_liked_by_me`
- `CommentWithAuthor` — Comment + author fields
- `ProfileSectionResolved` — Section with items resolved to include title + poster_path
- `SectionItemResolved` — Section item with media title + poster
- `CurrentlyWatching` — Currently watching row (media_type, media_id, episode info, note)
- `WatchQueueItem` — Queue entry with rank
- `CurrentlyWatchingResolved` — CurrentlyWatching + joined media details
- `WatchQueueItemResolved` — WatchQueueItem + joined media details
- `Subscription` — Billing record

---

## Validation Schemas (`lib/validations/`)

| File | Schemas |
|---|---|
| `auth.ts` | `signUpSchema`, `loginSchema` |
| `onboarding.ts` | `onboardingSchema` (username, DOB 18+, preferences) |
| `profile.ts` | `ProfileUpdateSchema` |
| `review.ts` | `reviewSchema` (rating 0–5, content 1000 max, photo 5MB) |
| `support.ts` | `supportSchema` |

---

## Email Templates (`lib/emails/`)

- `welcome.ts` — `buildWelcomeEmail(name, username)` — Sent on onboarding completion
- `deletion-confirmation.ts` — `buildDeletionEmail(email)` — Sent on account deletion

Sent via Resend (`RESEND_API_KEY`). From address: `noreply@deeperweave.com`. Support reply-to: `developer@deeperweave.com`.

---

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY

TMDB_API_KEY

NEXT_PUBLIC_SITE_URL
RESEND_API_KEY
TURNSTILE_SITE_KEY
TURNSTILE_SECRET_KEY
```

### Pending (Razorpay — when payments go live)
```env
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
RAZORPAY_WEBHOOK_SECRET
```

---

## Coming Soon (Not Yet Built)

| Feature | Status |
|---|---|
| Blog posts UI | Table exists (`posts`), no UI |
| Profile banner | Column doesn't exist yet |
| Analytics dashboard | Page exists, data layer pending |
| Verified badge | Role exists in enum, no UI treatment |
| Priority support | Listed in pricing, no backend |
| Razorpay payments | Skeleton ready, awaiting Razorpay approval |

---

## Widget System (Paid Feature)

Widgets are iOS-style stackable cards on the profile home page. Visible to all (public profiles), editable only by the owner with an active paid tier (auteur/cineaste).

### Widget: Currently Watching
- One active entry per user (DB unique constraint on `user_id`)
- Supports TV episode tracking (season + episode)
- Optional 140-char note
- "Mark as Watched" → opens review creation form pre-filled
- Owner can update episode progress or clear it

### Widget: Up Next (Watch Queue)
- Ordered list of upcoming movies/TV shows
- Ranked by `rank` column (drag to reorder)
- No duplicates (unique constraint on `user_id + media_type + media_id`)
- Owner can add from any media page, remove, or reorder
- Visitors see a read-only view

Both widgets use the Lazy Mirror pattern — adding to queue or setting currently watching upserts the media into `movies`/`tv_shows` first.
