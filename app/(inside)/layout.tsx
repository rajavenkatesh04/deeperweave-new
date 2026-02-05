import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function InsideLayout({
                                               children,
                                           }: {
    children: React.ReactNode;
}) {

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Your Sidebar would go here */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}