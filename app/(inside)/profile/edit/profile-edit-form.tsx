'use client';

import { useState, useTransition, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/profile-actions';
import { saveSections, SectionDraft, ItemDraft } from '@/lib/actions/section-actions';
import { Profile, ProfileSectionResolved } from '@/lib/definitions';
import {
    ProfileSectionsEditor,
    ProfileSectionsEditorHandle,
    LocalSection,
} from '@/app/ui/profile/ProfileSectionsEditor';
import { toast } from 'sonner';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AvatarEditorModal } from '@/app/ui/profile/AvatarEditorModal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Upload, User as UserIcon, AlertCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface Props {
    profile: Profile;
    userEmail: string;
    initialSections: ProfileSectionResolved[];
}

function toSectionDraft(section: LocalSection): SectionDraft {
    return {
        id: section.id,
        title: section.title,
        rank: section.rank,
        items: section.items.map((item, i): ItemDraft => ({
            id: item.id,
            media_type: item.media_type,
            media_id: item.media_id,
            rank: i + 1,
        })),
    };
}

export function ProfileEditForm({ profile, initialSections }: Props) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<ProfileSectionsEditorHandle>(null);

    // Avatar state
    const [isUploading, setIsUploading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
    const [finalAvatarUrl, setFinalAvatarUrl] = useState<string>(profile.avatar_url || '');
    const [editorOpen, setEditorOpen] = useState(false);
    const [pendingObjectUrl, setPendingObjectUrl] = useState<string>('');

    // Dirty state — true if any unsaved change exists
    const [isDirty, setIsDirty] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const markDirty = useCallback(() => setIsDirty(true), []);

    // Warn on browser-level navigation (tab close, refresh, external link)
    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    /* ── Avatar handlers ── */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB.'); return; }
        if (pendingObjectUrl) URL.revokeObjectURL(pendingObjectUrl);
        setPendingObjectUrl(URL.createObjectURL(file));
        setEditorOpen(true);
        e.target.value = '';
    };

    const handleEditorApply = async (blob: Blob) => {
        setEditorOpen(false);
        setAvatarPreview(URL.createObjectURL(blob));
        setIsUploading(true);
        markDirty();
        try {
            const supabase = createClient();
            const fileName = `${profile.id}/avatar-${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
            setFinalAvatarUrl(publicUrl);
            toast.success('Image uploaded');
        } catch (error: unknown) {
            setAvatarPreview(profile.avatar_url);
            toast.error('Upload failed', { description: error instanceof Error ? error.message : undefined });
        } finally {
            setIsUploading(false);
        }
    };

    /* ── Submit: saves profile fields + sections together ── */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set('avatar_url', finalAvatarUrl);

        const sections = editorRef.current?.getSections() ?? [];

        startTransition(async () => {
            const [profileResult, sectionsResult] = await Promise.all([
                updateProfile(null, formData),
                saveSections(sections.map(toSectionDraft)),
            ]);

            if (profileResult?.error) { toast.error(profileResult.error); return; }
            if (sectionsResult?.error) { toast.error(`Showcase: ${sectionsResult.error}`); return; }

            setIsDirty(false);
            toast.success('Profile saved!');
            const newUsername = formData.get('username') as string;
            router.push(`/profile/${newUsername}/home`);
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
            <AvatarEditorModal
                open={editorOpen}
                imageUrl={pendingObjectUrl}
                onApply={handleEditorApply}
                onCancel={() => setEditorOpen(false)}
            />

            {/* Unsaved changes banner */}
            {isDirty && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    You have unsaved changes — click Save Changes to apply them.
                </div>
            )}

            {/* Avatar */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Click to upload. Max 5MB.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="relative group shrink-0">
                        <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative">
                            {avatarPreview ? (
                                <Image
                                    src={avatarPreview}
                                    alt="Avatar"
                                    fill
                                    className={`object-cover transition-opacity duration-300 ${isUploading ? 'opacity-50' : ''}`}
                                    unoptimized
                                />
                            ) : (
                                <UserIcon className="h-8 w-8 text-zinc-400" />
                            )}
                            <div
                                className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-colors cursor-pointer z-10"
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                {isUploading ? <Spinner /> : (
                                    <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                        <div className="hidden sm:block">
                            <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                {isUploading ? 'Uploading…' : 'Change Picture'}
                            </Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                            <p>Supported formats: .jpg, .png, .webp</p>
                            <p>Recommended size: 400×400px</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile fields + sections in one form */}
            <form onSubmit={handleSubmit} onChange={markDirty}>
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>This information will be displayed publicly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Display Name</Label>
                            <Input id="full_name" name="full_name" defaultValue={profile.full_name || ''} placeholder="Display Name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-zinc-500">@</span>
                                <Input id="username" name="username" defaultValue={profile.username || ''} className="pl-8" placeholder="username" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" name="bio" defaultValue={profile.bio || ''} placeholder="Tell us about yourself…" className="resize-none h-24" maxLength={160} />
                        </div>
                    </CardContent>
                </Card>

                {/* Showcase sections — local state, saved on submit */}
                <div className="mt-8">
                    <div className="flex items-baseline justify-between mb-3 px-1">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Showcase</h3>
                        <span className="text-xs text-muted-foreground capitalize">{profile.tier} plan</span>
                    </div>
                    <ProfileSectionsEditor
                        ref={editorRef}
                        initialSections={initialSections}
                        tier={profile.tier}
                        onDirty={markDirty}
                    />
                </div>

                {/* Fixed save bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 flex justify-end md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                    <div className="max-w-2xl w-full mx-auto flex items-center justify-end gap-3">
                        {isDirty && (
                            <button
                                type="button"
                                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                onClick={() => setShowLeaveDialog(true)}
                            >
                                Discard changes
                            </button>
                        )}
                        <Button type="submit" disabled={isPending || isUploading} className="min-w-32 shadow-lg md:shadow-none">
                            {isPending ? <><Spinner /> Saving…</> : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Discard changes confirmation */}
            <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your changes to the profile and showcase sections have not been saved. This will reset everything back to the last saved state.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep editing</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => router.refresh()}
                        >
                            Discard changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}