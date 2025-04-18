import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  }
};

// Add this to package.json scripts section:
// "dev": "NEXT_DISABLE_DEVFEEDBACK=1 next dev" for Unix/Mac or
// "dev": "set NEXT_DISABLE_DEVFEEDBACK=1 && next dev" for Windows

export default nextConfig;
