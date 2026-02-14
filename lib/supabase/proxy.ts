import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // 1. Initialize Response
    let supabaseResponse = NextResponse.next({ request });

    // 2. Create Client & Manage Cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 3. SECURE AUTH CHECK (Use getUser, not getSession)
    // This validates the JWT with Supabase and refreshes it if necessary.
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // --- RULE 1: PROTECT PRIVATE ROUTES ---
    // Redirect unauthenticated users to Login
    // We explicitly ALLOW:
    // - /auth/* (Login, Signup, callback)
    // - / (Landing Page - Optional, remove if you want it private)
    if (
        !user &&
        !path.startsWith("/auth") &&
        !path.startsWith("/login") &&
        path !== "/"
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/login";
        return NextResponse.redirect(url);
    }

    // --- RULE 2: ENFORCE ONBOARDING ---
    // ✅ If user is logged in but has NO username in app_metadata, force them to /onboarding
    if (
        user &&
        !user.app_metadata?.username &&
        !path.startsWith("/onboarding") &&
        !path.startsWith("/auth") // Allow logout
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
    }

    // --- RULE 3: PREVENT RE-AUTH & LANDING PAGE ACCESS ---
    // ✅ FIXED: Check app_metadata consistently (not user_metadata)
    // If user IS logged in and HAS username, keep them away from:
    // 1. Login pages
    // 2. Onboarding
    // 3. Landing page (/)
    if (
        user &&
        user.app_metadata?.username &&
        (path.startsWith("/onboarding") || path.startsWith("/auth/login") || path === "/")
    ) {
        const username = user.app_metadata.username;
        const url = request.nextUrl.clone();
        url.pathname = `/profile/${username}/home`;
        return NextResponse.redirect(url);
    }

    // 4. Return the response
    return supabaseResponse;
}