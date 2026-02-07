'use client';

import { Lock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Optional: If you want a CTA
import { motion } from "framer-motion";

export default function PrivateProfileScreen() {
    return (
        <div className="w-full min-h-[50vh] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <Card className="w-full max-w-md border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm">
                    <CardContent className="flex flex-col items-center text-center p-12 space-y-6">

                        {/* Icon Circle */}
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-2">
                            <Lock className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>

                        {/* Text Content */}
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                This account is private
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[260px] mx-auto leading-relaxed">
                                Follow this account to see their photos, videos, and stories.
                            </p>
                        </div>

                        {/* Optional: Simple Divider or Decorator */}
                        <div className="w-16 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}