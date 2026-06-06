/**
 * /predictions JSON-LD — Article + BreadcrumbList + SpeakableSpecification.
 *
 * The Article schema is what AI Overviews / Perplexity / ChatGPT picks up to
 * decide whether to cite the page when someone asks "where can I get
 * brier-audited AI sports picks". Breadcrumb keeps Google happy.
 * SpeakableSpecification helps voice assistants surface the hero summary.
 */

const SITE_URL = "https://www.vibexforge.com";

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": `${SITE_URL}/predictions#article`,
      url: `${SITE_URL}/predictions`,
      headline: "AI-quant predictions across NBA, World Cup, SpaceX, Polymarket — Brier-audited",
      description:
        "Daily AI-quant picks across NBA Finals, 2026 FIFA World Cup, 8 SpaceX pure-play tickers, and top Polymarket events. Every forecast is Brier-scored against the closing line so visitors can see whether the system is beating the market and beating coin flip.",
      datePublished: "2026-06-07",
      dateModified: new Date().toISOString().slice(0, 10),
      author: {
        "@type": "Person",
        "@id": `${SITE_URL}/#founder`,
        name: "alex-jb",
        url: "https://github.com/alex-jb",
      },
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: "VibeXForge",
        url: SITE_URL,
      },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: [
        { "@type": "Thing", name: "NBA Finals predictions" },
        { "@type": "Thing", name: "2026 FIFA World Cup predictions" },
        { "@type": "Thing", name: "SpaceX pure-play stock picks" },
        { "@type": "Thing", name: "Polymarket mispricing flags" },
        { "@type": "Thing", name: "Brier-score calibration" },
      ],
      keywords:
        "AI predictions, sports betting model, NBA Finals 2026, FIFA World Cup 2026, Polymarket, SpaceX IPO, RKLB, ASTS, Brier score, calibrated forecasts, solo founder AI, indie quant",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/predictions#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "VibeXForge",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Predictions",
          item: `${SITE_URL}/predictions`,
        },
      ],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/predictions`,
      url: `${SITE_URL}/predictions`,
      name: "Predictions — AI-quant picks, Brier-audited",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      primaryImageOfPage: { "@id": `${SITE_URL}/predictions/opengraph-image` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", "h2", "header p"],
      },
    },
    {
      "@type": "Dataset",
      "@id": `${SITE_URL}/predictions#dataset`,
      name: "VibeXForge daily AI-quant predictions",
      description:
        "Daily JSONL of sports / Polymarket / SpaceX ticker predictions with Brier-scored settlement once the closing line is known. Updated every weekday at 12:00 ET.",
      license: "https://opensource.org/licenses/MIT",
      isAccessibleForFree: true,
      creator: {
        "@type": "Person",
        name: "alex-jb",
        url: "https://github.com/alex-jb",
      },
      distribution: [
        {
          "@type": "DataDownload",
          encodingFormat: "application/x-ndjson",
          contentUrl:
            "https://raw.githubusercontent.com/alex-jb/spacex-ipo-tracker/main/briefs/",
        },
      ],
    },
  ],
};

export default function PredictionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
      {children}
    </>
  );
}
