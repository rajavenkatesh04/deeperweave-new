import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function InsideLayout({
                                               children,
                                           }: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // 1. Auth Check (Fast)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }

    // 2. Profile/Onboarding Check (Database)
    // We check this here instead of Middleware to save money (DB reads on Edge are expensive/slow)
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

    // 3. The Logic:
    // If they HAVE NO username, they MUST go to onboarding.
    // Note: We use a header or path check to prevent infinite loops if this logic resides inside /onboarding itself.
    // Since this is the layout for the *protected app* (dashboard), redirects are safe.
    if (!profile?.username) {
        redirect('/onboarding');
    }

    return (
        <div className="flex h-screen w-full bg-background text-foreground">
            {/* Your Sidebar would go here */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}