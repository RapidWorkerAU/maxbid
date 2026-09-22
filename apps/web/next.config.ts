import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@maxbid/ui', '@maxbid/tokens', '@maxbid/content', '@maxbid/calc', '@maxbid/db'],
};

export default nextConfig;
