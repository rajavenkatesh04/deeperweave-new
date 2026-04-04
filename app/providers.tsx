'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30 * 60 * 1000,
                refetchOnWindowFocus: false,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (isServer) {
        // Server: always create a fresh client per request
        return makeQueryClient();
    }
    // Browser: reuse the same client so React Suspense doesn't re-create it
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}