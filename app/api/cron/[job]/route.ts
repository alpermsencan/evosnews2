import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { runKind, ensureSources } from "@/lib/ingest/runner";
import { pruneArchive } from "@/lib/ingest/prune";
import { recategorizeArchive } from "@/lib/ingest/recategorize";
import { checkFreshness, summarize } from "@/lib/freshness";
import { TAGS } from "@/lib/cache";
import type { SourceKind } from "@/lib/ingest/types";

export const dynamic = "force-dynamic";
/**
 * 300 sn, Vercel'de Hobby dâhil tüm planlarda geçerli üst sınırdır (fluid
 * compute ile birlikte); Pro'da 800 sn'ye çıkarılabilir.
 *
 * Haber yeniden yazımı yavaş olduğundan iş, süre bütçesine göre kendini
 * durdurur: kalan taslaklar bir sonraki çalışmada işlenir (bkz. news-rss.ts).
 * Ölçüm: günlük çalışmada tüm beslemeler ~30 sn, iki gün birikmişse ~150 sn.
 */
export const maxDuration = 300;

/** Bütçenin son payı yanıt üretimi ve önbellek temizliğine ayrılır. */
const BUDGET_RESERVE_MS = 5_000;

const JOBS: Record<string, { kind: SourceKind; limit: number }> = {
  news: { kind: "news", limit: 40 },
  stations: { kind: "stations", limit: 500 },
  fx: { kind: "fx", limit: 10 },
  prices: { kind: "prices", limit: 20 },
};

/**
 * Yetki kontrolü.
 * Vercel Cron istekleri `Authorization: Bearer $CRON_SECRET` başlığıyla gelir.
 * Elle tetikleme için aynı sırrı `?key=` ile de kabul ediyoruz.
 */
function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Sır tanımlı değilse endpoint tamamen kapalıdır — kazara açık kalmasın.
  if (!secret) return false;

  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  return req.nextUrl.searchParams.get("key") === secret;
}

