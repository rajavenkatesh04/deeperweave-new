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
