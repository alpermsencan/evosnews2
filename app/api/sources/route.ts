import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { runSource } from "@/lib/ingest/runner";
import { touch } from "@/lib/revalidate";
import { TAGS } from "@/lib/cache";
import type { CacheTag } from "@/lib/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TAGS_BY_KIND: Record<string, CacheTag[]> = {
  news: [TAGS.articles],
  stations: [TAGS.stations],
  fx: [TAGS.tickers],
  prices: [TAGS.prices, TAGS.tickers],
};

/**
 * Kaynak ayarlarını günceller ve elle çalıştırmayı sağlar.
 * Yetki kontrolü middleware'de (/api/sources admin'e kapalı).
 *
 * PUT  { id, isActive?, autoPublish?, categorySlug?, keywords?, endpoint? }
 * POST { key }  → kaynağı hemen çalıştır
 */
export async function PUT(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.id) return fail("id zorunludur");

    const source = await prisma.dataSource.update({
      where: { id: b.id },
      data: {
        ...(b.isActive !== undefined && { isActive: !!b.isActive }),
        ...(b.autoPublish !== undefined && { autoPublish: !!b.autoPublish }),
        ...(b.categorySlug !== undefined && { categorySlug: b.categorySlug || null }),
        ...(b.endpoint !== undefined && { endpoint: b.endpoint || null }),
        ...(b.keywords !== undefined && {
          keywords: String(b.keywords)
            .split(",")
            .map((k: string) => k.trim())
            .filter(Boolean),
        }),
      },
    });

    return ok({ source });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    if (!key) return fail("key zorunludur");

    const outcome = await runSource(key);

    if (outcome.stats.created > 0 || outcome.stats.updated > 0) {
      const source = await prisma.dataSource.findUnique({
        where: { key },
        select: { kind: true },
      });
      touch(...(TAGS_BY_KIND[source?.kind ?? ""] ?? []));
    }

    return ok({ outcome });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Çalıştırılamadı", 500);
  }
}
