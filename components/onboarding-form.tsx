'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, OnboardingInput } from '@/lib/validations/onboarding';
import { checkUsernameAvailability, completeOnboarding } from '@/lib/actions/profile-actions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { countries } from '@/lib/countries';
import { Loader2, CalendarIcon, Check, X } from 'lucide-react';
import Link from 'next/link';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

// Utility for flags
function getFlagEmoji(countryCode: string) {
    if (!countryCode) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

export function OnboardingForm({ className, ...props }: React.ComponentProps<"div">) {
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [isPending, startTransition] = useTransition();

    const form = useForm<OnboardingInput>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            username: '',
            bio: '',
            country: '',
            content_preference: 'sfw',
            is_over_18: false,
            agree_to_terms: false,
        },
        mode: 'onChange',
    });

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

    const onSubmit = (data: OnboardingInput) => {
        startTransition(async () => {
            const result = await completeOnboarding(data);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Profile setup completed');
            }
        });
    };

    return (
        <div className={cn("flex flex-col gap-6 w-full max-w-md", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Complete your profile</CardTitle>
                    <CardDescription>
                        Tell us a little more about yourself
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">

                            {/* Username */}
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="username"
                                                    {...field}
                                                    onChange={checkUsername}
                                                    className={cn(
                                                        usernameAvailable === false && "border-destructive focus-visible:ring-destructive"
                                                    )}
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    {isCheckingUsername ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : usernameAvailable === true ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : usernameAvailable === false ? (
                                                        <X className="h-4 w-4 text-destructive" />
                                                    ) : null}
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Bio */}
                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bio <span className="text-muted-foreground font-normal">(Optional)</span></FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Brief description"
                                                className="resize-none min-h-[80px]"
                                                maxLength={160}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                {/* Date of Birth */}
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
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        captionLayout="dropdown"
                                                        fromYear={1950}
                                                        toYear={new Date().getFullYear()}
                                                        initialFocus
                                                        className="rounded-lg border shadow-md"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Country */}
                                <FormField
                                    control={form.control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
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

                            {/* Content Preference */}
                            <FormField
                                control={form.control}
                                name="content_preference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preference</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Content filter" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sfw">Safe for Work</SelectItem>
                                                <SelectItem value="all">Unfiltered (18+)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Checkboxes Group */}
                            <div className="space-y-3 pt-2">
                                <FormField
                                    control={form.control}
                                    name="is_over_18"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-normal">
                                                    I am 18 years or older
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="agree_to_terms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel className="text-sm font-normal">
                                                    I agree to the terms
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-2"
                                disabled={isPending || !usernameAvailable}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Setup
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground px-6">
                By clicking Complete Setup, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-primary">Terms</Link> and{" "}
                <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </div>
        </div>
    );
}