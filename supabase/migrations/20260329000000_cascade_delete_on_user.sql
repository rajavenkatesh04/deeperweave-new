-- =============================================================================
-- CASCADE DELETE: Ensure all user-owned rows are removed when a profile is
-- deleted, and that the profile itself is removed when the auth.users row is
-- deleted.  This is the DB-level guarantee; the application-level deletion in
-- settings-actions.ts already handles the same cleanup explicitly.
-- =============================================================================

-- Helper: safely re-create a FK with ON DELETE CASCADE
-- We drop the old constraint (if it exists) and re-add it.

-- ─── profiles → auth.users ───────────────────────────────────────────────────
ALTER TABLE public.profiles
    DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ─── reviews → profiles ──────────────────────────────────────────────────────
ALTER TABLE public.reviews
    DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE public.reviews
    ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── comments → profiles ─────────────────────────────────────────────────────
ALTER TABLE public.comments
    DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.comments
    ADD CONSTRAINT comments_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── comments → reviews ──────────────────────────────────────────────────────
ALTER TABLE public.comments
    DROP CONSTRAINT IF EXISTS comments_review_id_fkey;
ALTER TABLE public.comments
    ADD CONSTRAINT comments_review_id_fkey
    FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;

-- ─── likes → profiles ────────────────────────────────────────────────────────
ALTER TABLE public.likes
    DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.likes
    ADD CONSTRAINT likes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── likes → reviews ─────────────────────────────────────────────────────────
ALTER TABLE public.likes
    DROP CONSTRAINT IF EXISTS likes_review_id_fkey;
ALTER TABLE public.likes
    ADD CONSTRAINT likes_review_id_fkey
    FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;

-- ─── follows → profiles (both FKs) ──────────────────────────────────────────
ALTER TABLE public.follows
    DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows
    ADD CONSTRAINT follows_follower_id_fkey
    FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.follows
    DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE public.follows
    ADD CONSTRAINT follows_following_id_fkey
    FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── blocks → profiles (both FKs) ───────────────────────────────────────────
ALTER TABLE public.blocks
    DROP CONSTRAINT IF EXISTS blocks_blocker_id_fkey;
ALTER TABLE public.blocks
    ADD CONSTRAINT blocks_blocker_id_fkey
    FOREIGN KEY (blocker_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.blocks
    DROP CONSTRAINT IF EXISTS blocks_blocked_id_fkey;
ALTER TABLE public.blocks
    ADD CONSTRAINT blocks_blocked_id_fkey
    FOREIGN KEY (blocked_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── saved_items → profiles ──────────────────────────────────────────────────
ALTER TABLE public.saved_items
    DROP CONSTRAINT IF EXISTS saved_items_user_id_fkey;
ALTER TABLE public.saved_items
    ADD CONSTRAINT saved_items_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── review_mentions → profiles ──────────────────────────────────────────────
ALTER TABLE public.review_mentions
    DROP CONSTRAINT IF EXISTS review_mentions_user_id_fkey;
ALTER TABLE public.review_mentions
    ADD CONSTRAINT review_mentions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── review_mentions → reviews ───────────────────────────────────────────────
ALTER TABLE public.review_mentions
    DROP CONSTRAINT IF EXISTS review_mentions_review_id_fkey;
ALTER TABLE public.review_mentions
    ADD CONSTRAINT review_mentions_review_id_fkey
    FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE CASCADE;

-- ─── notifications → profiles (recipient) ────────────────────────────────────
ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_recipient_id_fkey;
ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey
    FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── notifications → profiles (actor) — SET NULL so other users' notifications
--     about past events aren't wiped; actor becomes anonymous ──────────────────
ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS notifications_actor_id_fkey;
ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ─── profile_sections → profiles ─────────────────────────────────────────────
ALTER TABLE public.profile_sections
    DROP CONSTRAINT IF EXISTS profile_sections_user_id_fkey;
ALTER TABLE public.profile_sections
    ADD CONSTRAINT profile_sections_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── section_items → profile_sections ────────────────────────────────────────
ALTER TABLE public.section_items
    DROP CONSTRAINT IF EXISTS section_items_section_id_fkey;
ALTER TABLE public.section_items
    ADD CONSTRAINT section_items_section_id_fkey
    FOREIGN KEY (section_id) REFERENCES public.profile_sections(id) ON DELETE CASCADE;

-- ─── lists → profiles ────────────────────────────────────────────────────────
ALTER TABLE public.lists
    DROP CONSTRAINT IF EXISTS lists_user_id_fkey;
ALTER TABLE public.lists
    ADD CONSTRAINT lists_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── list_entries → lists ────────────────────────────────────────────────────
ALTER TABLE public.list_entries
    DROP CONSTRAINT IF EXISTS list_entries_list_id_fkey;
ALTER TABLE public.list_entries
    ADD CONSTRAINT list_entries_list_id_fkey
    FOREIGN KEY (list_id) REFERENCES public.lists(id) ON DELETE CASCADE;

-- ─── subscriptions → profiles ────────────────────────────────────────────────
ALTER TABLE public.subscriptions
    DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── posts → profiles ────────────────────────────────────────────────────────
ALTER TABLE public.posts
    DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts
    ADD CONSTRAINT posts_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
