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
      {
        source: "/voice-intelligence",
        destination: "/arac-merkezi",
        permanent: true,
      },
      {
        source: "/ai-danisman",
        destination: "/arac-merkezi",
        permanent: true,
      },
      {
        source: "/otv-rehberi",
        destination: "/araclar",
        permanent: true,
      },
      {
        source: "/tasarruf-hesapla",
        destination: "/araclar",
        permanent: true,
      },
      {
        source: "/finansman",
        destination: "/araclar",
        permanent: true,
      },
      {
        source: "/evos-protect",
        destination: "/batarya-raporu",
        permanent: true,
      },
      {
        source: "/sarj-fiyatlari",
        destination: "/sarj-agi",
        permanent: true,
      },
      {
        source: "/karsilastir",
        destination: "/araclar",
        permanent: true,
      },
      {
        source: "/karsilastirma/:path*",
        destination: "/araclar",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
