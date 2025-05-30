import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'usdenxghfkajwtbxsdgj.supabase.co',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
