import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Run on all routes EXCEPT:
         * - _next/static / _next/image (Next.js internals)
         * - favicon.ico and static image extensions
         * - /policies/* (fully public, no auth needed)
         * - /account-deleted (post-deletion landing, no session)
         * - /scenes/* (public static-like route)
         * - /api/webhooks/* (verify their own signatures, not session-based)
         */
        "/((?!_next/static|_next/image|favicon.ico|policies|account-deleted|scenes|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}