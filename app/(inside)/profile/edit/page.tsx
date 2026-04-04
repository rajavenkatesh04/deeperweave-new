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

    // Fetch Profile Data
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        // Should typically not happen if Onboarding is working
        redirect('/onboarding');
    }

    const initialSections = await getProfileSections(user.id);

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