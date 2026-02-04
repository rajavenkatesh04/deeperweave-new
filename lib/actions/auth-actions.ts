'use server'

import { createClient } from '@/lib/supabase/server';
import { loginSchema, signupSchema, LoginInput, SignupInput } from '@/lib/validations/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAction(data: LoginInput) {
    const result = loginSchema.safeParse(data);

    if (!result.success) {
        return { error: 'Invalid data' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/onboarding');
}

export async function signupAction(data: SignupInput) {
    const result = signupSchema.safeParse(data);

    if (!result.success) {
        return { error: 'Invalid data format' };
    }

    const supabase = await createClient();
    const origin = (typeof window !== 'undefined')
        ? window.location.origin
        : 'http://localhost:3000';

    const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
            emailRedirectTo: `${origin}/auth/confirm`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Redirect to the success page to avoid form resubmission
    redirect(
        `/auth/sign-up-success?userEmail=${encodeURIComponent(result.data.email)}`
    );
}
