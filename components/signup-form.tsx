'use client'

import { useActionState } from 'react';
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
import { signUpNewUser, SignUpState } from '@/lib/actions/auth-actions';
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="" />}
        Create Account
      </Button>
  );
}

export function SignupForm({
                             className,
                             ...props
                           }: React.ComponentProps<"div">) {

  const [state, formAction] = useActionState<SignUpState, FormData>(
      signUpNewUser,
      { message: null }
  );

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className={`text-xl`}>Create your account</CardTitle>
            <CardDescription>
              Enter your email below to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction}>
              <FieldGroup>

                {/* Full Name */}
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input id="fullName" name="fullName" />
                  {state.errors?.fullName && (
                      <FieldDescription className="text-red-500">
                        {state.errors.fullName[0]}
                      </FieldDescription>
                  )}
                </Field>

                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" name="email" type="email" />
                  {state.errors?.email && (
                      <FieldDescription className="text-red-500">
                        {state.errors.email[0]}
                      </FieldDescription>
                  )}
                </Field>

                {/* Passwords */}
                <Field className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" name="password" type="password" />
                    {state.errors?.password && (
                        <FieldDescription className="text-red-500">
                          {state.errors.password[0]}
                        </FieldDescription>
                    )}
                  </div>

                  <div>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirmPassword" name="confirmPassword" type="password" />
                    {state.errors?.confirmPassword && (
                        <FieldDescription className="text-red-500">
                          {state.errors.confirmPassword[0]}
                        </FieldDescription>
                    )}
                  </div>
                </Field>

                {/* Supabase error */}
                {state.message && (
                    <FieldDescription className="text-red-500 text-center">
                      {state.message}
                    </FieldDescription>
                )}

                <SubmitButton />

                <FieldDescription className="text-center">
                  Already have an account? <Link href="/auth/login">Sign in</Link>
                </FieldDescription>

              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <Link href="/policies/terms">Terms</Link> and{" "}
          <Link href="/policies/privacy">Privacy</Link>.
        </FieldDescription>
      </div>
  );
}