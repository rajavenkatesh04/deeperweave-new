'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { checkUsernameAvailability, completeOnboarding } from '@/lib/actions/profile-actions';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, Check, X, ArrowRight, ArrowLeft,
    CalendarIcon, User, Globe, Shield, Lock,
    ChevronLeftIcon, ChevronRightIcon, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// --- HELPERS ---

function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

// --- DATE PICKER ---
function ModernDatePicker({ value, onChange, error }: { value: Date | undefined, onChange: (date: Date) => void, error?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'days' | 'months' | 'years'>('days');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [viewDate, setViewDate] = useState(() => value || new Date(new Date().getFullYear() - 18, 0, 1));

    useEffect(() => {
        if (value) setViewDate(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setView('days');
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const handleSelectDay = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(newDate);
        setIsOpen(false);
    };

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "group flex items-center justify-between w-full h-12 border-b border-zinc-200 dark:border-zinc-800 bg-transparent px-0 text-sm cursor-pointer transition-colors hover:border-zinc-900 dark:hover:border-zinc-100",
                    error && "border-red-500 dark:border-red-500"
                )}
            >
                <span className={cn("text-base", value ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400")}>
                    {value ? format(value, "PPP") : "Select Date"}
                </span>
                <CalendarIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 mt-2 z-[70] p-4 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm shadow-xl flex flex-col max-h-[400px]"
                    >
                        <div className="flex items-center justify-between mb-4 border-b border-zinc-100 dark:border-zinc-800 pb-2 shrink-0">
                            {view === 'days' ? (
                                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm text-zinc-600 dark:text-zinc-400">
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                            ) : <div className="w-6" />}

                            <div className="flex gap-2">
                                <button type="button" onClick={() => setView('months')} className="text-xs font-bold uppercase tracking-wider px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm text-zinc-900 dark:text-zinc-100">
                                    {monthNames[viewDate.getMonth()]}
                                </button>
                                <button type="button" onClick={() => setView('years')} className="text-xs font-bold uppercase tracking-wider px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm text-zinc-900 dark:text-zinc-100">
                                    {viewDate.getFullYear()}
                                </button>
                            </div>

                            {view === 'days' ? (
                                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-sm text-zinc-600 dark:text-zinc-400">
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            ) : <div className="w-6" />}
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 min-h-[240px]">
                            {view === 'days' && (
                                <>
                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                            <span key={d} className="text-[9px] uppercase font-bold text-zinc-400">{d}</span>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                                        {Array.from({ length: daysInMonth }).map((_, i) => {
                                            const day = i + 1;
                                            const currentDayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                            const isSelected = value && value.toDateString() === currentDayDate.toDateString();
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => handleSelectDay(day)}
                                                    className={cn(
                                                        "h-8 w-8 text-xs flex items-center justify-center transition-all rounded-sm",
                                                        isSelected
                                                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black font-bold"
                                                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                    )}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {view === 'months' && (
                                <div className="grid grid-cols-3 gap-3">
                                    {monthNames.map((month, i) => (
                                        <button key={month} type="button" onClick={() => { setViewDate(new Date(viewDate.getFullYear(), i, 1)); setView('days'); }} className={cn("py-3 text-xs font-medium rounded-sm border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400")}>
                                            {month}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {view === 'years' && (
                                <div className="grid grid-cols-3 gap-2">
                                    {years.map(year => (
                                        <button key={year} type="button" onClick={() => { setViewDate(new Date(year, viewDate.getMonth(), 1)); setView('days'); }} className={cn("py-2 text-xs rounded-sm border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400")}>
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- MAIN FORM ---

interface OnboardingFormProps {
    userName: string;
    avatar: string | null;
}

export function OnboardingForm({ userName, avatar }: OnboardingFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const firstName = userName.split(' ')[0];
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            username: '',
            bio: '',
            gender: undefined,
            country: '',
            content_preference: 'sfw',
            visibility: 'public' as const,
            is_over_18: false,
            agree_to_terms: false,
            understood_privacy: false,
        },
        mode: 'onChange',
    });

    useEffect(() => {
        if (!form.getValues('country')) {
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data && data.country_code) {
                        const countryObj = countries.find(c => c['alpha-2'] === data.country_code);
                        if (countryObj) {
                            form.setValue('country', countryObj.name, { shouldValidate: true });
                        }
                    }
                })
                .catch(err => console.error("Auto-location failed", err));
        }
    }, [form]);

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        form.setValue('username', value);

        const cleaned = value.trim().toLowerCase();
        if (cleaned.length < 3) {
            setUsernameAvailable(null);
            return;
        }

        setIsCheckingUsername(true);
        const isAvailable = await checkUsernameAvailability(cleaned);
        setIsCheckingUsername(false);
        setUsernameAvailable(isAvailable);

        if (!isAvailable) {
            form.setError('username', { type: 'manual', message: 'Username is taken' });
        } else {
            form.clearErrors('username');
        }
    };

    const nextStep = async () => {
        let fieldsToValidate: (keyof OnboardingInput)[] = [];

        if (step === 1) {
            fieldsToValidate = ['username', 'bio', 'gender'];
            if (usernameAvailable === false) return;
            const currentUsername = form.getValues('username');
            if (usernameAvailable === null && currentUsername.length > 0) {
                const isAvail = await checkUsernameAvailability(currentUsername);
                if (!isAvail) {
                    form.setError('username', { type: 'manual', message: 'Username is taken' });
                    return;
                }
            }
        } else if (step === 2) {
            fieldsToValidate = ['date_of_birth', 'country'];
        }

        const isValid = await form.trigger(fieldsToValidate);

        if (isValid) {
            setDirection(1);
            setStep((prev) => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const onSubmit = (data: OnboardingInput) => {
        startTransition(async () => {
            const result = await completeOnboarding(data);

            if (result?.error) {
                toast.error(result.error);
            } else {
                await supabase.auth.refreshSession();
                router.push(
                    `/scenes/welcome?first=${encodeURIComponent(firstName)}&username=${encodeURIComponent(data.username)}`
                );
            }
        });
    };

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 20 : -20, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 20 : -20, opacity: 0 }),
    };

    const ErrorMessage = ({ message }: { message?: string }) => {
        if (!message) return null;
        return (
            <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wide flex items-center gap-1"
            >
                <AlertCircle className="w-3 h-3" /> {message}
            </motion.p>
        );
    };

    const visibilityValue = form.watch('visibility');
    const contentPref = form.watch('content_preference');
    const understoodPrivacy = form.watch('understood_privacy');
    const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);

    const stepMeta = {
        1: { label: 'Your Profile', heading: 'Set up your profile', sub: 'Pick a username and tell us a bit about yourself.' },
        2: { label: 'About You', heading: 'A little more about you', sub: 'Just a few details to personalise your experience.' },
        3: { label: 'Preferences', heading: 'Almost there', sub: 'Choose your settings and confirm — then you\'re in.' },
    } as const;

    const leftPanelMeta = {
        1: { title: 'Your Profile', icon: <User className="w-10 h-10 text-zinc-400" /> },
        2: { title: 'Your World', icon: <Globe className="w-10 h-10 text-zinc-400" /> },
        3: { title: "You're all set", icon: <Shield className="w-10 h-10 text-zinc-400" /> },
    } as const;

    return (
        <div className="min-h-svh flex flex-col md:items-center md:justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative">
            {/* Subtle dot pattern — light */}
            <div
                className="dark:hidden absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d4d4d8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />
            {/* Subtle dot pattern — dark */}
            <div
                className="hidden dark:block absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                }}
            />

            {/* ── Mobile header (avatar + greeting + step dots) ── */}
            <div className="md:hidden relative z-10 flex items-center justify-between px-5 pt-12 pb-5">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800 shrink-0">
                        <AvatarImage src={avatar ?? undefined} alt={firstName} />
                        <AvatarFallback className="text-xs font-semibold bg-zinc-100 dark:bg-zinc-800">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-[11px] text-zinc-500 font-medium leading-none mb-0.5">Hey, {firstName}!</p>
                        <p className="text-sm font-semibold leading-none">Profile Setup</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={cn(
                                    "h-1 w-5 rounded-full transition-all duration-500",
                                    s <= step ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{step}/3</span>
                </div>
            </div>

            {/* ── Card (full-screen on mobile, centered 2-col card on desktop) ── */}
            <div className="relative z-10 w-full flex-1 flex flex-col md:flex-none md:max-w-5xl md:grid md:grid-cols-2 bg-white dark:bg-black md:border border-zinc-200 dark:border-zinc-800 md:shadow-2xl md:min-h-[600px] md:overflow-hidden md:rounded-sm mx-0 md:mx-4">

                {/* ── Left panel — desktop only ── */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-800 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className="absolute inset-0 bg-linear-to-tr from-black via-zinc-900 to-zinc-800 opacity-90" />

                    <div className="relative z-10 text-center space-y-8 max-w-xs">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl shadow-zinc-900/50"
                            >
                                {leftPanelMeta[step as 1|2|3].icon}
                            </motion.div>
                        </AnimatePresence>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 justify-center">
                                <Avatar className="h-7 w-7 border border-white/20 shrink-0">
                                    <AvatarImage src={avatar ?? undefined} alt={firstName} />
                                    <AvatarFallback className="text-[10px] font-semibold bg-white/10 text-white">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium text-zinc-400">Hi, {firstName}!</span>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.h2
                                    key={step}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-3xl font-bold text-white tracking-tight"
                                >
                                    {leftPanelMeta[step as 1|2|3].title}
                                </motion.h2>
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "h-1 rounded-full transition-all duration-500",
                                        s === step ? "w-6 bg-white" : "w-3 bg-white/20"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Form side ── */}
                <div className="flex flex-col flex-1 md:h-full relative bg-white dark:bg-black">
                    {/* Desktop step indicator */}
                    <div className="hidden md:flex absolute top-0 left-0 w-full p-6 justify-between items-center z-10">
                        <div className="flex gap-1.5 w-1/3">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={cn(
                                        "h-1 flex-1 rounded-sm transition-all duration-500",
                                        s <= step ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Step 0{step} / 03</div>
                    </div>

                    <div className="flex-1 flex flex-col px-5 md:px-12 pt-4 md:pt-24 pb-6 md:pb-8 justify-center">
                        <div className="mb-6 md:mb-8">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                    {stepMeta[step as 1|2|3].label}
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                                {stepMeta[step as 1|2|3].heading}
                            </h1>
                            <p className="text-xs text-zinc-400 mt-1">{stepMeta[step as 1|2|3].sub}</p>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 flex-1">
                            <div className="min-h-[200px] md:min-h-[240px]">
                                <AnimatePresence custom={direction} mode="wait">
                                    <motion.div
                                        key={step}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        {/* STEP 1 */}
                                        {step === 1 && (
                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Username</label>
                                                    <div className="relative group">
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 font-medium group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors">@</span>
                                                        <input
                                                            {...form.register('username')}
                                                            onChange={handleUsernameChange}
                                                            placeholder="username"
                                                            className={cn(
                                                                "block w-full h-12 border-b border-zinc-200 bg-transparent pl-5 pr-8 text-base focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700",
                                                                form.formState.errors.username && "border-red-500 dark:border-red-500 text-red-600 dark:text-red-400"
                                                            )}
                                                            autoFocus
                                                        />
                                                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                                            {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> :
                                                                usernameAvailable === true ? <Check className="h-4 w-4 text-emerald-500" /> :
                                                                    usernameAvailable === false ? <X className="h-4 w-4 text-red-500" /> : null}
                                                        </div>
                                                    </div>
                                                    <ErrorMessage message={form.formState.errors.username?.message} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gender</label>
                                                    <select
                                                        {...form.register('gender')}
                                                        className={cn(
                                                            "block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100",
                                                            form.formState.errors.gender && "border-red-500 dark:border-red-500"
                                                        )}
                                                    >
                                                        <option value="" disabled className="bg-white dark:bg-zinc-950 text-zinc-400">Select option</option>
                                                        <option value="male" className="bg-white dark:bg-zinc-950">Male</option>
                                                        <option value="female" className="bg-white dark:bg-zinc-950">Female</option>
                                                        <option value="non-binary" className="bg-white dark:bg-zinc-950">Non-binary</option>
                                                        <option value="prefer_not_to_say" className="bg-white dark:bg-zinc-950">Prefer not to say</option>
                                                    </select>
                                                    <ErrorMessage message={form.formState.errors.gender?.message} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                                                    <textarea
                                                        {...form.register('bio')}
                                                        maxLength={160}
                                                        placeholder="A short intro about yourself..."
                                                        className="block w-full h-20 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 2 */}
                                        {step === 2 && (
                                            <div className="space-y-7">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date of Birth</label>
                                                    <ModernDatePicker
                                                        value={form.watch('date_of_birth')}
                                                        onChange={(date) => form.setValue('date_of_birth', date, { shouldValidate: true })}
                                                        error={!!form.formState.errors.date_of_birth}
                                                    />
                                                    <ErrorMessage message={form.formState.errors.date_of_birth?.message} />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Country</label>
                                                    <div className="relative">
                                                        <select
                                                            {...form.register('country')}
                                                            className={cn(
                                                                "block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100",
                                                                form.formState.errors.country && "border-red-500 dark:border-red-500"
                                                            )}
                                                        >
                                                            <option value="" disabled className="bg-white dark:bg-zinc-950 text-zinc-400">Select Country</option>
                                                            {countries.map((c) => (
                                                                <option key={c['alpha-2']} value={c.name} className="bg-white dark:bg-zinc-950">
                                                                    {getFlagEmoji(c['alpha-2'])} {c.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <Globe className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                                                    </div>
                                                    <ErrorMessage message={form.formState.errors.country?.message} />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 3 */}
                                        {step === 3 && (
                                            <div className="space-y-5">
                                                {/* Visibility toggle */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                                            {visibilityValue === 'public' ? <><Globe className="inline w-3 h-3 mr-1 mb-0.5" />Public profile</> : <><Lock className="inline w-3 h-3 mr-1 mb-0.5" />Private profile</>}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                                            {visibilityValue === 'public' ? 'Anyone can view your profile' : 'Only approved followers can see your content'}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        role="switch"
                                                        aria-checked={visibilityValue === 'private'}
                                                        onClick={() => form.setValue('visibility', visibilityValue === 'public' ? 'private' : 'public', { shouldValidate: true })}
                                                        className={cn(
                                                            "relative ml-4 inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
                                                            visibilityValue === 'private'
                                                                ? "bg-zinc-900 dark:bg-zinc-100"
                                                                : "bg-zinc-200 dark:bg-zinc-700"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-zinc-900 shadow-sm ring-0 transition-transform duration-200",
                                                            visibilityValue === 'private' ? "translate-x-5" : "translate-x-0"
                                                        )} />
                                                    </button>
                                                </div>

                                                {/* Content filter pill toggle */}
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Content Filter</p>
                                                    <div className="flex gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-sm p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => form.setValue('content_preference', 'sfw', { shouldValidate: true })}
                                                            className={cn(
                                                                "flex-1 h-8 text-xs font-bold rounded-sm transition-all",
                                                                contentPref === 'sfw'
                                                                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                                                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                                            )}
                                                        >
                                                            SFW
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => form.setValue('content_preference', 'all', { shouldValidate: true })}
                                                            className={cn(
                                                                "flex-1 h-8 text-xs font-bold rounded-sm transition-all",
                                                                contentPref === 'all'
                                                                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                                                                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                                            )}
                                                        >
                                                            NSFW (18+)
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* 3 checkboxes */}
                                                <div className={cn(
                                                    "space-y-3.5",
                                                    (form.formState.errors.is_over_18 || form.formState.errors.agree_to_terms || form.formState.errors.understood_privacy) && ""
                                                )}>
                                                    <div className="flex items-start gap-3">
                                                        <input type="checkbox" {...form.register('is_over_18')} id="over18" className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" />
                                                        <label htmlFor="over18" className="text-xs text-zinc-600 dark:text-zinc-400 font-medium cursor-pointer leading-relaxed">
                                                            I confirm I am 18 years or older.
                                                        </label>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <input type="checkbox" {...form.register('agree_to_terms')} id="terms" className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-100 cursor-pointer" />
                                                        <label htmlFor="terms" className="text-xs text-zinc-600 dark:text-zinc-400 font-medium cursor-pointer leading-relaxed">
                                                            I agree to the{' '}
                                                            <Link href="/policies/terms" className="underline text-zinc-900 dark:text-zinc-100">Terms</Link>
                                                            {' '}&{' '}
                                                            <Link href="/policies/privacy" className="underline text-zinc-900 dark:text-zinc-100">Privacy Policy</Link>.
                                                        </label>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <input
                                                            type="checkbox"
                                                            id="understood_privacy"
                                                            checked={understoodPrivacy}
                                                            readOnly
                                                            onClick={() => { if (!understoodPrivacy) setShowPrivacyPopup(true); else form.setValue('understood_privacy', false); }}
                                                            className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border-zinc-300 dark:border-zinc-600 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                                                        />
                                                        <label
                                                            htmlFor="understood_privacy"
                                                            className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed"
                                                        >
                                                            I&apos;ve read how DeeperWeave handles my data.{' '}
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPrivacyPopup(true)}
                                                                className="underline text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
                                                            >
                                                                Read more →
                                                            </button>
                                                        </label>
                                                    </div>
                                                </div>

                                                {(form.formState.errors.is_over_18 || form.formState.errors.agree_to_terms || form.formState.errors.understood_privacy) && (
                                                    <ErrorMessage message="Please complete all three to continue." />
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-4 items-center mt-auto pt-2">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={step === 1 || isPending}
                                    className="h-10 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-0 flex items-center gap-1"
                                >
                                    <ArrowLeft className="h-3 w-3" /> Back
                                </button>

                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={step === 1 && (usernameAvailable === false || form.watch('username').length < 3)}
                                        className="ml-auto px-6 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                    >
                                        Continue <ArrowRight className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="ml-auto px-8 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
                                    >
                                        {isPending ? <><Loader2 className="h-3 w-3 animate-spin" /> Processing</> : 'Get Started'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ── Privacy popup ── */}
            <Dialog open={showPrivacyPopup} onOpenChange={setShowPrivacyPopup}>
                <DialogContent className="sm:max-w-sm" showCloseButton={true}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                            You&apos;re in control.
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed pt-1">
                            Your data is yours — always. You can request a full export or delete your account at any time, no questions asked. We don&apos;t sell it, we don&apos;t profit from it, and we never will. No hidden trackers, no fine print. Just a product that genuinely respects you.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            className="w-full"
                            onClick={() => {
                                form.setValue('understood_privacy', true, { shouldValidate: true });
                                setShowPrivacyPopup(false);
                            }}
                        >
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
