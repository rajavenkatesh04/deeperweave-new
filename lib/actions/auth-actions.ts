'use server'

import {createClient} from "@/lib/supabase/server";
import {getSiteURL} from "@/lib/site-url";
import {signUpSchema} from "@/lib/validations/auth";
import {redirect} from "next/navigation";



export async function signUpNewUser(formData: FormData) {

    const supabase = await createClient();

    const parsed = signUpSchema.parse({
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    })

    const { data, error } = await supabase.auth.signUp({
        email: parsed.email,
        password: parsed.password,
        options: {
            emailRedirectTo: `${getSiteURL()}/auth/confirm`,
            data: {
                full_name: parsed.fullName,
            }
        },
    })


    redirect(`/auth/sign-up-success?userEmail=${encodeURIComponent(parsed.email)}`)
}




// async function resetPassword() {
//     const { data, error } = await supabase.auth.resetPasswordForEmail(email)
// }