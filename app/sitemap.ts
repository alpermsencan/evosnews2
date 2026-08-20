import type { MetadataRoute } from "next";
import { getCategories, getPublishedIndex } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

/** Sitemap içerikle birlikte tazelensin. */
export const revalidate = 3600;

const STATIC_PATHS = [
  { path: "", priority: 1, freq: "hourly" as const },
  { path: "araclar", priority: 0.9, freq: "daily" as const },
  { path: "sarj-agi", priority: 0.8, freq: "weekly" as const },
  { path: "sarj-fiyatlari", priority: 0.8, freq: "weekly" as const },
  { path: "ilanlar", priority: 0.9, freq: "daily" as const },
  { path: "karsilastir", priority: 0.6, freq: "monthly" as const },
  { path: "batarya-raporu", priority: 0.7, freq: "monthly" as const },
  { path: "finansman", priority: 0.7, freq: "monthly" as const },
  { path: "hakkinda", priority: 0.5, freq: "monthly" as const },
  { path: "iletisim", priority: 0.4, freq: "monthly" as const },
  { path: "pro", priority: 0.5, freq: "monthly" as const },
  { path: "fiyat-analizi", priority: 0.7, freq: "weekly" as const },
  { path: "otv-rehberi", priority: 0.7, freq: "monthly" as const },
  { path: "topluluk", priority: 0.6, freq: "daily" as const },
  { path: "arac-merkezi", priority: 0.6, freq: "weekly" as const },
  { path: "platform", priority: 0.4, freq: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const [articles, categories, vehicles] = await Promise.all([
    getPublishedIndex(2000),
    getCategories(),
    prisma.vehicle.findMany({ select: { slug: true, createdAt: true } }),
  ]);

  return [
    ...STATIC_PATHS.map((s) => ({
      url: `${base}/${s.path}`,
      lastModified: new Date(),
      changeFrequency: s.freq,
      priority: s.priority,
    })),
    ...categories.map((c) => ({
      url: `${base}/kategori/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${base}/haber/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...vehicles.map((v) => ({
      url: `${base}/araclar/${v.slug}`,
      lastModified: v.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
export const dynamic = "force-dynamic";
