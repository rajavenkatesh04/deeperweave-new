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
    CalendarIcon, User, Globe, Shield,
    ChevronLeftIcon, ChevronRightIcon, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// --- HELPERS ---

function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

function getLocalDateString(date: Date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- RESTORED MODERN DATE PICKER ---
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
                        {/* Header */}
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

                        {/* Body */}
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

export function OnboardingForm() {
    const router = useRouter();
    const supabase = createClient();

    // State
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
            is_over_18: false,
            agree_to_terms: false,
        },
        mode: 'onChange',
    });

    // --- CHEAP & FAST GEO-LOCATION (Client Side) ---
    useEffect(() => {
        // Only fetch if country is empty
        if (!form.getValues('country')) {
            // Using ipapi.co (Free tier: 1000 requests/day, no API key needed)
            fetch('https://ipapi.co/json/')
                .then(res => res.json())
                .then(data => {
                    if (data && data.country_code) {
                        // Your select uses "Full Name" (e.g., "United States"), but API gives "US"
                        // Find the country object that matches the code
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
                if(!isAvail) {
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
                router.refresh();
                const nameToPass = encodeURIComponent(data.username);
                router.push(`/?welcome=true&name=${nameToPass}`);
            }
        });
    };

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 20 : -20, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d < 0 ? 20 : -20, opacity: 0 }),
    };

    // Helper for error messages
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">

            <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 shadow-2xl min-h-[600px] relative overflow-hidden rounded-sm mx-4">

                {/* --- VISUAL SIDE (Left) --- */}
                <div className="hidden md:flex flex-col items-center justify-center bg-zinc-950 text-white p-12 border-r border-zinc-800 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 opacity-90" />

                    <div className="relative z-10 text-center space-y-8 max-w-xs">
                        <div className="mx-auto w-24 h-24 flex items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl shadow-zinc-900/50">
                            {step === 1 && <User className="w-10 h-10 text-zinc-400" />}
                            {step === 2 && <Globe className="w-10 h-10 text-zinc-400" />}
                            {step === 3 && <Shield className="w-10 h-10 text-zinc-400" />}
                        </div>
                        <div className="space-y-3">
                            <div className="inline-block px-2 py-1 border border-zinc-700 rounded-sm">
                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">System_Init_v1.0</p>
                            </div>
                            <h2 className="text-3xl font-bold text-white tracking-tight">
                                {step === 1 && "Identify."}
                                {step === 2 && "Locate."}
                                {step === 3 && "Authorize."}
                            </h2>
                        </div>
                    </div>
                </div>

                {/* --- FORM SIDE (Right) --- */}
                <div className="flex flex-col h-full relative bg-white dark:bg-black">
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                        <div className="flex gap-1.5 w-1/3">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={cn("h-1 flex-1 rounded-sm transition-all duration-500", s <= step ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-200 dark:bg-zinc-800")} />
                            ))}
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Step 0{step} / 03</div>
                    </div>

                    <div className="flex-1 flex flex-col px-8 md:px-12 pt-24 pb-8 justify-center">
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-2 mb-3">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                    {step === 1 ? "Identity" : step === 2 ? "Demographics" : "Legal"}
                                </span>
                            </div>
                            <h1 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                                {step === 1 && "Who are you?"}
                                {step === 2 && "The details."}
                                {step === 3 && "Confirm & Launch."}
                            </h1>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8 flex-1">
                            <div className="min-h-[220px]">
                                <AnimatePresence custom={direction} mode="wait">
                                    <motion.div key={step} custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>

                                        {/* STEP 1: IDENTITY */}
                                        {step === 1 && (
                                            <div className="space-y-6">
                                                {/* Username */}
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
                                                            {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400"/> :
                                                                usernameAvailable === true ? <Check className="h-4 w-4 text-emerald-500"/> :
                                                                    usernameAvailable === false ? <X className="h-4 w-4 text-red-500"/> : null}
                                                        </div>
                                                    </div>
                                                    <ErrorMessage message={form.formState.errors.username?.message} />
                                                </div>

                                                {/* Gender */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Gender</label>
                                                    <select
                                                        {...form.register('gender')}
                                                        className={cn(
                                                            "block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100",
                                                            form.formState.errors.gender && "border-red-500 dark:border-red-500"
                                                        )}
                                                    >
                                                        <option value="" disabled className="bg-white dark:bg-zinc-950 text-zinc-400">Select Identity</option>
                                                        <option value="male" className="bg-white dark:bg-zinc-950">Male</option>
                                                        <option value="female" className="bg-white dark:bg-zinc-950">Female</option>
                                                        <option value="non-binary" className="bg-white dark:bg-zinc-950">Non-binary</option>
                                                        <option value="prefer_not_to_say" className="bg-white dark:bg-zinc-950">Prefer not to say</option>
                                                    </select>
                                                    <ErrorMessage message={form.formState.errors.gender?.message} />
                                                </div>

                                                {/* Bio */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                                                    <textarea
                                                        {...form.register('bio')}
                                                        maxLength={160}
                                                        placeholder="Tell your story..."
                                                        className="block w-full h-20 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors resize-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 2: PERSONAL */}
                                        {step === 2 && (
                                            <div className="space-y-8">
                                                {/* DOB */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Date of Birth</label>
                                                    <ModernDatePicker
                                                        value={form.watch('date_of_birth')}
                                                        onChange={(date) => form.setValue('date_of_birth', date, { shouldValidate: true })}
                                                        error={!!form.formState.errors.date_of_birth}
                                                    />
                                                    <ErrorMessage message={form.formState.errors.date_of_birth?.message} />
                                                </div>

                                                {/* Country */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Region</label>
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
                                                        <Globe className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none"/>
                                                    </div>
                                                    <ErrorMessage message={form.formState.errors.country?.message} />
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 3: LEGAL */}
                                        {step === 3 && (
                                            <div className="space-y-6">
                                                {/* Content Filter */}
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Content Filter</label>
                                                    <select
                                                        {...form.register('content_preference')}
                                                        className="block w-full h-12 border-b border-zinc-200 bg-transparent px-0 text-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-800 dark:focus:border-zinc-100 transition-colors cursor-pointer appearance-none text-zinc-900 dark:text-zinc-100"
                                                    >
                                                        <option value="sfw" className="bg-white dark:bg-zinc-950">Safe for Work (Standard)</option>
                                                        <option value="all" className="bg-white dark:bg-zinc-950">Unfiltered (18+)</option>
                                                    </select>
                                                </div>

                                                <div className={cn(
                                                    "p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-sm space-y-4",
                                                    (form.formState.errors.is_over_18 || form.formState.errors.agree_to_terms) && "border-red-200 dark:border-red-900/30 bg-red-50/10"
                                                )}>
                                                    <div className="flex items-start gap-3">
                                                        <input type="checkbox" {...form.register('is_over_18')} id="over18" className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-800" />
                                                        <label htmlFor="over18" className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">I confirm I am 18 years or older.</label>
                                                    </div>

                                                    <div className="flex items-start gap-3">
                                                        <input type="checkbox" {...form.register('agree_to_terms')} id="terms" className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:bg-zinc-800" />
                                                        <label htmlFor="terms" className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                                                            I agree to the <Link href="/terms" className="underline text-zinc-900 dark:text-zinc-100">Terms</Link> & <Link href="/privacy" className="underline text-zinc-900 dark:text-zinc-100">Privacy Policy</Link>.
                                                        </label>
                                                    </div>
                                                </div>

                                                {(form.formState.errors.is_over_18 || form.formState.errors.agree_to_terms) && (
                                                    <ErrorMessage message="You must accept the terms and confirm your age." />
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="flex gap-4 items-center mt-auto">
                                <button type="button" onClick={prevStep} disabled={step === 1 || isPending} className="h-10 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors disabled:opacity-0 flex items-center gap-1">
                                    <ArrowLeft className="h-3 w-3" /> Back
                                </button>
                                {step < 3 ? (
                                    <button type="button" onClick={nextStep} disabled={step === 1 && (usernameAvailable === false || form.watch('username').length < 3)} className="ml-auto px-6 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                        Next Step <ArrowRight className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={isPending} className="ml-auto px-8 h-10 bg-zinc-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2">
                                        {isPending ? <><Loader2 className="h-3 w-3 animate-spin"/> Processing</> : "Complete Setup"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}