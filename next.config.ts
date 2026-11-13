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

  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(self)" },
      { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; script-src-attr 'none'" },
      ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
    ] }];
  },

  async redirects() {
    return [
      { source: "/istasyonlar", destination: "/sarj-agi", permanent: true },
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
