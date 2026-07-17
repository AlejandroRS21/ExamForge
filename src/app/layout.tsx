// ExamForge — Root Layout
// T-805: Legal disclaimer in footer

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamForge — B2 First Practice Platform",
  description:
    "Prepare for the Cambridge B2 First (FCE) exam with realistic practice tests, AI-powered feedback, and progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <div className="flex-1">{children}</div>
          {/* Legal Disclaimer Footer */}
          <footer className="border-t py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                ExamForge is an independent practice platform and is not affiliated with,
                endorsed by, or connected to Cambridge Assessment English or the University
                of Cambridge. &quot;B2 First&quot; and &quot;Cambridge English&quot; are
                registered trademarks of Cambridge Assessment English. All exam content
                is original and created for practice purposes only. Estimated scores are
                indicative and do not represent official Cambridge Assessment results.
              </p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
