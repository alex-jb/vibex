import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Geist, Geist_Mono, Press_Start_2P, VT323, Silkscreen, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LangProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { ObservabilityInit } from "@/components/observability-init";
import { MainWrapper } from "@/components/main-wrapper";
import { MotionProvider } from "@/components/motion-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
// nes.css is now imported inside globals.css with `layer(base)` so that
// Tailwind utilities (display, spacing, etc.) can override its HTML5 reset.
// Unlayered CSS wins over layered rules regardless of specificity — without
// the layer wrap, `hidden` / `md:hidden` silently fail on <nav>, <section>,
// <article>, <aside>, <footer>, <header>, <main>, <figure>, <hgroup>.
import "./globals.css";
import "./retro-game.css";
import "./nes-overrides.css";
import "./rpgui-dark.css";

// Lazy-load non-critical floating widgets — don't block initial render
const ChatWidget = dynamic(() => import("@/components/chat-widget").then((m) => ({ default: m.ChatWidget })));
const TutorialOverlay = dynamic(() => import("@/components/onboarding/tutorial-overlay").then((m) => ({ default: m.TutorialOverlay })));
const ServiceWorkerRegister = dynamic(() => import("@/components/sw-register").then((m) => ({ default: m.ServiceWorkerRegister })));
const NotificationToastProvider = dynamic(() => import("@/components/notification-toast").then((m) => ({ default: m.NotificationToastProvider })));
const PwaInstallPrompt = dynamic(() => import("@/components/pwa-install-prompt").then((m) => ({ default: m.PwaInstallPrompt })));
const RefCapture = dynamic(() => import("@/components/ref-capture").then((m) => ({ default: m.RefCapture })));

// Only preload the 3 fonts rendered above the fold on `/` (the entry
// route most crawlers hit): Press Start 2P, VT323, Silkscreen. Sans and
// Mono still load — just without the <link rel="preload"> hint — so any
// downstream page that needs them still gets them, but we stop competing
// with the hero image for the preload budget on cold visits.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
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

// Silkscreen — dedicated UI pixel font for 8–14px sizes where Press Start 2P blurs.
// Per DESIGN.md 2026-04-14 typography update (codedex-inspired readability pass).
const silkscreen = Silkscreen({
  weight: ["400", "700"],
  variable: "--font-silkscreen",
  subsets: ["latin"],
});

// Cormorant Garamond — eulogy / ritual moments on /funeral surfaces only.
// Per docs/specs/2026-06-14-funeral-visual-upgrade-spec.md. NOT for chrome
// or body — reserved for the deceased name H1, eulogy body, and benediction.
// Loaded with preload:false because no above-fold use outside /funeral.
const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eulogy",
  subsets: ["latin"],
  display: "swap",
  preload: false,
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

