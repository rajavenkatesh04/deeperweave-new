'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validations/auth';
import { signupAction, signInWithGoogle } from '@/lib/actions/auth-actions';
import { Loader2, Mail } from 'lucide-react'; // Make sure you have lucide-react
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {GoogleButton} from "@/app/ui/auth/google-button";

export function SignupForm() {
    const [isPending, startTransition] = useTransition();

    const form = useForm<SignupInput>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(data: SignupInput) {
        startTransition(async () => {
            const result = await signupAction(data);
            if (result?.error) {
                toast.error(result.error);
            }
            // If success, the server action redirects us to /auth/sign-up-success
        });
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="neo@matrix.com"
                                        type="email"
                                        disabled={isPending}
                                        className="bg-background/50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Create a strong password"
                                        type="password"
                                        disabled={isPending}
                                        className="bg-background/50"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </Form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
                </div>
            </div>

            <GoogleButton />

            <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{' '}
                <Link href="/auth/login" className="hover:text-primary underline underline-offset-4">
                    Login
                </Link>
            </div>
        </div>
    );
}