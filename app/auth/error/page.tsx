import Link from "next/link";
import { Metadata } from 'next'; // 1. Import Metadata

// 2. Export the metadata object
export const metadata: Metadata = {
    title: 'Error',
    description: 'Resume your session on DeeperWeave.',
};

export default async function Page({
                                       searchParams,
                                   }: {
    searchParams: Promise<{ error: string }>;
}) {
    const params = await searchParams;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-3">
                            <svg
                                className="w-12 h-12 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            We encountered an unexpected error
                        </p>
                    </div>

                    {/* Error Message */}
                    {params?.error ? (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-md p-4">
                            <p className="text-sm text-red-800 dark:text-red-300 font-mono break-all">
                                {params.error}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                An unspecified error occurred
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors duration-200 font-medium"
                        >
                            Go Back
                        </button>
                    <Link
                        href="/"
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 font-medium text-center"
                        >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
</div>
);
}