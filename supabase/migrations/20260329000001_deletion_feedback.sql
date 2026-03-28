-- =============================================================================
-- DELETION FEEDBACK
-- Stores anonymous exit-survey responses when a user deletes their account.
-- No user_id column — data is intentionally de-identified.
-- Only the service role can read rows; inserts go through the admin client.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.deletion_feedback (
    id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    reason     text,
    comment    text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.deletion_feedback ENABLE ROW LEVEL SECURITY;
-- No SELECT / UPDATE / DELETE policies → only service-role key can query.
-- No INSERT policy either → app uses admin client to bypass RLS.