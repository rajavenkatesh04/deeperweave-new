'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import {signInWithEmail, LoginState, signInWithGoogle} from "@/lib/actions/auth-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner className="mr-2 size-4" />}
        Login
      </Button>
  )
}

export function LoginForm({
                            className,
                            ...props
                          }: React.ComponentProps<"div">) {

  const [state, formAction] = useActionState<LoginState, FormData>(
      signInWithEmail,
      { message: null }
  )

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your Google account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction}>
              <FieldGroup>

                {/* Google Button (you wire later) */}
                <Field>
                  <Button variant="outline" type="button" onClick={signInWithGoogle}>
                    Google
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>

                {/* Email */}
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                  />
                  {state.errors?.email && (
                      <FieldDescription className="text-red-500">
                        {state.errors.email[0]}
                      </FieldDescription>
                  )}
                </Field>

                {/* Password */}
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                  </div>
                  <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                  />
                  {state.errors?.password && (
                      <FieldDescription className="text-red-500">
                        {state.errors.password[0]}
                      </FieldDescription>
                  )}
                </Field>

                {/* Supabase error */}
                {state.message && (
                    <FieldDescription className="text-red-500 text-center">
                      {state.message}
                    </FieldDescription>
                )}

                <SubmitButton />

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up">Sign up</Link>
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
  )
}