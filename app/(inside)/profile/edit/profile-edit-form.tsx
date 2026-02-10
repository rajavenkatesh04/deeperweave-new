'use client'

import { useState, useTransition, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { createClient } from '@/lib/supabase/client'; // Client-side Supabase for direct upload
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload, X, User as UserIcon, LayoutDashboard } from 'lucide-react';

interface Props {
    profile: Profile;
    userEmail: string; // Used for "Read Only" display
}

export function ProfileEditForm({ profile, userEmail }: Props) {
    const [isPending, startTransition] = useTransition();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // We store the final public URL here to send to the server
    const [finalAvatarUrl, setFinalAvatarUrl] = useState<string>(profile.avatar_url || '');

    // --- 1. HANDLE IMAGE UPLOAD (Client Side -> Storage Bucket) ---
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size Validation (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large. Max 2MB.");
            return;
        }

        setIsUploading(true);
        setUploadProgress(10); // Start animation

        try {
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${profile.id}/avatar-${Date.now()}.${fileExt}`; // Structure: {userId}/{timestamp}.png

            // Upload with Upsert
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, {
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            setUploadProgress(100);

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            setAvatarPreview(publicUrl);
            setFinalAvatarUrl(publicUrl); // This will be sent to the Server Action
            toast.success("Avatar uploaded");

        } catch (error: any) {
            console.error(error);
            toast.error("Upload failed", { description: error.message });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // --- 2. HANDLE FORM SUBMISSION ---
    const handleSubmit = async (formData: FormData) => {
        // Append the uploaded avatar URL to the form data
        formData.set('avatar_url', finalAvatarUrl);

        startTransition(async () => {
            const result = await updateProfile(null, formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Profile saved!");
                const newUsername = formData.get('username') as string;
                router.push(`/profile/${newUsername}/home`);
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">

            {/* --- AVATAR SECTION --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Click to upload. Max 2MB.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">

                    {/* Avatar Preview */}
                    <div className="relative group shrink-0">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative">
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                    unoptimized // Skip Vercel Optimization for user uploads to save costs
                                />
                            ) : (
                                <UserIcon className="h-8 w-8 text-zinc-400" />
                            )}

                            {/* Overlay on Hover */}
                            <div
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        {/* Spinner for Upload */}
                        {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 w-full space-y-4">
                        <div className="hidden sm:block">
                            <Button
                                variant="outline"
                                size="sm"
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

                        {/* Progress Bar (Visible only when uploading) */}
                        {isUploading && (
                            <div className="space-y-1">
                                <Progress value={uploadProgress} className="h-2" />
                                <p className="text-[10px] text-muted-foreground text-right">Uploading...</p>
                            </div>
                        )}

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

                        {/* Full Name */}
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Display Name</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                defaultValue={profile.full_name || ''}
                                placeholder="e.g. Christopher Nolan"
                                required
                            />
                        </div>

                        {/* Username */}
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
                            <p className="text-[10px] text-muted-foreground">Unique handle for your profile URL.</p>
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={profile.bio || ''}
                                placeholder="Tell us about your taste in movies..."
                                className="resize-none h-24"
                                maxLength={160}
                            />
                            <p className="text-[10px] text-muted-foreground text-right">Max 160 chars.</p>
                        </div>

                    </CardContent>
                </Card>

                {/* --- PLACEHOLDER: PROFILE SECTIONS --- */}
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
                                    Curate your profile with custom rows like "Top Horror", "Directors I Hate", and more.
                                </p>
                            </div>
                            <Button variant="secondary" size="sm" disabled>
                                Coming Soon
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* --- SAVE BUTTON --- */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 flex justify-end md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
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
        <Button type="submit" disabled={isPending} className="min-w-[120px]">
            {isPending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : (
                'Save Changes'
            )}
        </Button>
    )
}