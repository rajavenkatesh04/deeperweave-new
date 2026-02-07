'use server'

import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site-url";
import {loginSchema, signUpSchema} from "@/lib/validations/auth";
import { redirect } from "next/navigation";
import {revalidatePath} from "next/cache";

export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
};

export async function signInWithEmail(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {

    const validated = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validated.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { message: error.message };
    }

    redirect('/');
}


export type SignUpState = {
    errors?: {
        fullName?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
    };
    message?: string | null;
}
export async function signUpNewUser(prevState: SignUpState, formData: FormData): Promise<SignUpState> {

    // 2. Validate form data
    const validatedFields = signUpSchema.safeParse({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    })

    // 3. Return Zod errors if validation fails
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Account.',
        }
    }

    const { email, password, fullName } = validatedFields.data;
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`,
            data: { full_name: fullName }
        },
    })

    // 4. Return Supabase errors if they exist
    if (error) {
        return {
            message: error.message,
        }
    }

    // 5. Only redirect on success
    redirect(`/auth/sign-up-success?userEmail=${encodeURIComponent(email)}`)
}

export async function signInWithGoogle() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider : "google",
        options: {
            redirectTo: `${getSiteURL()}/auth/callback`,
        },
    })
    if (data.url) {
        redirect(data.url) // use the redirect API for your server framework
    }
}


export async function logout() {
    const supabase = await createClient();

    // 1. Sign out from Supabase (clears the session on the server)
    await supabase.auth.signOut();

    // 2. Revalidate the layout to update the UI immediately
    revalidatePath('/', 'layout');

    // 3. Redirect to login page or home
    redirect('/auth/login');
}