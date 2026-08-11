// OpenSloth — Root Layout
// T-805: Legal disclaimer in footer

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Fredoka, Quicksand } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { MomentProvider } from "@/components/moments/MomentProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OpenSloth — Cambridge B2 First Practice",
    template: "%s | OpenSloth",
  },
  description:
    "Practica el Cambridge B2 First con ejercicios con IA, tarjetas de vocabulario y exámenes simulacro.",
  openGraph: {
    title: "OpenSloth",
    description: "Plataforma de práctica del Cambridge B2 First",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fredoka.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <MomentProvider>
            <div className="flex-1">{children}</div>
            {/* Legal Disclaimer Footer */}
            <footer className="border-t py-6 mt-auto">
              <div className="container mx-auto px-4 text-center">
                <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  OpenSloth es una plataforma de práctica independiente y no está afiliada a, ni
                  respaldada por, ni conectada con Cambridge Assessment English o la Universidad de
                  Cambridge. &quot;B2 First&quot; y &quot;Cambridge English&quot; son marcas
                  registradas de Cambridge Assessment English. Todo el contenido de los exámenes
                  es original y se ha creado únicamente con fines de práctica. Las puntuaciones
                  estimadas son orientativas y no representan resultados oficiales de Cambridge
                  Assessment.
                </p>
              </div>
            </footer>
          </MomentProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
