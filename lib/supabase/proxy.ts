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

    // 1. Redirect unauthenticated users to login
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth')
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
    }

    // 2. Redirect authenticated users WITHOUT username to onboarding
    if (
        user &&
        !user.user_metadata?.username &&
        !request.nextUrl.pathname.startsWith('/onboarding') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/login')
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
    }

    // 3. Redirect authenticated users WITH username away from onboarding/auth
    if (
        user &&
        user.user_metadata?.username &&
        (request.nextUrl.pathname.startsWith('/onboarding') ||
            request.nextUrl.pathname.startsWith('/auth/login'))
    ) {
        const username = user.user_metadata.username;
        return NextResponse.redirect(new URL(`/profile/${username}`, request.url));
    }

    // Allow all other requests to proceed
    return supabaseResponse;
}