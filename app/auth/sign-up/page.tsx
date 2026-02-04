import { Metadata } from 'next';
import { SignupForm } from './signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from "next/image";

export const metadata: Metadata = {
    title: 'Sign Up - DeeperWeave',
    description: 'Create your account to start tracking movies.',
};

export default function SignupPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col items-center space-y-3 text-center">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/icon1.png"
                            alt="DeeperWeave Logo"
                            width={50}
                            height={50}
                            className="rounded-lg"
                        />
                        <h1 className="text-2xl font-bold tracking-tight text-primary">
                            DeeperWeave
                        </h1>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Join the community of Cinephiles
                    </p>
                </div>

                <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Create an account</CardTitle>
                        <CardDescription>
                            Enter your email below to create your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SignupForm />
                    </CardContent>
                </Card>

                <p className="px-8 text-center text-sm text-muted-foreground">
                    By clicking continue, you agree to our{' '}
                    <a href="/policies/terms" className="underline underline-offset-4 hover:text-primary">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/policies/privacy" className="underline underline-offset-4 hover:text-primary">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}