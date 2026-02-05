'use server'

import { createClient } from '@/lib/supabase/server';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function checkUsernameAvailability(username: string) {
    const supabase = await createClient();

    // 1. Sanitize: Remove spaces, lowercase
    const query = username.trim().toLowerCase();

    // 2. Validate basics (Save DB calls)
    if (query.length < 3) return false;

    // 3. Database Check
    try {
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('username', query); // strict equality is faster/safer for availability

        if (error) {
            console.error(' Supabase Error in checkUsername:', error);
            // FAIL OPEN: If DB permission error, let them try.
            // The unique constraint on the DB will catch it at the final step anyway.
            return true;
        }

        // If count is 0, nobody has this username -> Available (true)
        return count === 0;

    } catch (err) {
        console.error('Server Action Error:', err);
        return true; // Fail open
    }
}

export async function completeOnboarding(data: OnboardingInput) {
    const parsed = onboardingSchema.safeParse(data);
    if (!parsed.success) {
        return { error: 'Invalid data format' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const cleanUsername = parsed.data.username.trim().toLowerCase();

    // 1. Update Database (The Source of Truth)
    const { error: dbError } = await supabase
        .from('profiles')
        .update({
            username: cleanUsername,
            display_name: parsed.data.display_name,
            bio: parsed.data.bio,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (dbError) {
        console.error("Onboarding DB Error:", dbError);
        if (dbError.code === '23505') return { error: 'Username taken.' };
        return { error: 'Database save failed.' };
    }

    // 2. Update Auth Metadata (The Cache)
    // CRITICAL: This allows page.tsx to skip the DB read next time.
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            username: cleanUsername,
            display_name: parsed.data.display_name
        }
    });

    if (authError) {
        console.error("Metadata Sync Error:", authError);
        // We don't fail the request here because the DB write succeeded,
        // but the user might see the onboarding form one more time.
    }

    revalidatePath('/', 'layout');
    redirect('/profile');
}