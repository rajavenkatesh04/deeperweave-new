'use client'

import { useState, useTransition } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile, ContentPreference, ProfileVisibility } from '@/lib/definitions';
import { updateSettings, deleteAccount } from '@/lib/actions/settings-actions';
import Link from 'next/link';
import { toast } from 'sonner';
import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

// Shadcn Primitives
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Icons
import {
    ArrowLeft,
    Lock,
    EyeOff,
    TriangleAlert,
    ExternalLink,
    Trash2,
    Loader2,
    Download,
    Upload,
    KeyRound,
    ShieldCheck,
    ChevronRight,
    Sparkles
} from 'lucide-react';

// --- 1. CUSTOM UI COMPONENTS ---

interface ToggleRowProps {
    label: string;
    description?: string | React.ReactNode;
    icon: LucideIcon;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
    variant?: 'default' | 'danger' | 'brand';
}

function ToggleRow({
                       label,
                       description,
                       icon: Icon,
                       checked,
                       disabled = false,
                       onChange,
                       variant = 'default'
                   }: ToggleRowProps) {
    const isDanger = variant === 'danger';
    const isBrand = variant === 'brand';

    return (
        <div
            onClick={() => !disabled && onChange(!checked)}
            className={clsx(
                "flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 cursor-pointer group select-none",
                "bg-white dark:bg-zinc-950",
                (isDanger && checked) ? "border-red-200 dark:border-red-900/50 bg-red-50/10" :
                    (isBrand && checked) ? "border-blue-200 dark:border-blue-900/50 bg-blue-50/10" :
                        "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
                disabled && "opacity-60 cursor-not-allowed"
            )}>
            <div className="flex items-center gap-4 pr-4">
                <div className={clsx(
                    "p-2.5 rounded-xl transition-colors shrink-0",
                    (isDanger && checked) ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
                        (isBrand && checked) ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
                            "bg-zinc-50 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
                )}>
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                    <p className={clsx(
                        "text-sm font-bold transition-colors",
                        (isDanger && checked) ? "text-red-700 dark:text-red-400" :
                            (isBrand && checked) ? "text-blue-700 dark:text-blue-400" :
                                "text-zinc-900 dark:text-zinc-100"
                    )}>{label}</p>
                    {description && <div className={clsx(
                        "text-xs mt-0.5 leading-snug",
                        (isDanger && checked) ? "text-red-600/70 dark:text-red-400/60" :
                            (isBrand && checked) ? "text-blue-600/70 dark:text-blue-400/60" :
                                "text-zinc-500"
                    )}>{description}</div>}
                </div>
            </div>

            {/* Switch UI */}
            <div className="relative inline-flex items-center pointer-events-none">
                <div className={clsx(
                    "w-11 h-6 rounded-full transition-colors duration-300 ease-in-out",
                    checked
                        ? (isDanger ? "bg-red-600" : isBrand ? "bg-blue-600" : "bg-zinc-900 dark:bg-zinc-100")
                        : "bg-zinc-200 dark:bg-zinc-800",
                )}>
                    <div className={clsx(
                        "absolute top-[2px] left-[2px] bg-white rounded-full h-5 w-5 transition-transform shadow-sm",
                        checked && "translate-x-full",
                        (!isDanger && !isBrand && checked) && "dark:bg-zinc-900"
                    )} />
                </div>
            </div>
        </div>
    );
}

interface ActionRowProps {
    label: string;
    description?: string;
    icon: LucideIcon;
    onClick?: () => void;
    actionIcon?: LucideIcon;
    disabled?: boolean;
}

function ActionRow({
                       label,
                       description,
                       icon: Icon,
                       onClick,
                       actionIcon: ActionIcon = ChevronRight,
                       disabled = false
                   }: ActionRowProps) {
    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={clsx(
                "flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
                !disabled ? "cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 group" : "opacity-60 cursor-not-allowed"
            )}
        >
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300 transition-colors shrink-0">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{label}</p>
                    {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <ActionIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
        </div>
    );
}

// --- 2. MAIN COMPONENT ---

interface ProfileSettingsFormProps {
    user: User;
    profile: Profile;
}

