import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/api";
import { contentHash, fetchText } from "../http";
import { extractBlocks, linkOf, stripHtml, tagText } from "../xml";
import { emptyStats, type IngestContext, type IngestResult, type SourceJob } from "../types";

/**
 * Dolubatarya Kaynak İşleyicisi
 * 
 * 1) https://www.youtube.com/@dolubatarya/posts topluluk gönderilerini çeker.
 * 2) https://www.youtube.com/feeds/videos.xml?channel_id=UCLRYyGAoqR26MpjAmbrG6oQ video akışını çeker.
 * 
 * Çekilen tüm içerikler 100% elektrikli araç odaklıdır ve manşet (slider) için
 * en yüksek öncelikle ("isHeadline: true", "status: PUBLISHED") kaydedilir.
 */

const YOUTUBE_CHANNEL_ID = "UCLRYyGAoqR26MpjAmbrG6oQ";
const POSTS_URL = "https://www.youtube.com/@dolubatarya/posts";
const VIDEO_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

function findObjectsWithKey(obj: any, key: string, results: any[] = []): any[] {
  if (!obj || typeof obj !== "object") return results;
  if (obj[key]) results.push(obj[key]);
  for (const k of Object.keys(obj)) {
    findObjectsWithKey(obj[k], key, results);
  }
  return results;
}

