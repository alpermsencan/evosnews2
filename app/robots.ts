import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Yönetim, API ve kişisel alanlar dizine girmemeli.
        disallow: [
          "/admin",
          "/api/",
          "/hesabim",
          "/bildirimler",
          "/arkadaslar",
          "/giris",
          "/kayit",
          "/ara",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
