import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Inbox, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
    title: "Check Your Inbox - DeeperWeave",
    description: "Verify your email to continue.",
};

export default async function SignupSuccessPage({
                                                    searchParams,
                                                }: {
    searchParams: Promise<{ userEmail?: string }>;
}) {
    const params = await searchParams;
    const userEmail = params?.userEmail ?? "your registered email";

    return (
        <div className="flex min-h-svh items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-3">
                    <Mail className="mx-auto size-10 text-primary" />
                    <CardTitle>Check your inbox</CardTitle>
                    <CardDescription>
                        We&apos;ve sent a verification link to
                    </CardDescription>

                    <div className="rounded-md bg-muted px-3 py-2 text-sm font-mono break-all">
                        {userEmail}
                    </div>
                </CardHeader>

                <Separator />

                <CardContent className="space-y-5 pt-6">
                    <Step
                        icon={<Mail className="size-4" />}
                        title="Click the link"
                        desc="Open the email and confirm your account."
                    />
                    <Step
                        icon={<Inbox className="size-4" />}
                        title="Check spam"
                        desc="Look in spam or junk if it’s not in your inbox."
                    />
                    <Step
                        icon={<RefreshCw className="size-4" />}
                        title="Give it a minute"
                        desc="It usually arrives instantly, but can take up to 2 minutes."
                    />
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-center py-4 text-sm text-muted-foreground">
                    Wrong email?{" "}
                    <Link href="/auth/sign-up" className="ml-1 text-primary underline-offset-4 hover:underline">
                        Try again
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

function Step({
                  icon,
                  title,
                  desc,
              }: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
        </div>
    );
}