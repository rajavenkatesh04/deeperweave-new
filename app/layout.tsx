import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import {ModeToggle} from "@/components/mode-toggle";
import {interFont} from "@/app/ui/shared/fonts";
import Providers from "@/app/providers";
import {Toaster} from "sonner";

export const metadata: Metadata = {
    title: {
        template: '%s | DeeperWeave',
        default: 'DeeperWeave',
    },
    description: 'Track Movies, Write blogs, Discover Content.',
    metadataBase: new URL('https://DeeperWeave.com/'),
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interFont.className} antialiased `}>
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          {/*<ModeToggle />*/}
          <Providers>{children}</Providers>
          <Toaster position="top-right" />
      </ThemeProvider>
      </body>
    </html>
  );
}
