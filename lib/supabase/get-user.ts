import { cache } from 'react';
import { createClient } from './server';

/**
 * Returns the current authenticated user.
 * Wrapped in React's `cache()` so multiple Server Components in the same
 * request share a single Supabase auth.getUser() network call.
 */
export const getUser = cache(async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
});
