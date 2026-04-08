import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/explore", destination: "/discover?tab=projects", permanent: true },
      { source: "/agents", destination: "/discover?tab=agents", permanent: true },
      { source: "/workflows", destination: "/discover?tab=workflows", permanent: true },
    ];
  },
};

export default nextConfig;
