import "server-only";
import { prisma } from "@/lib/prisma";
import { matchesTopic } from "./topic";

/**
 * ARŞİV TEMİZLİĞİ
 *
 * Site "güncel haber" vaadi verir; aylar önceki otomatik derlemeler bu vaadi
 * zayıflatır ve sitemap'i şişirir. Bu iş yalnızca OTOMATİK çekilmiş içeriği
 * temizler:
 *
 *  - `ingestedAt` dolu  → kayıt cron tarafından üretildi
 *  - `sourceName` dolu  → dış kaynağa dayanıyor
 *
 * Elle girilen haberler (`ingestedAt` boş) hiçbir koşulda silinmez. Bir üye
 * gönderisi silinen habere bağlıysa şemadaki `SetNull` sayesinde gönderi
 * korunur, yalnızca bağlantısı düşer.
 */

/** Yayındaki otomatik haberlerin arşivde kalma süresi. */
export const ARCHIVE_DAYS = 30;

/** Reddedilen/işlenemeyen taslakların kuyrukta kalma süresi. */
const DRAFT_DAYS = 7;

export type PruneResult = {
  archived: number;
  drafts: number;
  offTopic: number;
  cutoff: string;
};

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function pruneArchive({
  archiveDays = ARCHIVE_DAYS,
  draftDays = DRAFT_DAYS,
} = {}): Promise<PruneResult> {
  const cutoff = daysAgo(archiveDays);

  const archived = await prisma.article.deleteMany({
    where: {
      ingestedAt: { not: null },
      sourceName: { not: null },
      status: "PUBLISHED",
      publishedAt: { lt: cutoff },
    },
  });

  // Yayına alınamamış eski taslaklar ve reddedilenler kuyruğu tıkamasın.
  const drafts = await prisma.article.deleteMany({
    where: {
      ingestedAt: { not: null },
      sourceName: { not: null },
      status: { in: ["DRAFT", "REJECTED"] },
      publishedAt: { lt: daysAgo(draftDays) },
    },
  });

  return {
    archived: archived.count,
    drafts: drafts.count,
    offTopic: await pruneOffTopic(),
    cutoff: cutoff.toISOString(),
  };
}

/**
 * KONU DIŞI TEMİZLİĞİ
 *
 * Anahtar kelime listesi zamanla sıkılaştırılır (ör. "batarya" kelimesi telefon
 * haberlerini de çekiyordu). Filtre değiştiğinde daha önce içeri girmiş
 * kayıtların da elenmesi gerekir; aksi hâlde eski gürültü arşivde kalır.
 *
 * Yalnızca OTOMATİK çekilmiş ve filtre tanımlı kaynaklardan gelen haberler
 * denetlenir. Editör bir haberi elle düzenlediyse başlığı değişmiş olabilir;
 * yine de filtreye takılıyorsa konu dışıdır ve silinir.
 */
async function pruneOffTopic() {
  const sources = await prisma.dataSource.findMany({
    where: { kind: "news" },
    select: { name: true, keywords: true },
  });

  const filtered = sources.filter((s) => s.keywords.length > 0);
  if (!filtered.length) return 0;

  let removed = 0;

  for (const source of filtered) {
    const articles = await prisma.article.findMany({
      where: { sourceName: source.name, ingestedAt: { not: null } },
      select: { id: true, title: true, spot: true },
    });

    const offTopic = articles
      .filter((a) => !matchesTopic(source.keywords, a.title, a.spot))
      .map((a) => a.id);

    if (!offTopic.length) continue;

    await prisma.comment.deleteMany({ where: { articleId: { in: offTopic } } });
    await prisma.articleLike.deleteMany({ where: { articleId: { in: offTopic } } });
    await prisma.bookmark.deleteMany({ where: { articleId: { in: offTopic } } });
    const res = await prisma.article.deleteMany({ where: { id: { in: offTopic } } });
    removed += res.count;
  }

  return removed;
}
