import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/api";
import { contentHash } from "../http";
import { fetchText } from "../http";
import { dateOf, extractBlocks, linkOf, stripHtml, tagAttr, tagText } from "../xml";
import { fetchSourcePage, rewriteArticle, rewriteEnabled } from "../rewrite";
import { matchesTopic } from "../topic";
import { emptyStats, type IngestContext, type IngestResult, type SourceJob } from "../types";

/**
 * HABER İNGEST — İKİ AŞAMALI
 *
 * 1) Toplama: besleme okunur, yeni başlıklar DRAFT olarak kuyruğa yazılır.
 *    Bu aşamada kaynağın metni saklanmaz; yalnızca başlık, kısa özet ve
 *    kanonik bağlantı tutulur.
 * 2) Yeniden yazma: kuyruktaki taslaklar için kaynak sayfa okunur, haber
 *    LLM ile SIFIRDAN Türkçe yeniden yazılır ve yayına alınır (bkz. rewrite.ts).
 *
 * İki aşama ayrıdır çünkü yeniden yazma yavaştır: cron'un süre bütçesi
 * dolduğunda kalan taslaklar kuyrukta bekler, bir sonraki çalışmada işlenir.
 * Yeniden yazılamayan hiçbir haber yayına çıkmaz.
 */

/** Kaynak görseli bulunamazsa kullanılan yerel görsel. */
const PLACEHOLDER_IMAGE = "/haber-placeholder.svg";

const SPOT_MAX = 220;

/** Yeniden yazım denemesi bu sayıyı aşan taslak bir daha denenmez. */
const MAX_REWRITE_ATTEMPTS = 3;

/** Bir çalışmada en fazla kaç taslak yeniden yazılır (maliyet tavanı). */
const REWRITE_BATCH = 25;

/** Aynı anda kaç taslak işlenir. Kaynak siteleri ve model kotası zorlanmasın. */
const REWRITE_CONCURRENCY = 4;

/** Süre bütçesinin son bu kadarı yazma/temizlik için ayrılır. */
const DEADLINE_RESERVE_MS = 6_000;

