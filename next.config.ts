import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
