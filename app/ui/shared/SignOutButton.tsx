'use client';

import { useState, useTransition } from 'react';
import { logout } from '@/lib/actions/auth-actions';
import { Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {Spinner} from "@/components/ui/spinner";

interface SignOutButtonProps {
    children: React.ReactNode;
    className?: string;
}

export default function SignOutButton({ children, className }: SignOutButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent the dialog from closing immediately
        e.preventDefault();

        startTransition(async () => {
            await logout();
            // The dialog will close automatically when the page redirects/refreshes
            // or we can manually close it here if needed: setOpen(false)
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <button type="button" className={className}>
                    {children}
                </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure? You will need to log in again to access your library.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleSignOut}
                        disabled={isPending}
                        className={buttonVariants({ variant: "destructive" })}
                    >
                        {isPending ? (
                            <>
                                <Spinner />
                            </>
                        ) : (
                            "Sign out"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}