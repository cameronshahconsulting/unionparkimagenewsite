import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async redirects() {
    // Preserve link equity from the old Squarespace URLs.
    const oldServicePaths = [
      "hardscaping",
      "drainage",
      "fencing",
      "yard-cleanups",
      "lawn-care",
    ];
    return [
      { source: "/unionparkhome", destination: "/home", permanent: true },
      { source: "/new-home", destination: "/home", permanent: true },
      ...oldServicePaths.map((p) => ({
        source: `/${p}`,
        destination: `/services/${p}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