// Canonical host is www — apex 307-redirects here. Previously metadataBase
// pointed to the apex, which meant every canonical + OG URL advertised the
// redirected host, costing each crawl one extra hop.
export const metadata: Metadata = {
  metadataBase: new URL("https://www.vibexforge.com"),
  title: "VibeXForge — AI-Native Launch Platform",
  description:
    "Discover, publish, and evolve playable AI-native vibe coding projects. The launch platform for the LLM era.",
  manifest: "/manifest.json",
  // OG image is auto-resolved from app/opengraph-image.tsx (Next.js convention).
  // Don't hardcode `images` here — it would override the dynamic render.
  openGraph: {
    title: "VibeXForge — Forge Your AI Hero",
    description:
      "Every AI project is a collectible hero. Paste a URL, forge a card, get real feedback, evolve with real traction.",
    siteName: "VibeXForge",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeXForge — Forge Your AI Hero",
    description:
      "Every AI project is a collectible hero. Paste a URL, forge a card, get real feedback, evolve with real traction.",
  },
  // Root canonical is the bare apex. Child routes can (and should)
  // override this via their own metadata.alternates.canonical so each
  // page advertises the correct URL — otherwise every subpage would
  // advertise "/" and search engines wouldn't index them individually.
  alternates: {
    canonical: "/",
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
      className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable} ${silkscreen.variable} ${zpix.variable} ${cormorant.variable} dark h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Structured data as @graph so Organization + WebSite are reusable
            via @id from per-page schema on project/creator/about routes.
            Primary name is "VibeXForge" (2026-04-21 rebrand) with
            `alternateName` preserving the old "VibeX" + "VibeX Forge"
            variants so the entity stays linkable. The `sameAs` array +
            unique compound name disambiguate us from the crowded "VibeX"
            namespace: `vibe-x.app` (same-name vibe-coding platform),
            `VibeX 2026` (EASE 2026 academic workshop, conf.researchr.org),
            `tiwater/vibex`, `dustland/vibex`, `sethdford/vibex-*` GitHub
            projects, and VibeX Ventures. Update social URLs as channels go live. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.vibexforge.com/#org",
                  name: "VibeXForge",
                  alternateName: ["VibeX", "VibeX Forge"],
                  url: "https://www.vibexforge.com",
                  logo: "https://www.vibexforge.com/generated/logo-vibex.png",
                  description:
                    "Distribution amplifier for solo AI creators. Submit your AI project once and get 17 platform-native posts in 10 seconds, ready to publish to X, Reddit, Hacker News, Dev.to, LinkedIn, Bluesky, Threads, Xiaohongshu, Jike, Zhihu, and Bilibili. Bilingual EN ↔ ZH built in. Free during beta.",
                  foundingDate: "2026-04-13",
                  founder: { "@id": "https://www.vibexforge.com/#founder" },
                  sameAs: [
                    "https://github.com/alex-jb/vibex",
                  ],
                },
                {
                  "@type": "Person",
                  "@id": "https://www.vibexforge.com/#founder",
                  name: "Alex (alex-jb)",
                  url: "https://github.com/alex-jb",
                  jobTitle: "Founder",
                  worksFor: { "@id": "https://www.vibexforge.com/#org" },
                  description:
                    "Solo indie AI creator. Built VibeXForge after shipping a personal AI gallery for 6 months and only reaching 5 users — the bottleneck was distribution, not the product.",
                  sameAs: [
                    "https://github.com/alex-jb",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.vibexforge.com/#website",
                  url: "https://www.vibexforge.com",
                  name: "VibeXForge",
                  alternateName: ["VibeX", "VibeX Forge"],
                  publisher: { "@id": "https://www.vibexforge.com/#org" },
                  inLanguage: ["en", "zh-CN"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target:
                      "https://www.vibexforge.com/home?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                  // Google Assistant / AI voice surfaces pull from
                  // `speakable` — they read aloud the matched CSS
                  // regions when answering voice queries about the
                  // page. Keeps the synthesis focused on the hero
                  // tagline + the FAQ answers rather than nav chrome.
                  speakable: {
                    "@type": "SpeakableSpecification",
                    cssSelector: ["h1", ".tagline", ".faq-answer"],
                  },
                },
                {
                  "@type": "SoftwareApplication",
                  name: "VibeXForge",
                  alternateName: ["VibeX", "VibeX Forge"],
                  url: "https://www.vibexforge.com",
                  applicationCategory: "DeveloperApplication",
                  operatingSystem: "Web",
                  publisher: { "@id": "https://www.vibexforge.com/#org" },
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ObservabilityInit />
        <AuthProvider>
          <AnalyticsProvider>
          <LangProvider>
            <MotionProvider>
              <div className="scanline-overlay" aria-hidden="true" />
              <Navbar />
              <MainWrapper>{children}</MainWrapper>
              <Footer />
              <MobileBottomNav />
              <ChatWidget />
              <TutorialOverlay />
              <NotificationToastProvider />
              <PwaInstallPrompt />
              <ServiceWorkerRegister />
              <RefCapture />
            </MotionProvider>
          </LangProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
