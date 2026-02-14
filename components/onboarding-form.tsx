'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation'; // Added
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { checkUsernameAvailability, completeOnboarding } from '@/lib/actions/profile-actions';
import { createClient } from '@/lib/supabase/client'; // Added: Ensure this path exists
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { Loader2, CalendarIcon, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Types for steps
type Step = 'identity' | 'personal' | 'legal';
const STEPS: Step[] = ['identity', 'personal', 'legal'];

function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function OnboardingForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const supabase = createClient();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

    // 1. Username Logic
    const checkUsername = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // 2. Navigation Logic
    const nextStep = async () => {
        let fieldsToValidate: (keyof OnboardingInput)[] = [];

        if (currentStepIndex === 0) {
            fieldsToValidate = ['username', 'bio', 'gender'];
            if (usernameAvailable === false) return; // Block if taken
            if (usernameAvailable === null && form.getValues('username').length > 0) {
                // Force check if they typed but didn't wait
                const isAvail = await checkUsernameAvailability(form.getValues('username'));
                if(!isAvail) {
                    form.setError('username', { type: 'manual', message: 'Username is taken' });
                    return;
                }
            }
        } else if (currentStepIndex === 1) {
            fieldsToValidate = ['date_of_birth', 'country'];
        }

        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) {
            setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    };

    // 3. Submit Logic
    const onSubmit = (data: OnboardingInput) => {
        startTransition(async () => {
            const result = await completeOnboarding(data);

            if (result?.error) {
                toast.error(result.error);
            } else {
                // Success!
                // 1. Force refresh the session to get the new JWT with 'username' in app_metadata
                await supabase.auth.refreshSession();

                // 2. Refresh the Next.js router to update Server Components (like Navbar)
                router.refresh();

                toast.success('Welcome aboard!');

                // 3. Navigate to home
                router.push('/');
            }
        });
    };

    const progressValue = ((currentStepIndex + 1) / STEPS.length) * 100;

    return (
        <div className={cn("flex flex-col items-center justify-center w-full p-4", className)} {...props}>

            <Card className="w-full max-w-2xl shadow-lg border-muted/60">
                <CardHeader className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl font-bold">Set up your profile</CardTitle>
                            <CardDescription>Step {currentStepIndex + 1} of 3</CardDescription>
                        </div>
                        {/* Visual Progress Indicator */}
                        <div className="w-24 hidden sm:block">
                            <Progress value={progressValue} className="h-2" />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="min-h-[320px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* --- STEP 1: IDENTITY --- */}
                            {currentStepIndex === 0 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Username</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Create a handle"
                                                                {...field}
                                                                onChange={checkUsername}
                                                                className={cn(usernameAvailable === false && "border-destructive")}
                                                            />
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/> :
                                                                    usernameAvailable === true ? <Check className="h-4 w-4 text-emerald-600"/> :
                                                                        usernameAvailable === false ? <X className="h-4 w-4 text-destructive"/> : null}
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select gender" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="male">Male</SelectItem>
                                                            <SelectItem value="female">Female</SelectItem>
                                                            <SelectItem value="non-binary">Non-binary</SelectItem>
                                                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio <span className="text-muted-foreground text-xs font-normal">(Optional)</span></FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell the world a bit about yourself..."
                                                        className="resize-none h-24"
                                                        maxLength={160}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription className="text-xs text-right">
                                                    {(field.value || '').length}/160
                                                </FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {/* --- STEP 2: PERSONAL --- */}
                            {currentStepIndex === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="date_of_birth"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel>Date of birth</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <FormControl>
                                                                <Button
                                                                    variant={"outline"}
                                                                    className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                                                >
                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                </Button>
                                                            </FormControl>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="start">
                                                            <Calendar
                                                                mode="single"
                                                                selected={field.value}
                                                                onSelect={field.onChange}
                                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                                captionLayout="dropdown"
                                                                fromYear={1950}
                                                                toYear={new Date().getFullYear()}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select country" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {countries.map((c) => (
                                                                <SelectItem key={c['alpha-2']} value={c.name}>
                                                                    <span className="mr-2">{getFlagEmoji(c['alpha-2'])}</span>
                                                                    {c.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                                        <p className="text-sm text-muted-foreground">
                                            We use your age to ensure you see appropriate content and comply with local digital laws.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* --- STEP 3: LEGAL --- */}
                            {currentStepIndex === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <FormField
                                        control={form.control}
                                        name="content_preference"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Content Preference</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Content filter" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="sfw">Safe for Work (Standard)</SelectItem>
                                                        <SelectItem value="all">Unfiltered (18+)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription>
                                                    You can change this later in settings.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4 pt-4 border-t">
                                        <FormField
                                            control={form.control}
                                            name="is_over_18"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>I confirm I am 18 years or older</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="agree_to_terms"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>I agree to the <Link href="/terms" className="underline text-primary">Terms</Link> & <Link href="/privacy" className="underline text-primary">Privacy Policy</Link></FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {Object.keys(form.formState.errors).length > 0 && (
                                            <p className="text-sm font-medium text-destructive">Please check all fields before submitting.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="flex justify-between border-t p-6">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStepIndex === 0 || isPending}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {currentStepIndex === STEPS.length - 1 ? (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isPending}
                            className="min-w-[140px]"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Setup
                        </Button>
                    ) : (
                        <Button onClick={nextStep} className="min-w-[100px]">
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}