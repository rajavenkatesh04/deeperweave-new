'use client'

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile-actions';
import { Profile } from '@/lib/definitions';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, User as UserIcon, LayoutDashboard } from 'lucide-react';
import {Spinner} from "@/components/ui/spinner";

interface Props {
    profile: Profile;
    userEmail: string;
}

export function ProfileEditForm({ profile, userEmail }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- STATE ---
    const [isUploading, setIsUploading] = useState(false);

    // 1. INSTANT PREVIEW (What the user sees immediately)
    // Initialize with the DB URL, but swap to local blob instantly on change
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);

    // 2. DATA PAYLOAD (What we send to the DB)
    const [finalAvatarUrl, setFinalAvatarUrl] = useState<string>(profile.avatar_url || '');

    // --- HANDLER: UPLOAD ON SELECT ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1. Size Check
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large. Max 2MB.");
            return;
        }

        // 2. INSTANT UX UPDATE
        // Show the user their image IMMEDIATELY (0ms latency)
        const objectUrl = URL.createObjectURL(file);
        setAvatarPreview(objectUrl);
        setIsUploading(true);

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

            // 3. REAL UPLOAD (Client -> Supabase Storage)
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            // 4. GET URL (Synchronous after upload)
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // 5. UPDATE FORM STATE
            setFinalAvatarUrl(publicUrl);
            toast.success("Image uploaded");

        } catch (error: any) {
            console.error(error);
            setAvatarPreview(profile.avatar_url); // Revert on failure
            toast.error("Upload failed", { description: error.message });
        } finally {
            setIsUploading(false);
        }
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

            {/* --- AVATAR SECTION --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Click to upload. Max 2MB.</CardDescription>
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

                {/* PLACEHOLDER SECTIONS */}
                <div className="mt-8">
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-widest px-1">Showcase</h3>
                    <Card className="border-dashed bg-muted/30">
                        <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                            <div className="p-3 bg-muted rounded-full">
                                <LayoutDashboard className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold">Profile Sections</h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    Curate your profile with custom rows.
                                </p>
                            </div>
                            <Button variant="secondary" size="sm" disabled>Coming Soon</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* --- FIXED SAVE BUTTON (Mobile & Desktop) --- */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-[100] flex justify-end md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
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
        <Button type="submit" disabled={isPending} className="min-w-[120px] shadow-lg md:shadow-none">
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