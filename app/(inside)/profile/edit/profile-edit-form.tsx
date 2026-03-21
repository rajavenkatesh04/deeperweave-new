'use client'

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile-actions';
import { Profile, ProfileSectionResolved } from '@/lib/definitions';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AvatarEditorModal } from '@/app/ui/profile/AvatarEditorModal';
import { ProfileSectionsEditor } from '@/app/ui/profile/ProfileSectionsEditor';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, User as UserIcon } from 'lucide-react';
import {Spinner} from "@/components/ui/spinner";

interface Props {
    profile: Profile;
    userEmail: string;
    initialSections: ProfileSectionResolved[];
}

export function ProfileEditForm({ profile, initialSections }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE ---
    const [isUploading, setIsUploading] = useState(false);

    // 1. INSTANT PREVIEW (What the user sees immediately)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);

    // 2. DATA PAYLOAD (What we send to the DB)
    const [finalAvatarUrl, setFinalAvatarUrl] = useState<string>(profile.avatar_url || '');

    // 3. EDITOR STATE
    const [editorOpen, setEditorOpen] = useState(false);
    const [pendingObjectUrl, setPendingObjectUrl] = useState<string>('');

    // --- HANDLER: OPEN EDITOR ON SELECT ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Max 5MB.");
            return;
        }

        // Revoke any previous pending URL to free memory
        if (pendingObjectUrl) URL.revokeObjectURL(pendingObjectUrl);

        const objectUrl = URL.createObjectURL(file);
        setPendingObjectUrl(objectUrl);
        setEditorOpen(true);

        // Reset file input so the same file can be re-selected if user cancels
        e.target.value = '';
    };

    // --- HANDLER: UPLOAD THE PROCESSED BLOB FROM THE EDITOR ---
    const handleEditorApply = async (blob: Blob) => {
        setEditorOpen(false);
        const previewUrl = URL.createObjectURL(blob);
        setAvatarPreview(previewUrl);
        setIsUploading(true);

        try {
            const supabase = createClient();
            const fileName = `${profile.id}/avatar-${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setFinalAvatarUrl(publicUrl);
            toast.success("Image uploaded");

        } catch (error: any) {
            console.error(error);
            setAvatarPreview(profile.avatar_url);
            toast.error("Upload failed", { description: error.message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditorCancel = () => {
        setEditorOpen(false);
    };

    // --- HANDLER: SAVE PROFILE ---
    const handleSubmit = async (formData: FormData) => {
        // Ensure we send the uploaded URL
        formData.set('avatar_url', finalAvatarUrl);

        startTransition(async () => {
            const result = await updateProfile(null, formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Profile saved!");
                // Redirect to the new profile home
                const newUsername = formData.get('username') as string;
                router.push(`/profile/${newUsername}/home`);
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <AvatarEditorModal
                open={editorOpen}
                imageUrl={pendingObjectUrl}
                onApply={handleEditorApply}
                onCancel={handleEditorCancel}
            />

            {/* --- AVATAR SECTION --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Click to upload. Max 5MB.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">

                    {/* Avatar Circle */}
                    <div className="relative group shrink-0">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative">
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar"
                                    fill
                                    className={`object-cover transition-opacity duration-300 ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                                    unoptimized // Essential for local blobs
                                />
                            ) : (
                                <UserIcon className="h-8 w-8 text-zinc-400" />
                            )}

                            {/* Click Area */}
                            <div
                                className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer z-10"
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {/* Show Spinner if uploading, else show Upload Icon on Hover */}
                                {isUploading ? (
                                    <Spinner />
                                ) : (
                                    <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 w-full space-y-3">
                        <div className="hidden sm:block">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Change Picture"}
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="text-xs text-muted-foreground">
                            <p>Supported formats: .jpg, .png, .webp</p>
                            <p>Recommended size: 400x400px</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- DETAILS FORM --- */}
            <form action={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>This information will be displayed publicly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="full_name">Display Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={profile.full_name || ''}
                                placeholder="Display Name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-zinc-500">@</span>
                                <Input
                                    id="username"
                                    name="username"
                                    defaultValue={profile.username || ''}
                                    className="pl-8"
                                    placeholder="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={profile.bio || ''}
                                placeholder="Tell us about yourself..."
                                className="resize-none h-24"
                                maxLength={160}
                            />
                        </div>

                    </CardContent>
                </Card>

                {/* SHOWCASE SECTIONS */}
                <div className="mt-8">
                    <div className="flex items-baseline justify-between mb-3 px-1">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Showcase</h3>
                        <span className="text-xs text-muted-foreground capitalize">{profile.tier} plan</span>
                    </div>
                    <ProfileSectionsEditor
                        initialSections={initialSections}
                        tier={profile.tier}
                    />
                </div>

                {/* --- FIXED SAVE BUTTON (Mobile & Desktop) --- */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-100 flex justify-end md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                    <div className="max-w-2xl w-full mx-auto flex justify-end">
                        <SubmitButton isPending={isPending} />
                    </div>
                </div>

            </form>
        </div>
    );
}

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending} className="min-w-30 shadow-lg md:shadow-none">
            {isPending ? (
                <>
                    <Spinner />
                    Saving...
                </>
            ) : (
                'Save Changes'
            )}
        </Button>
    )
}