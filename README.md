# DeeperWeave

**The social platform for people who take film seriously.**

DeeperWeave is a modern movie and TV tracking app built for cinephiles. Log what you watch, write long-form reviews, curate lists, and discover what's trending across Bollywood, Anime, K-Drama, and beyond.

---

## Features

- **Precision Logging** — Rate, review, and tag movies, anime, series & K-drama with viewing context (where, when, how you watched)
- **Custom Lists** — Rank, annotate, and share curated collections
- **The Podium** — Showcase your top 3 movies, shows, or characters in custom profile sections
- **Smart Discovery** — Localized trending feeds across Bollywood, Anime, K-Drama, and global cinema
- **Full-Length Blogs** — Publish essays and reviews with a rich text editor built for cinephiles
- **Deep Analytics** — Visualize your habits with cinematic heatmaps and watch time stats
- **Content Guard** — SFW mode that automatically blurs explicit posters and backdrops
- **Social** — Follow users, like and comment on reviews, get notified

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Framer Motion, GSAP |
| Backend | Supabase (Auth, Postgres, Storage) |
| Data | TMDB API, TanStack Query |
| Language | TypeScript 5 |
| Forms | React Hook Form + Zod |
| Package Manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Supabase](https://supabase.com) project
- A [TMDB API](https://developer.themoviedb.org/) key

### Setup

```bash
# Clone the repo
git clone https://github.com/rajavenkatesh04/deeperweave.git
cd deeperweave

# Install dependencies
pnpm install

# Copy env template and fill in your keys
cp .env.example .env.local

# Run the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_TMDB_API_KEY` | TMDB API read access token |

## Project Structure

```
app/
  (inside)/         # Authenticated routes (sidebar layout)
    discover/       # Browse movies, TV, now in theatres, coming soon
    explore/        # Explore page
    search/         # Search
    profile/        # User profiles, reviews, lists, settings
    blogs/          # Blog posts
  auth/             # Sign in, sign up, callback
  ui/               # Feature components
components/ui/      # shadcn/ui primitives
lib/
  actions/          # Server actions
  supabase/         # Supabase client variants
  definitions.ts    # Types and constants
  types/tmdb.ts     # TMDB type definitions
```

## Subscription Tiers

| Tier | Price | Highlights |
|------|-------|------------|
| **Starter** | Free | 2 profile sections, 3 items each |
| **Auteur** | Starting at ₹79/mo | 3 sections, 3 items each |
| **Cineaste** | Starting at ₹149/mo | 10 sections, 6 items each |

New users get a 30-day Auteur trial.

## License

All rights reserved.