import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from "next/image";

export const metadata: Metadata = {
    title: 'Login - DeeperWeave',
    description: 'Login to your account',
};

export default function LoginPage() {
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
                        Enter your email below to login to your account
                    </p>
                </div>

                <Card className="border-border/40 bg-card/50 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Welcome back</CardTitle>
                        <CardDescription>
                            Login to access your watchlist and reviews
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>

                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link href="/auth/sign-up" className="hover:text-brand underline underline-offset-4">
                        Don&apos;t have an account? Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}