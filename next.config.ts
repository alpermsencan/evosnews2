import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: true,
    remotePatterns: [
      // Panelden yüklenen görseller.
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async redirects() {
    return [
      // Voice Intelligence, AI Danışman sayfasıyla birleşti (sesli asistan bölümü).
      {
        source: "/voice-intelligence",
        destination: "/ai-danisman#sesli-asistan",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
