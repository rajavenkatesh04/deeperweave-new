import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { SetPasswordForm } from './SetPasswordForm';

export const metadata: Metadata = { title: 'Set New Password' };

export default async function SetPasswordPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Must have an active recovery session to access this page
    if (!user) redirect('/auth/login');

    return (
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Set new password</h1>
                    <p className="text-sm text-zinc-500 mt-2">Choose a strong password for your account.</p>
                </div>
                <SetPasswordForm />
            </div>
        </div>
    );
}
