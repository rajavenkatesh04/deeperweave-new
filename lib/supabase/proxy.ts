import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// middleware.ts (or wherever updateSession is)
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
                },
            },
        }
    );

    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    // Existing unauth check
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    // NEW: Onboarding check for authenticated users
    if (
        user &&  // User is logged in
        !user.user_metadata?.username &&  // No username = needs onboarding (adjust field if needed)
        !request.nextUrl.pathname.startsWith('/onboarding') &&  // Not already on onboarding
        !request.nextUrl.pathname.startsWith('/auth') &&  // Exclude auth routes
        !request.nextUrl.pathname.startsWith('/login')  // Exclude login
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
    }

    // Optional: If has username and trying to access /onboarding, redirect to /profile
    if (
        user &&
        user.user_metadata?.username &&
        request.nextUrl.pathname.startsWith('/onboarding')
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/profile';  // Or '/' or wherever
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}