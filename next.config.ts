import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  // Remove rewrites since we're using local API now
  webpack: (config, { isServer }) => {
    // We need this for better-sqlite3 to work with Next.js
    if (isServer) {
      config.externals = [...config.externals, 'better-sqlite3'];
    }
    return config;
  },
  images: {
    domains: ['localhost'],
  }
};

// Add this to package.json scripts section:
// "dev": "NEXT_DISABLE_DEVFEEDBACK=1 next dev" for Unix/Mac or
// "dev": "set NEXT_DISABLE_DEVFEEDBACK=1 && next dev" for Windows

export default nextConfig;