export function ProfileSettingsForm({ user, profile }: ProfileSettingsFormProps) {
    const [isPending, startTransition] = useTransition();

    // ✅ FIXED: Proper typing with fallbacks
    const [preference, setPreference] = useState<ContentPreference>(
        profile.content_preference || user.app_metadata?.content_preference || 'sfw'
    );
    const [visibility, setVisibility] = useState<ProfileVisibility>(
        profile.visibility || 'public'
    );

    const isOver18 = profile.date_of_birth
        ? (new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() >= 18)
        : false;

    const trialEnds = profile.trial_until ? new Date(profile.trial_until) : null;
    const isTrialActive = trialEnds && trialEnds > new Date();

    const formattedBirthday = profile.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : 'Not set';

    const handleToggle = async (
        key: 'content_preference' | 'visibility',
        value: ContentPreference | ProfileVisibility
    ) => {
        // Optimistic Update
        if (key === 'content_preference') setPreference(value as ContentPreference);
        if (key === 'visibility') setVisibility(value as ProfileVisibility);

        startTransition(async () => {
            const result = await updateSettings({ [key]: value });
            if (result?.error) {
                toast.error(result.error);
                // Revert on error
                if (key === 'content_preference') setPreference(profile.content_preference || 'sfw');
                if (key === 'visibility') setVisibility(profile.visibility || 'public');
            } else {
                toast.success(`${key === 'content_preference' ? 'Content' : 'Visibility'} settings saved`);
            }
        });
    };

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteAccount();
            if (result?.error) toast.error(result.error);
        });
    };

    const handleFeatureComingSoon = () => {
        toast.info("Feature coming soon!", {
            description: "We are currently implementing data portability."
        });
    }

    return (
        <div className="w-full pb-20 relative z-10 max-w-3xl mx-auto md:px-6">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href={`/profile/${profile.username || user.app_metadata?.username}/home`}
                    className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-zinc-500" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Manage your archive preferences.</p>
                </div>
            </div>

            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                {/* --- 1. VISIBILITY --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Visibility</h3>
                    <ToggleRow
                        variant="brand"
                        label="Private Profile"
                        description="Only approved followers can see your logs."
                        icon={Lock}
                        checked={visibility === 'private'}
                        onChange={(checked) => handleToggle('visibility', checked ? 'private' : 'public')}
                    />
                </section>

                {/* --- 2. CONTENT --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Content</h3>
                    <ToggleRow
                        variant="danger"
                        label="Include NSFW Content"
                        description={
                            isOver18
                                ? "Allows explicit content like adult movies."
                                : <span className="flex items-center gap-1 text-zinc-400"><Lock className="w-3 h-3" /> Age verification (18+) required.</span>
                        }
                        icon={preference === 'all' ? TriangleAlert : EyeOff}
                        checked={preference === 'all'}
                        disabled={!isOver18 || isPending}
                        onChange={(checked) => handleToggle('content_preference', checked ? 'all' : 'sfw')}
                    />
                </section>

                {/* --- 3. SUBSCRIPTION --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Subscription</h3>
                    <Link href="/profile/subscriptions">
                        <div className="flex items-center justify-between p-4 border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md shrink-0 ring-1 ring-white/20">
                                    <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">{profile.tier || 'Free Plan'}</p>
                                        {isTrialActive && (
                                            <span className="text-[10px] bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase shadow-sm tracking-wide">Trial Active</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        {isTrialActive ? `Trial ends on ${trialEnds?.toLocaleDateString()}` : 'Manage billing and limits'}
                                    </p>
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                        </div>
                    </Link>
                </section>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* --- 4. IDENTITY --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Identity Parameter</h3>

                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Email</label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mt-1">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Gender</label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mt-1 capitalize">{profile.gender || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Birthday</label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mt-1">{formattedBirthday}</p>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Country</label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mt-1">{profile.country || 'Not set'}</p>
                            </div>
                        </div>
                    </div>

                    <p className="flex items-center gap-2 text-[10px] text-zinc-400 mt-3 px-1 font-medium">
                        <ShieldCheck className="w-3 h-3" />
                        Identity details are immutable. Contact admin for modification.
                    </p>
                </section>

                {/* --- 5. SECURITY --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Security</h3>
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-500">
                                <KeyRound className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Change Password</p>
                                <p className="text-xs text-zinc-500 mt-0.5 max-w-md leading-relaxed">
                                    To update your password, please <span className="font-semibold text-zinc-700 dark:text-zinc-300">log out</span> and click <span className="font-semibold text-zinc-700 dark:text-zinc-300">&quot;Forgot Password&quot;</span> on the login page.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 6. DATA MANAGEMENT --- */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 px-1">Data</h3>
                    <div className="space-y-3">
                        <ActionRow
                            label="Export Data"
                            description="Download a copy of your reviews and lists."
                            icon={Download}
                            onClick={handleFeatureComingSoon}
                        />
                        <ActionRow
                            label="Import Data"
                            description="Import your history from Letterboxd or IMDb."
                            icon={Upload}
                            onClick={handleFeatureComingSoon}
                        />
                    </div>
                </section>

                {/* --- 7. DANGER ZONE --- */}
                <section className="pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-red-500/80 mb-4 px-1">Danger Zone</h3>

                    <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <p className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <TriangleAlert className="w-4 h-4" />
                                    Account Deletion
                                </p>
                                <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-1 leading-relaxed max-w-md">
                                    Permanently erase your profile, timeline entries, and all collected data. This action is irreversible.
                                </p>
                            </div>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button
                                    disabled={isPending}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-transparent border border-red-200 dark:border-red-900/50 hover:bg-red-600 hover:border-red-600 hover:text-white dark:hover:bg-red-600 text-red-600 dark:text-red-500 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    Delete Account
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete your account
                                        and remove your data from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </section>

            </div>
        </div>
    );
}