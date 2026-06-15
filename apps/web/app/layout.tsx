import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ModeToggle } from "@countdown/ui/components/mode-toggle";
import { ThemeProvider } from "@countdown/ui/components/theme-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Countdown",
  description: "Countdown til vores næste festival",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="da"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <header className="flex items-center justify-end px-6 py-4">
            <ModeToggle />
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