function cleanTitle(raw: string): string {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || "";
  // Başlık çok uzunsa ilk cümleyi veya uygun kelime sınırını al
  if (title.length > 110) {
    const dotIdx = title.indexOf(".");
    if (dotIdx > 30 && dotIdx < 110) {
      title = title.slice(0, dotIdx + 1);
    } else {
      const spaceIdx = title.lastIndexOf(" ", 105);
      title = (spaceIdx > 40 ? title.slice(0, spaceIdx) : title.slice(0, 105)) + "…";
    }
  }
  return title.replace(/^[#\s]+/, "");
}

function cleanSpot(raw: string, title: string): string {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const rest = lines.slice(1).join(" ") || lines[0] || title;
  const cleaned = rest.slice(0, 220);
  const lastSpace = cleaned.lastIndexOf(" ");
  return lastSpace > 100 ? `${cleaned.slice(0, lastSpace)}…` : cleaned;
}

function formatContent(rawText: string, sourceUrl: string, isVideo = false): string {
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p class="mb-4 leading-relaxed">${p.replace(/\n/g, "<br />")}</p>`);

  const footer = `
    <div class="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
      <p class="font-bold text-xs text-neutral-500 mb-1">KAYNAK BİLGİSİ</p>
      <p class="text-sm text-neutral-800">
        Bu içerik <strong>Dolubatarya</strong> tarafından paylaşılmıştır. 
        <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="ml-2 font-bold text-red-600 hover:underline inline-flex items-center gap-1">
          ${isVideo ? "YouTube'da İzle ›" : "YouTube Topluluk Gönderisini Gör ›"}
        </a>
      </p>
    </div>
  `;

  return [...paragraphs, footer].join("\n");
}

export const dolubataryaSource: SourceJob = {
  key: "news:dolubatarya",
  name: "Dolubatarya",
  kind: "news",
  schedule: "0 */2 * * *",
  attribution: "Kaynak: Dolubatarya (YouTube)",

  async run({ limit, source }: IngestContext): Promise<IngestResult> {
    const stats = emptyStats();
    const notes: string[] = [];

    // Varsayılan kategori (Haber Merkezi veya Teknoloji)
    let category = await prisma.category.findFirst({
      where: { slug: { in: ["haber-merkezi", "teknoloji"] } },
      orderBy: { order: "asc" },
    });
    if (!category) {
      category = await prisma.category.findFirst({ orderBy: { order: "asc" } });
    }
    if (!category) {
      throw new Error("Veritabanında hiç kategori bulunamadı");
    }

    // 1) Topluluk Gönderilerini Çek
    try {
      const res = await fetch(POSTS_URL, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        },
      });

      if (res.ok) {
        const html = await res.text();
        const match =
          html.match(/var ytInitialData = ({.*?});<\/script>/s) ||
          html.match(/ytInitialData = ({.*?});<\/script>/s);

        if (match) {
          const data = JSON.parse(match[1]);
          const posts = findObjectsWithKey(data, "backstagePostRenderer");

          for (const p of posts.slice(0, limit)) {
            stats.fetched++;
            const postId = p.postId;
            if (!postId) {
              stats.skipped++;
              continue;
            }

            const rawText =
              p.contentText?.runs?.map((r: any) => r.text).join("") || "";
            if (!rawText.trim()) {
              stats.skipped++;
              continue;
            }

            let imageUrl: string | null = null;
            const att = p.backstageAttachment;
            if (att?.backstageImageRenderer) {
              const thumbs = att.backstageImageRenderer.image?.thumbnails;
              imageUrl = thumbs ? thumbs[thumbs.length - 1]?.url : null;
            } else if (att?.postMultiImageRenderer) {
              const imgs = att.postMultiImageRenderer.images;
              if (imgs && imgs.length > 0) {
                const thumbs = imgs[0].backstageImageRenderer?.image?.thumbnails;
                imageUrl = thumbs ? thumbs[thumbs.length - 1]?.url : null;
              }
            } else if (att?.videoRenderer) {
              const thumbs = att.videoRenderer.thumbnail?.thumbnails;
              imageUrl = thumbs ? thumbs[thumbs.length - 1]?.url : null;
            }

            // Manşet slider'ında görsel zorunlu
            if (!imageUrl) {
              stats.skipped++;
              continue;
            }

            const title = cleanTitle(rawText);
            const spot = cleanSpot(rawText, title);
            const sourceUrl = `https://www.youtube.com/post/${postId}`;
            const hash = contentHash(title, spot, sourceUrl);
            const content = formatContent(rawText, sourceUrl, false);

            const existing = await prisma.article.findFirst({
              where: {
                OR: [
                  { externalId: postId },
                  { sourceUrl },
                  { contentHash: hash },
                ],
              },
            });

            if (existing) {
              // Mevcut kaydı manşet ve yayın olarak garantiye al
              await prisma.article.update({
                where: { id: existing.id },
                data: {
                  title,
                  spot,
                  image: imageUrl,
                  isHeadline: true,
                  status: "PUBLISHED",
                  sourceName: "Dolubatarya",
                  sourceUrl,
                },
              });
              stats.updated++;
              continue;
            }

            const slug = `${slugify(title) || "dolubatarya-haber"}-${hash.slice(0, 6)}`;

            await prisma.article.create({
              data: {
                title,
                slug,
                spot,
                content,
                image: imageUrl,
                imageCredit: "Dolubatarya",
                categoryId: category.id,
                readTime: Math.max(1, Math.round(rawText.split(/\s+/).length / 150)),
                publishedAt: new Date(),
                status: "PUBLISHED",
                isHeadline: true,
                isFeatured: true,
                isVideo: false,
                sourceName: "Dolubatarya",
                sourceUrl,
                externalId: postId,
                contentHash: hash,
                ingestedAt: new Date(),
              },
            });

            stats.created++;
          }
        }
      }
    } catch (err: any) {
      stats.failed++;
      notes.push(`Topluluk hatası: ${err.message}`);
    }

    // 2) Video RSS Akışını Çek
    try {
      const xml = await fetchText(VIDEO_FEED_URL, { timeoutMs: 15_000 });
      const entries = extractBlocks(xml, "entry").slice(0, 8);

      for (const entry of entries) {
        stats.fetched++;
        const videoId = tagText(entry, "yt:videoId");
        const title = stripHtml(tagText(entry, "title"));
        const rawDesc = stripHtml(tagText(entry, "media:description") || title);
        const url = linkOf(entry) || `https://www.youtube.com/watch?v=${videoId}`;

        if (!videoId || !title) {
          stats.skipped++;
          continue;
        }

        // Yüksek çözünürlüklü YouTube kapak görseli
        const imageUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
        const spot = cleanSpot(rawDesc, title);
        const hash = contentHash(title, spot, url);
        const content = formatContent(rawDesc, url, true);

        const existing = await prisma.article.findFirst({
          where: {
            OR: [
              { externalId: videoId },
              { sourceUrl: url },
              { contentHash: hash },
            ],
          },
        });

        if (existing) {
          await prisma.article.update({
            where: { id: existing.id },
            data: {
              title,
              spot,
              image: imageUrl,
              isHeadline: true,
              isVideo: true,
              status: "PUBLISHED",
              sourceName: "Dolubatarya",
              sourceUrl: url,
            },
          });
          stats.updated++;
          continue;
        }

        const slug = `${slugify(title) || "dolubatarya-video"}-${hash.slice(0, 6)}`;

        await prisma.article.create({
          data: {
            title,
            slug,
            spot,
            content,
            image: imageUrl,
            imageCredit: "Dolubatarya YouTube",
            categoryId: category.id,
            readTime: 3,
            publishedAt: new Date(),
            status: "PUBLISHED",
            isHeadline: true,
            isFeatured: true,
            isVideo: true,
            sourceName: "Dolubatarya",
            sourceUrl: url,
            externalId: videoId,
            contentHash: hash,
            ingestedAt: new Date(),
          },
        });

        stats.created++;
      }
    } catch (err: any) {
      stats.failed++;
      notes.push(`Video RSS hatası: ${err.message}`);
    }

    return stats;
  },
};
