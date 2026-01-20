import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // NOTE: MONGODB_URI is NOT exposed here to prevent client-side leaks.
  // It's only accessed in server-side code (API routes, server components).
  
  // Enable standalone output for Docker deployment
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // Optimize for production
  reactStrictMode: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      // Production domains
      {
        protocol: 'https',
        hostname: 'socialsync.space',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.socialsync.space',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.marketpulse.com',
        pathname: '/**',
      },
      // Cloudflare R2 public bucket / custom domains
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
