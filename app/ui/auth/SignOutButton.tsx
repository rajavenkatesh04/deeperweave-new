'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PowerIcon } from '@heroicons/react/24/outline';
import { logout } from '@/lib/actions/auth-actions';
import LoadingSpinner from '@/app/ui/loading-spinner';
import clsx from 'clsx';
import { geistSans } from '@/app/ui/fonts';

export default function SignOutButton({
                                          children,
                                          className
                                      }: {
    children: React.ReactNode;
    className?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    return (
        <>
            {/* The Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={className}
            >
                {children}
            </button>

            {/* The Confirmation Modal */}
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className={clsx("relative z-[100]", geistSans.className)}
                    onClose={() => !isSigningOut && setIsOpen(false)}
                >
                    {/* Backdrop */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    {/* Modal Position */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-xs transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 text-left align-middle shadow-xl transition-all">

                                    <div className="flex flex-col items-center gap-4 text-center">
                                        {/* Icon */}
                                        <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-500">
                                            <PowerIcon className="h-5 w-5" strokeWidth={2} />
                                        </div>

                                        {/* Text */}
                                        <div className="space-y-1">
                                            <Dialog.Title as="h3" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                                Sign out
                                            </Dialog.Title>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                Are you sure? You will need to log in again to access your library.
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 w-full mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsOpen(false)}
                                                disabled={isSigningOut}
                                                className="flex-1 h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>

                                            <form
                                                action={logout}
                                                className="flex-1"
                                                onSubmit={() => setIsSigningOut(true)}
                                            >
                                                <button
                                                    type="submit"
                                                    disabled={isSigningOut}
                                                    className="w-full h-10 flex items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {isSigningOut ? (
                                                        <LoadingSpinner className="text-white w-4 h-4" />
                                                    ) : (
                                                        "Confirm"
                                                    )}
                                                </button>
                                            </form>
                                        </div>
                                    </div>

                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
}