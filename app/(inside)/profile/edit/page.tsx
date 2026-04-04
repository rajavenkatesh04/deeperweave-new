import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/supabase/get-user';
import { redirect } from 'next/navigation';
import { ProfileEditForm } from './profile-edit-form';
import { getProfileSections } from '@/lib/data/profile-data';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Profile • DeeperWeave',
};

export default async function EditProfilePage() {
    const [user, supabase] = await Promise.all([getUser(), createClient()]);

    if (!user) {
        redirect('/auth/login');
    }

    const [profileResult, initialSections] = await Promise.all([
        supabase.from('profiles').select('bio').eq('id', user.id).single(),
        getProfileSections(user.id),
    ]);

    if (!profileResult.data) redirect('/onboarding');

    // Merge DB-only fields with app_metadata
    const profile = {
        id:          user.id,
        bio:         profileResult.data.bio ?? null,
        username:    user.app_metadata?.username   ?? null,
        full_name:   user.app_metadata?.full_name  ?? null,
        avatar_url:  user.app_metadata?.avatar_url ?? null,
        tier:        user.app_metadata?.tier       ?? 'free',
    };

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground mt-2">
                    Update your public persona and customize your space.
                </p>
            </div>

            <ProfileEditForm
                profile={profile}
                userEmail={user.email || ''}
                initialSections={initialSections}
            />
        </div>
    );
}