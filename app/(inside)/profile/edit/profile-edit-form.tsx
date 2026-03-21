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
    const [leaveMode, setLeaveMode] = useState<'back' | 'discard'>('discard');
    const markDirty = useCallback(() => setIsDirty(true), []);
    const popstateHandlerRef = useRef<(() => void) | null>(null);

    // Warn on browser tab close / refresh
    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    // Intercept the back button when dirty
    useEffect(() => {
        if (!isDirty) return;

        // Push a guard history entry so the first back press hits it, not the previous page
        history.pushState(null, '');

        const handler = () => {
            // Re-push to keep us in place, then show the dialog
            history.pushState(null, '');
            setLeaveMode('back');
            setShowLeaveDialog(true);
        };

        popstateHandlerRef.current = handler;
        window.addEventListener('popstate', handler);
        return () => {
            window.removeEventListener('popstate', handler);
            popstateHandlerRef.current = null;
        };
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
            <Card className="overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900" />
                <CardContent className="pt-0 pb-6 px-6">
                    <div className="flex items-end justify-between -mt-10 mb-5">
                        <div className="relative group">
                            <div
                                className="h-20 w-20 rounded-2xl overflow-hidden border-4 border-background bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-md cursor-pointer"
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
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
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors rounded-xl">
                                    {isUploading
                                        ? <Spinner className="text-white" />
                                        : <Upload className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    }
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="mb-1">
                            {isUploading ? 'Uploading…' : 'Change Photo'}
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Profile photo</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG or WebP · Max 5 MB · Recommended 400 × 400 px</p>
                    </div>
                </CardContent>
            </Card>

            {/* Profile fields + sections in one form */}
            <form onSubmit={handleSubmit} onChange={markDirty}>
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>This information will be displayed publicly on your profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-sm font-medium">Display Name</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    defaultValue={profile.full_name || ''}
                                    placeholder="Your display name"
                                    required
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium select-none">@</span>
                                    <Input
                                        id="username"
                                        name="username"
                                        defaultValue={profile.username || ''}
                                        className="pl-7 h-10"
                                        placeholder="username"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                                <span className="text-xs text-muted-foreground">Max 160 characters</span>
                            </div>
                            <Textarea
                                id="bio"
                                name="bio"
                                defaultValue={profile.bio || ''}
                                placeholder="Tell the world what you're watching…"
                                className="resize-none h-28"
                                maxLength={160}
                            />
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

                {/* Fixed save bar — sits above the mobile bottom nav (h-16 = 64px) */}
                <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t z-[200] md:static md:bottom-auto md:bg-transparent md:backdrop-blur-none md:border-0 md:p-0 md:mt-8">
                    <div className="max-w-2xl w-full mx-auto flex items-center justify-end gap-3">
                        {isDirty && (
                            <button
                                type="button"
                                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                                onClick={() => { setLeaveMode('discard'); setShowLeaveDialog(true); }}
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
                            onClick={() => {
                                if (leaveMode === 'back') {
                                    // Remove the popstate guard then go back 2 steps
                                    // (past the re-pushed guard + the original guard = reach previous page)
                                    if (popstateHandlerRef.current) {
                                        window.removeEventListener('popstate', popstateHandlerRef.current);
                                        popstateHandlerRef.current = null;
                                    }
                                    setIsDirty(false);
                                    history.go(-2);
                                } else {
                                    // Discard button — just reload the page to reset all state
                                    router.refresh();
                                }
                            }}
                        >
                            Discard changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}