import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Panelden yüklenen görseller.
      { protocol: "https", hostname: "res.cloudinary.com" },
      // Haber görselleri ingest sırasında kaynağın og:image adresinden gelir ve
      // her zaman `imageCredit` ile atıf alır. Kaynak listesi panelden
      // genişletilebildiği için host kümesi önceden bilinemez; bu yüzden
      // https üzerinden gelen her host'a izin verilir. Yükleme yalnızca
      // Next'in görsel optimizasyon katmanı üzerinden yapılır, sayfaya
      // rastgele betik girmez.
      { protocol: "https", hostname: "**" },
    ],
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
