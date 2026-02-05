import {OnboardingForm} from "@/components/onboarding-form";
import {createClient} from "@/lib/supabase/server";
import {UserRound} from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";


export default async function OnboardingPage() {

    const supabase = await createClient();

    const {data : {user}} = await supabase.auth.getUser();

    if (!user) return null;

    const metadata = user.user_metadata ?? {};
    const name = metadata.full_name ?? "there";
    const avatar = metadata.avatar_url ?? null;



    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <Avatar>
                            <AvatarImage
                                src={avatar}
                                alt={name}
                                className="grayscale"
                            />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </div>
                    Welcome {name}
                </a>
                <OnboardingForm />
            </div>
        </div>
    )
}