/** Şarj istasyonu envanteri en son 6 günden önce güncellendiyse sıradadır. */
async function isStationSyncDue() {
  const source = await prisma.dataSource.findFirst({
    where: { kind: "stations", isActive: true },
    orderBy: { lastOkAt: "desc" },
    select: { lastOkAt: true },
  });
  if (!source?.lastOkAt) return true;
  return Date.now() - source.lastOkAt.getTime() > 6 * 24 * 60 * 60 * 1000;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ job: string }> }) {
  if (!authorized(req)) return fail("Yetkisiz", 401);

  const { job } = await ctx.params;
  const startedAt = Date.now();
  const deadline = startedAt + maxDuration * 1000 - BUDGET_RESERVE_MS;

  if (job === "setup") {
    // Yeni ortamda kaynak tanımlarını oluşturur (idempotent).
    // ?reset=1 → besleme adresi, kategori ve anahtar kelimeleri de koddaki
    // varsayılanlara döndürür (panelden yapılan ayarları ezer).
    const reset = req.nextUrl.searchParams.get("reset") === "1";
    await ensureSources({ reset });
    return ok({
      job,
      ok: true,
      message: reset ? "Kaynak tanımları varsayılanlara sıfırlandı" : "Kaynak tanımları hazır",
    });
  }

  // Veritabanına HTTP dışından yazan bakım betikleri (npm run db:vehicles,
  // db:purge-seed) önbelleği kendileri temizleyemez — Next'in cache API'si
  // yalnızca sunucu bağlamında çalışır. Betikler işleri bitince bu ucu çağırır.
  // ?tags=vehicles,articles ile daraltılabilir; boşsa tüm etiketler tazelenir.
  if (job === "revalidate") {
    const requested = (req.nextUrl.searchParams.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const known = Object.values(TAGS) as string[];
    const unknown = requested.filter((t) => !known.includes(t));
    if (unknown.length) return fail(`Bilinmeyen etiket: ${unknown.join(", ")}`, 400);

    const tags = requested.length ? requested : known;
    for (const tag of tags) revalidateTag(tag, "max");

    return ok({ job, revalidated: tags, durationMs: Date.now() - startedAt });
  }

  // Arşivi konu kurallarına göre yeniden dağıtır. Günlük cron zaten çalıştırır;
  // bu uç kurallar değiştiğinde elle tetiklemek içindir.
  if (job === "recategorize") {
    const result = await recategorizeArchive();
    if (result.moved > 0) revalidateTag(TAGS.articles, "max");
    return ok({ job, durationMs: Date.now() - startedAt, ...result });
  }

  // Salt okunur tazelik denetimi. Dış izleme (UptimeRobot vb.) buraya
  // bakabilir: bayat küme varsa 207 döner.
  if (job === "health") {
    const report = await checkFreshness();
    const summary = summarize(report);
    return ok({ job, ...summary, datasets: report }, summary.ok ? 200 : 207);
  }

  if (job === "prune") {
    const result = await pruneArchive();
    if (result.archived + result.drafts + result.offTopic > 0) revalidateTag(TAGS.articles, "max");
    return ok({ job, durationMs: Date.now() - startedAt, ...result });
  }

  // Günlük tek tetik (her sabah 07:00 TRT = 04:00 UTC): önce veriyi tazele,
  // sonra eski arşivi temizle. Vercel Hobby planı sınırlı sayıda cron'a izin
  // verdiği için tüm işler tek endpoint'ten sırayla çalışır.
  if (job === "daily") {
    // Şarj istasyonu envanteri günlük değişmez ve 500 kaydı yazmak pahalıdır;
    // haftada bir çalışır, kalan günlerde bütçe habere kalır.
    const stationsDue = await isStationSyncDue();
    // Sıra önemli: pazar göstergeleri araç ve istasyon verisinden türediği
    // için istasyon senkronundan SONRA çalışır.
    const kinds: SourceKind[] = stationsDue
      ? ["fx", "stations", "prices", "news"]
      : ["fx", "prices", "news"];
    const sections: Record<string, unknown> = { stationsSkipped: !stationsDue };
    const tags = new Set<string>();
    let changed = false;

    for (const [i, kind] of kinds.entries()) {
      // Haber en yavaş iş olduğu için sona bırakıldı ve kalan bütçenin
      // tamamını kullanabilir; diğerleri paylarını aşarsa haber aç kalmasın.
      const share = Date.now() + (deadline - Date.now()) / (kinds.length - i);
      const result = await runKind(kind, JOBS[kind].limit, kind === "news" ? deadline : share);

      sections[kind] = result.outcomes.map((o) => ({
        key: o.sourceKey,
        status: o.status,
        ...o.stats,
        error: o.error,
      }));

      if (result.outcomes.some((o) => o.stats.created > 0 || o.stats.updated > 0)) {
        changed = true;
        for (const tag of result.tags) tags.add(tag);
      }
    }

    // Yeni gelen haberler kaynağın tek kategorisinde kalmasın: konu
    // yönlendirmesi her gün arşivin tamamına uygulanır. Ucuz bir iştir
    // (yalnızca eşleşmeyen kayıtlar yazılır) ve kurallar değiştiğinde
    // arşivin kendiliğinden hizalanmasını sağlar.
    const recategorized = await recategorizeArchive();
    if (recategorized.moved > 0) tags.add(TAGS.articles);

    const pruned = await pruneArchive();
    if (pruned.archived + pruned.drafts + pruned.offTopic > 0) tags.add(TAGS.articles);

    for (const tag of tags) revalidateTag(tag, "max");

    // Cron'un çalışmış olması verinin taze olduğunu KANITLAMAZ: besleme sessizce
    // boş dönebilir, anahtar süresi dolabilir. Her çalışmanın sonunda tazelik
    // denetlenir ve bayat küme varsa yanıt 207 döner — Vercel cron kaydında ve
    // dış izlemede görünür olsun.
    const health = await checkFreshness();
    const summary = summarize(health);

    return ok(
      {
        job,
        durationMs: Date.now() - startedAt,
        revalidated: [...tags],
        changed,
        recategorized,
        pruned,
        health: health.map((h) => ({
          key: h.key,
          status: h.status,
          ageHours: h.ageHours,
          maxAgeHours: h.maxAgeHours,
        })),
        stale: summary.stale,
        sources: sections,
      },
      summary.ok ? 200 : 207,
    );
  }

  const config = JOBS[job];
  if (!config) return fail(`Bilinmeyen görev: ${job}`, 404);

  const { outcomes, tags } = await runKind(config.kind, config.limit, deadline);

  const changed = outcomes.some((o) => o.stats.created > 0 || o.stats.updated > 0);

  // Yalnızca gerçekten veri değiştiyse önbelleği geçersiz kıl.
  if (changed) for (const tag of tags) revalidateTag(tag, "max");

  const failed = outcomes.filter((o) => o.status === "error");

  return ok(
    {
      job,
      durationMs: Date.now() - startedAt,
      revalidated: changed ? tags : [],
      sources: outcomes.map((o) => ({
        key: o.sourceKey,
        status: o.status,
        ...o.stats,
        error: o.error,
      })),
    },
    // Tüm kaynaklar patladıysa Vercel cron'u başarısız görsün ve uyarı üretsin.
    failed.length > 0 && failed.length === outcomes.length ? 500 : 200,
  );
}
