import {createClient} from "@/lib/supabase/server";
import {redirect} from "next/navigation";

export default async function page() {

    const supabase = await createClient();

    const {data : {user}} = await supabase.auth.getUser()

    if(!user) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen flex items-center text-center justify-center">
            <h1>welcome {user.user_metadata?.email}</h1>
        </div>
    )
}