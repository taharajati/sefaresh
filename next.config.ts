import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      }
    ];
  },
  images: {
    domains: ['localhost'],
  }
};

// Add this to package.json scripts section:
// "dev": "NEXT_DISABLE_DEVFEEDBACK=1 next dev" for Unix/Mac or
// "dev": "set NEXT_DISABLE_DEVFEEDBACK=1 && next dev" for Windows

export default nextConfig;
