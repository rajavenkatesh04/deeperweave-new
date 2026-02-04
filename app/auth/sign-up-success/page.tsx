import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Inbox, RefreshCw, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Check Your Inbox - DeeperWeave',
    description: 'Verify your email to continue.',
};

export default async function SignupSuccessPage({
                                                    searchParams,
                                                }: {
    searchParams: Promise<{ userEmail?: string }>;
}) {
    const params = await searchParams;

    const userEmail =
        params?.userEmail ?? "your registered email";
    return (
        <div className="container flex min-h-screen w-max mx-auto flex-col items-center justify-center py-10">
            <Card className="w-full max-w-lg border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 mb-4 ring-1 ring-primary/20">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Check your inbox</CardTitle>
                    <CardDescription className="text-base mt-2">
                        We&apos;ve sent a verification link to:
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">

                    {/* Email Display */}
                    <div className="p-3 text-center rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className="font-mono text-sm text-foreground break-all">
              {userEmail}
            </span>
                    </div>

                    {/* Steps List (Ported from your old design) */}
                    <div className="space-y-4">

                        {/* Step 1 */}
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold border border-zinc-200 dark:border-zinc-700">
                                1
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium leading-none">Click the link</h3>
                                <p className="text-xs text-muted-foreground">
                                    Open the email and click the confirmation button to activate your account.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-muted-foreground">
                                <Inbox className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium leading-none">Check spam</h3>
                                <p className="text-xs text-muted-foreground">
                                    If it&apos;s not in your inbox, check your spam or junk folder.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-4 items-start">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-muted-foreground">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium leading-none">Wait a moment</h3>
                                <p className="text-xs text-muted-foreground">
                                    It typically arrives instantly, but can take up to 2 minutes.
                                </p>
                            </div>
                        </div>

                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    <Button asChild variant="outline" className="w-full gap-2">
                        <Link href="/auth/login">
                            Return to Login <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        Wrong email address?{' '}
                        <Link href="/auth/sign-up" className="font-medium text-primary hover:underline underline-offset-4">
                            Try again
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}