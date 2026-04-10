import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono, Press_Start_2P, VT323 } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LangProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { MainWrapper } from "@/components/main-wrapper";
import "nes.css/css/nes.min.css";
import "./globals.css";
import "./retro-game.css";
import "./nes-overrides.css";
import "./rpgui-dark.css";

// Lazy-load non-critical floating widgets — don't block initial render
const ChatWidget = dynamic(() => import("@/components/chat-widget").then((m) => ({ default: m.ChatWidget })));
const TutorialOverlay = dynamic(() => import("@/components/onboarding/tutorial-overlay").then((m) => ({ default: m.TutorialOverlay })));
const ServiceWorkerRegister = dynamic(() => import("@/components/sw-register").then((m) => ({ default: m.ServiceWorkerRegister })));
const NotificationToastProvider = dynamic(() => import("@/components/notification-toast").then((m) => ({ default: m.NotificationToastProvider })));

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

const zpix = localFont({
  src: "../public/fonts/zpix.ttf",
  variable: "--font-zpix",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vibexforge.com"),
  title: "VibeX — AI-Native Launch Platform",
  description:
    "Discover, publish, and evolve playable AI-native vibe coding projects. The launch platform for the LLM era.",
  manifest: "/manifest.json",
  openGraph: {
    title: "VibeX — AI-Native Launch Platform",
    description: "Discover, publish, and evolve playable AI-native vibe coding projects.",
    siteName: "VibeX",
    type: "website",
    locale: "en_US",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeX — AI-Native Launch Platform",
    description: "Discover, publish, and evolve playable AI-native vibe coding projects.",
  },
  alternates: {
    canonical: "https://vibexforge.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable} ${zpix.variable} dark h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "VibeX",
              url: "https://vibexforge.com",
              description: "The launch and growth platform for AI-native creators. Discover, publish, and grow AI projects.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: "VibeX",
                url: "https://vibexforge.com",
              },
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <AuthProvider>
          <AnalyticsProvider>
          <LangProvider>
            <div className="scanline-overlay" aria-hidden="true" />
            <Navbar />
            <MainWrapper>{children}</MainWrapper>
            <Footer />
            <ChatWidget />
            <TutorialOverlay />
            <NotificationToastProvider />
            <ServiceWorkerRegister />
          </LangProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
