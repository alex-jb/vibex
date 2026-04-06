import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LangProvider } from "@/lib/i18n";
import "nes.css/css/nes.min.css";
import "./globals.css";
import "./retro-game.css";
import "./nes-overrides.css";
import "./rpgui-dark.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeCode Hunt — AI-Native Launch Platform",
  description:
    "Discover, publish, and evolve playable AI-native vibe coding projects. The launch platform for the LLM era.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <LangProvider>
          <div className="scanline-overlay" aria-hidden="true" />
          <Navbar />
          <main className="flex-1 pt-16">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
