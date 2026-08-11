import "server-only";
import { prisma } from "@/lib/prisma";
import { TAGS, type CacheTag } from "@/lib/cache";
import { emptyStats, type IngestResult, type SourceJob, type SourceKind } from "./types";
import { SOURCES, DEFAULT_SOURCES } from "./sources";

export type RunOutcome = {
  sourceKey: string;
  status: "ok" | "partial" | "error" | "skipped";
  stats: IngestResult;
  durationMs: number;
  error?: string;
};

const TAGS_BY_KIND: Record<SourceKind, CacheTag[]> = {
  news: [TAGS.articles],
  stations: [TAGS.stations],
  fx: [TAGS.tickers],
  prices: [TAGS.prices, TAGS.tickers],
};

/**
 * Yerleşik kaynakları veritabanına yazar (idempotent).
 * Boş bir veritabanında cron'un ilk çalışmasında da doğru şekilde kurulur.
 */
export async function ensureSources({ reset = false } = {}) {
  for (const s of DEFAULT_SOURCES) {
    await prisma.dataSource.upsert({
      where: { key: s.key },
      // Operatörün panelden yaptığı ayarları (aktiflik, otomatik yayın, kategori,
      // anahtar kelimeler) ezmemek için güncellemede yalnızca teknik alanlar
      // tazelenir. `reset` ile koddaki varsayılanlara geri dönülür.
      update: {
        name: s.name,
        kind: s.kind,
        schedule: s.schedule,
        attribution: s.attribution ?? null,
        ...(reset
          ? {
              endpoint: s.endpoint ?? null,
              categorySlug: s.categorySlug ?? null,
              keywords: s.keywords ?? [],
              isActive: s.isActive ?? true,
              autoPublish: s.autoPublish ?? false,
            }
          : {}),
      },
      create: {
        key: s.key,
        name: s.name,
        kind: s.kind,
        endpoint: s.endpoint ?? null,
        categorySlug: s.categorySlug ?? null,
        keywords: s.keywords ?? [],
        attribution: s.attribution ?? null,
        schedule: s.schedule,
        isActive: s.isActive ?? true,
        // Haber kaynaklarında metin yayına çıkmadan önce sıfırdan yeniden
        // yazılır (bkz. lib/ingest/rewrite.ts); yeniden yazılamayan hiçbir
        // kayıt yayına geçmez, bu yüzden otomatik yayın güvenlidir.
        autoPublish: s.autoPublish ?? false,
      },
    });
  }
}

function resolveJob(kind: string, key: string): SourceJob | null {
  // Haber kaynakları panelden çoğaltılabilir; hepsi aynı RSS işleyicisini kullanır.
  if (kind === "news") return SOURCES["news"] ?? null;
  return SOURCES[key] ?? null;
}

function missingEnv(job: SourceJob) {
  return (job.requiredEnv ?? []).filter((name) => !process.env[name]);
}

/** Tek bir kaynağı çalıştırır, sonucu IngestRun olarak kaydeder. */
export async function runSource(
  sourceKey: string,
  limit = 60,
  deadline?: number,
): Promise<RunOutcome> {
  const source = await prisma.dataSource.findUnique({ where: { key: sourceKey } });
  if (!source) {
    return {
      sourceKey,
      status: "error",
      stats: emptyStats(),
      durationMs: 0,
      error: "Kaynak tanımı bulunamadı",
    };
  }

  if (!source.isActive) {
    return { sourceKey, status: "skipped", stats: emptyStats(), durationMs: 0 };
  }

  const job = resolveJob(source.kind, source.key);
  if (!job) {
    return {
      sourceKey,
      status: "error",
      stats: emptyStats(),
      durationMs: 0,
      error: `'${source.kind}' türü için işleyici yok`,
    };
  }

  const missing = missingEnv(job);
  if (missing.length) {
    return {
      sourceKey,
      status: "skipped",
      stats: emptyStats(),
      durationMs: 0,
      error: `Eksik ortam değişkeni: ${missing.join(", ")}`,
    };
  }

  const startedAt = new Date();
  const run = await prisma.ingestRun.create({
    data: { sourceKey, sourceId: source.id, status: "running", startedAt },
  });

  try {
    const stats = await job.run({ source, limit, deadline });
    const durationMs = Date.now() - startedAt.getTime();
    const status: RunOutcome["status"] = stats.failed > 0 ? "partial" : "ok";

    await prisma.$transaction([
      prisma.ingestRun.update({
        where: { id: run.id },
        data: {
          status,
          fetched: stats.fetched,
          created: stats.created,
          updated: stats.updated,
          skipped: stats.skipped,
          failed: stats.failed,
          durationMs,
          error: stats.notes?.length ? stats.notes.slice(0, 5).join(" | ") : null,
          finishedAt: new Date(),
        },
      }),
      prisma.dataSource.update({
        where: { id: source.id },
        data: { lastRunAt: new Date(), lastOkAt: new Date(), lastError: null },
      }),
    ]);

    return { sourceKey, status, stats, durationMs };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bilinmeyen hata";
    const durationMs = Date.now() - startedAt.getTime();

    await prisma.$transaction([
      prisma.ingestRun.update({
        where: { id: run.id },
        data: {
          status: "error",
          error: message.slice(0, 500),
          durationMs,
          finishedAt: new Date(),
        },
      }),
      prisma.dataSource.update({
        where: { id: source.id },
        data: { lastRunAt: new Date(), lastError: message.slice(0, 500) },
      }),
    ]);

    console.error(`[ingest:${sourceKey}]`, message);
    return { sourceKey, status: "error", stats: emptyStats(), durationMs, error: message };
  }
}

/**
 * Bir türdeki tüm aktif kaynakları sırayla çalıştırır.
 * Bir kaynağın patlaması diğerlerini durdurmaz — kısmi başarı normaldir.
 */
export async function runKind(kind: SourceKind, limit = 60, deadline?: number) {
  await ensureSources();

  const sources = await prisma.dataSource.findMany({
    where: { kind, isActive: true },
    orderBy: { key: "asc" },
  });

  const outcomes: RunOutcome[] = [];
  for (const [i, source] of sources.entries()) {
    // Süre bütçesini kaynaklara eşit böl: ilk kaynak bütçeyi tüketip
    // diğerlerini aç bırakmasın. Kalan süre / kalan kaynak sayısı.
    const share = deadline
      ? Date.now() + Math.max(0, deadline - Date.now()) / (sources.length - i)
      : undefined;
    outcomes.push(await runSource(source.key, limit, share));
  }

  return { outcomes, tags: TAGS_BY_KIND[kind] ?? [] };
}
