/**
 * Pricing tiers and feature gates for VibeX Pro.
 */

export type PricingTier = "free" | "pro";

export interface TierFeature {
  name: string;
  free: boolean;
  pro: boolean;
  description: string;
}

export const FEATURES: TierFeature[] = [
  { name: "basic_positioning", free: true, pro: true, description: "Basic product positioning" },
  { name: "title_generation", free: true, pro: true, description: "Title & tagline suggestions" },
  { name: "full_launch_package", free: false, pro: true, description: "Complete launch package (copy, social, distribution)" },
  { name: "competitor_analysis", free: false, pro: true, description: "Competitor comparison & differentiation" },
  { name: "investor_pitch", free: false, pro: true, description: "Investor pitch generation" },
  { name: "distribution_strategy", free: false, pro: true, description: "Distribution channel strategy" },
  { name: "trend_deep_report", free: false, pro: true, description: "Deep trend intelligence reports" },
  { name: "growth_suggestions", free: false, pro: true, description: "AI-powered growth suggestions" },
  { name: "project_analytics", free: true, pro: true, description: "Basic project analytics" },
  { name: "analytics_ai_insights", free: false, pro: true, description: "AI-powered analytics insights" },
];

export const PRICING = {
  free: { name: "Free", price: 0, priceLabel: "$0", period: "" },
  pro: { name: "Pro", price: 29, priceLabel: "$29", period: "/month" },
} as const;

export function isProFeature(featureName: string): boolean {
  const feature = FEATURES.find((f) => f.name === featureName);
  return feature ? !feature.free : false;
}

export function getFeatureAccess(tier: PricingTier, featureName: string): boolean {
  const feature = FEATURES.find((f) => f.name === featureName);
  if (!feature) return false;
  return tier === "pro" ? feature.pro : feature.free;
}
