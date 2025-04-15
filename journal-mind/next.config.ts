import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'wzbmulnanmuxuwimjemv.supabase.co', // Your Supabase domain
      'avatars.githubusercontent.com',     // For testing with GitHub avatars if needed
      'random.imagecdn.app',              // For testing with random images if needed
    ],
  },
};

export default nextConfig;
