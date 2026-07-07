import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      { source: "/unionparkhome", destination: "/", permanent: true },
      { source: "/new-home", destination: "/", permanent: true },
      ...oldServicePaths.map((p) => ({
        source: `/${p}`,
        destination: `/services/${p}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
