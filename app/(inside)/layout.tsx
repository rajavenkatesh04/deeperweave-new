import SideBar from "@/app/ui/SideBar/SideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        // Main container
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-zinc-50 dark:bg-zinc-950">
            <div className="fixed z-100 bottom-0 w-full md:relative md:w-20 md:h-full">
                <SideBar />
            </div>

            {/* MAIN CONTENT AREA
                - md:pl-20: Adds left padding equal to the sidebar width so content isn't hidden behind it.
            */}
            <div className="flex-grow md:overflow-y-auto pb-20 md:pb-0">
                {children}
            </div>

        </div>
    );
}