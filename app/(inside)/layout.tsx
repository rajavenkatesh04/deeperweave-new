import SideBar from "@/app/ui/SideBar/SideBar";
import GuestHeader from "@/app/ui/shared/GuestHeader";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isAuthenticated = !!user?.app_metadata?.username;

    if (isAuthenticated) {
        return (
            <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-zinc-50 dark:bg-zinc-950">
                <div className="fixed z-100 bottom-0 w-full md:relative md:w-20 md:h-full">
                    <SideBar />
                </div>
                <div className="flex-grow md:overflow-y-auto pb-20 md:pb-0">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <GuestHeader />
            <main className="flex-grow">{children}</main>
        </div>
    );
}
