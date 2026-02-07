'use client';

import { useState } from 'react';
import { logout } from '@/lib/actions/auth-actions';
import { Loader2, LogOut } from 'lucide-react'; // Shadcn standard icons
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignOutButtonProps {
    children: React.ReactNode;
    className?: string;
}

export default function SignOutButton({ children, className }: SignOutButtonProps) {
    const [open, setOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* The Trigger: We use 'asChild' to merge behavior onto your custom button design
        passed from the UserProfile component.
      */}
            <DialogTrigger asChild>
                <button className={className} type="button">
                    {children}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] gap-6">
                <DialogHeader className="flex flex-col items-center text-center gap-2">
                    {/* Icon Circle */}
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-2">
                        <LogOut className="h-6 w-6 text-red-600 dark:text-red-500" />
                    </div>

                    <DialogTitle className="text-xl">Sign out</DialogTitle>
                    <DialogDescription className="text-center">
                        Are you sure? You will need to log in again to access your library.
                    </DialogDescription>
                </DialogHeader>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1 h-11" disabled={isSigningOut}>
                            Cancel
                        </Button>
                    </DialogClose>

                    <form
                        action={logout}
                        className="flex-1"
                        onSubmit={() => setIsSigningOut(true)}
                    >
                        <Button
                            type="submit"
                            variant="destructive"
                            className="w-full h-11"
                            disabled={isSigningOut}
                        >
                            {isSigningOut ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing out...
                                </>
                            ) : (
                                "Confirm Sign Out"
                            )}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}