function toSpot(raw: string, fallback: string) {
  const text = stripHtml(raw).trim();
  const base = text || fallback;
  if (base.length <= SPOT_MAX) return base;
  // Kelime ortasından kesme.
  const cut = base.slice(0, SPOT_MAX);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Taslak gövdesi — yalnızca kuyrukta beklerken görünür.
 * Kaynağın metni KOPYALANMAZ; yayına çıkacak metin rewrite.ts tarafından
 * sıfırdan üretilir.
 */
function draftBody(spot: string, sourceName: string, sourceUrl: string) {
  return [
    `<p>${spot}</p>`,
    `<p><em>Bu taslak <a href="${sourceUrl}" rel="nofollow noopener" target="_blank">${sourceName}</a> kaynağındaki habere dayanıyor ve henüz yeniden yazılmadı.</em></p>`,
  ].join("\n");
}

function estimateReadTime(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

/** RSS öğesindeki görsel (media:content / media:thumbnail / enclosure). */
function feedImage(item: string): string | null {
  for (const [tag, attr] of [
    ["media:content", "url"],
    ["media:thumbnail", "url"],
    ["enclosure", "url"],
  ] as const) {
    const url = tagAttr(item, tag, attr);
    if (/^https?:\/\//i.test(url)) return url;
  }
  return null;
}

/** AŞAMA 1 — beslemeyi oku, yeni başlıkları taslak olarak kuyruğa al. */
async function collect(
  { source, limit }: IngestContext,
  stats: ReturnType<typeof emptyStats>,
  notes: string[],
) {
  if (!source.endpoint) throw new Error("Besleme adresi (endpoint) tanımlı değil");

  const category = source.categorySlug
    ? await prisma.category.findUnique({ where: { slug: source.categorySlug } })
    : await prisma.category.findFirst({ orderBy: { order: "asc" } });

  if (!category) {
    throw new Error(
      source.categorySlug
        ? `'${source.categorySlug}' kategorisi bulunamadı`
        : "Veritabanında hiç kategori yok",
    );
  }

  const xml = await fetchText(source.endpoint, { timeoutMs: 20_000 });
  const items = [...extractBlocks(xml, "item"), ...extractBlocks(xml, "entry")].slice(0, limit);

  if (!items.length) {
    notes.push("Beslemede öğe bulunamadı");
    return;
  }

  const sourceName = source.name;

  for (const item of items) {
    stats.fetched++;

    const title = stripHtml(tagText(item, "title"));
    const url = linkOf(item);

    if (!title || !/^https?:\/\//i.test(url)) {
      stats.skipped++;
      continue;
    }

    const externalId = tagText(item, "guid", "id") || url;
    const spot = toSpot(tagText(item, "description", "summary", "content"), title);

    if (!matchesTopic(source.keywords, title, spot)) {
      stats.skipped++;
      continue;
    }

    const hash = contentHash(title, spot, url);
    const publishedAt = dateOf(item) ?? new Date();

    try {
      const existing = await prisma.article.findFirst({
        where: { externalId, sourceName },
        select: { id: true, contentHash: true, status: true, rewrittenAt: true },
      });

      if (existing) {
        // Yeniden yazılmış veya editör karar vermiş içeriğin üzerine yazma —
        // insan/yayın kararı kaynağın güncellemesini yener.
        if (existing.rewrittenAt || existing.status !== "DRAFT" || existing.contentHash === hash) {
          stats.skipped++;
          continue;
        }
        await prisma.article.update({
          where: { id: existing.id },
          data: {
            title,
            spot,
            content: draftBody(spot, sourceName, url),
            contentHash: hash,
            sourceUrl: url,
            publishedAt,
            ingestedAt: new Date(),
          },
        });
        stats.updated++;
        continue;
      }

      await prisma.article.create({
        data: {
          title,
          slug: `${slugify(title) || "haber"}-${hash.slice(0, 6)}`,
          spot,
          content: draftBody(spot, sourceName, url),
          image: feedImage(item) ?? PLACEHOLDER_IMAGE,
          imageCredit: sourceName,
          categoryId: category.id,
          readTime: estimateReadTime(spot),
          publishedAt,
          // Yeniden yazılmadan hiçbir kayıt yayına çıkmaz.
          status: "DRAFT",
          sourceName,
          sourceUrl: url,
          externalId,
          contentHash: hash,
          ingestedAt: new Date(),
        },
      });
      stats.created++;
    } catch (e) {
      stats.failed++;
      if (notes.length < 5) {
        notes.push(`${title.slice(0, 40)}: ${e instanceof Error ? e.message : "hata"}`);
      }
    }
  }
}

/**
 * AŞAMA 2 — kuyruktaki taslakları yeniden yazıp yayına alır.
 *
 * `autoPublish` kapalıysa metin yine yeniden yazılır ama DRAFT kalır; editör
 * kuyruktan onaylar. Açıksa doğrudan yayına girer.
 */
async function rewritePending(
  { source, deadline }: IngestContext,
  stats: ReturnType<typeof emptyStats>,
  notes: string[],
) {
  if (!rewriteEnabled()) {
    notes.push("OPENAI_API_KEY yok — taslaklar yeniden yazılmadan kuyrukta bekliyor");
    return;
  }

  const pending = await prisma.article.findMany({
    where: {
      sourceName: source.name,
      status: "DRAFT",
      // MongoDB'de yeni kayıtta bu alan hiç yazılmaz; "null" filtresi yalnızca
      // açıkça null yazılanı bulur, yazılmamış olanı bulmak için isSet gerekir.
      OR: [{ rewrittenAt: null }, { rewrittenAt: { isSet: false } }],
      rewriteAttempts: { lt: MAX_REWRITE_ATTEMPTS },
    },
    orderBy: { publishedAt: "desc" },
    take: REWRITE_BATCH,
    select: { id: true, title: true, spot: true, sourceUrl: true, image: true },
  });

  // Her taslak için kaynak sayfa indirilir ve model çağrılır; ikisi de
  // ağ beklemesidir. Sıradan bir döngüde toplam süre kayıt sayısıyla doğru
  // orantılı büyür, bu yüzden sabit sayıda işçi kuyruğu paralel tüketir.
  // Sınır düşük tutuldu: kaynak siteleri ve model kotası zorlanmasın.
  let cursor = 0;
  let exhausted = false;

  const next = () => (cursor < pending.length ? pending[cursor++] : null);

  async function worker() {
    for (let draft = next(); draft; draft = next()) {
      // Süre bütçesi dolduysa kalanı bir sonraki çalışmaya bırak.
      if (deadline && Date.now() > deadline - DEADLINE_RESERVE_MS) {
        exhausted = true;
        return;
      }
      if (!draft.sourceUrl) continue;

      try {
        const page = await fetchSourcePage(draft.sourceUrl);
        const result = await rewriteArticle(
          {
            title: draft.title,
            summary: draft.spot,
            sourceName: source.name,
            sourceUrl: draft.sourceUrl,
          },
          { facts: page.facts },
        );

        if (!result) {
          await prisma.article.update({
            where: { id: draft.id },
            data: {
              rewriteAttempts: { increment: 1 },
              rewriteError: "Model kullanılabilir bir metin üretmedi",
            },
          });
          stats.skipped++;
          continue;
        }

        await prisma.article.update({
          where: { id: draft.id },
          data: {
            title: result.title,
            spot: result.spot,
            content: result.contentHtml,
            tags: result.tags,
            readTime: estimateReadTime(result.contentHtml),
            // Kaynak görseli yalnızca yerel yer tutucu duruyorsa devralınır;
            // her durumda imageCredit ile atıf verilir.
            ...(draft.image === PLACEHOLDER_IMAGE && page.image ? { image: page.image } : {}),
            status: source.autoPublish ? "PUBLISHED" : "DRAFT",
            rewrittenAt: new Date(),
            rewriteModel: result.model,
            rewriteError: null,
          },
        });
        stats.updated++;
      } catch (e) {
        const message = e instanceof Error ? e.message : "yeniden yazım hatası";
        await prisma.article.update({
          where: { id: draft.id },
          data: { rewriteAttempts: { increment: 1 }, rewriteError: message.slice(0, 300) },
        });
        stats.failed++;
        if (notes.length < 5) notes.push(`${draft.title.slice(0, 30)}: ${message.slice(0, 80)}`);
      }
    }
  }

  await Promise.all(Array.from({ length: REWRITE_CONCURRENCY }, worker));

  if (exhausted) {
    notes.push(`Süre bütçesi doldu — ${pending.length - cursor} taslak kuyrukta kaldı`);
  }
}

/**
 * RSS 2.0 / Atom beslemesinden haber üretir.
 *
 * Kaynak tanımı `DataSource` tablosundan gelir: `endpoint` besleme adresi,
 * `categorySlug` hedef kategori, `autoPublish` yeniden yazılan metnin doğrudan
 * yayına girip girmeyeceğini belirler.
 */
async function run(ctx: IngestContext): Promise<IngestResult> {
  const stats = emptyStats();
  const notes: string[] = [];

  await collect(ctx, stats, notes);
  await rewritePending(ctx, stats, notes);

  return { ...stats, notes };
}

/** Tüm `kind: "news"` kaynakları bu işleyiciyi paylaşır. */
export const newsRssSource: SourceJob = {
  key: "news",
  name: "RSS Haber Beslemesi",
  kind: "news",
  schedule: "0 4 * * *",
  run,
};
