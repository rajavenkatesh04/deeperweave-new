'use client'

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Field, FieldDescription, FieldGroup, FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
// Make sure to import signInWithGoogle here
import { signUpNewUser, SignUpState, signInWithGoogle } from '@/lib/actions/auth-actions';
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="mr-2 size-4 animate-spin" />}
        Create Account
      </Button>
  );
}

export function SignupForm({
                             className,
                             ...props
                           }: React.ComponentProps<"div">) {

  // 1. Local state for Google loading
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 2. Server Action Hook
  const [state, formAction] = useActionState<SignUpState, FormData>(
      signUpNewUser,
      { message: null }
  );

  // 3. Handler for Google Login
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await signInWithGoogle();
  };

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className={`text-xl`}>Create your account</CardTitle>
            <CardDescription>
              Sign up with Google or enter your details below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction}>
              <FieldGroup>

                {/* --- GOOGLE BUTTON START --- */}
                <div className="flex flex-col gap-4">
                  <Button
                      variant="outline"
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isGoogleLoading}
                      className="w-full"
                  >
                    {isGoogleLoading ? (
                        <>
                          <Spinner className="mr-2 size-4 animate-spin" />
                          Connecting...
                        </>
                    ) : (
                        <>
                          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                          Continue with Google
                        </>
                    )}
                  </Button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-950 px-2 text-zinc-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                {/* --- GOOGLE BUTTON END --- */}

                {/* Full Name */}
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input id="fullName" name="fullName" placeholder="John Doe" />
                  {state.errors?.fullName && (
                      <FieldDescription className="text-red-500 text-sm mt-1">
                        {state.errors.fullName[0]}
                      </FieldDescription>
                  )}
                </Field>

                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" />
                  {state.errors?.email && (
                      <FieldDescription className="text-red-500 text-sm mt-1">
                        {state.errors.email[0]}
                      </FieldDescription>
                  )}
                </Field>

                {/* Passwords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" name="password" type="password" />
                    {state.errors?.password && (
                        <FieldDescription className="text-red-500 text-sm mt-1">
                          {state.errors.password[0]}
                        </FieldDescription>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirmPassword" name="confirmPassword" type="password" />
                    {state.errors?.confirmPassword && (
                        <FieldDescription className="text-red-500 text-sm mt-1">
                          {state.errors.confirmPassword[0]}
                        </FieldDescription>
                    )}
                  </Field>
                </div>

                {/* General Error Message */}
                {state.message && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-md">
                      <p className="text-red-600 dark:text-red-400 text-sm text-center">
                        {state.message}
                      </p>
                    </div>
                )}

                <SubmitButton />

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 hover:text-primary">
                    Sign in
                  </Link>
                </div>

              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/policies/terms" className="underline underline-offset-4 hover:text-primary">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/policies/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy
          </Link>
          .
        </div>
      </div>
  );
}