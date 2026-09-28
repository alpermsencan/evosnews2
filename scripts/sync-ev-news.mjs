import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function slugify(text) {
  const map = { ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u" };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function contentHash(title, spot, url) {
  return crypto.createHash("sha256").update(`${title}|${spot}|${url}`).digest("hex");
}

function stripHtml(html) {
  return (html || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanTitle(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = lines[0] || "";
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

function cleanSpot(raw, title) {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const rest = lines.slice(1).join(" ") || lines[0] || title;
  const cleaned = rest.slice(0, 220);
  const lastSpace = cleaned.lastIndexOf(" ");
  return lastSpace > 100 ? `${cleaned.slice(0, lastSpace)}…` : cleaned;
}

const EV_KEYWORDS = [
  "elektrikli araç",
  "elektrikli otomobil",
  "elektrikli araba",
  "elektrikli suv",
  "elektrikli sedan",
  "elektrikli model",
  "şarj istasyonu",
  "şarj ağı",
  "şarj noktası",
  "hızlı şarj",
  "batarya",
  "menzil",
  "togg",
  "tesla",
  "byd",
  "ioniq",
  "ev",
  "katı hal",
  "lfp",
  "nmc",
  "ötv",
];

const OFF_TOPIC = [
  "iphone", "apple", "ipad", "macbook", "airpods", "samsung", "galaxy", "xiaomi",
  "huawei", "kulaklık", "akıllı saat", "laptop", "dizüstü", "tablet", "oyun konsol",
  "playstation", "xbox", "ekran kartı", "işlemci", "robot süpürge", "e-bike", "ebike",
  "bisiklet", "scooter", "motosiklet", "spacex", "starship"
];

function isEvArticle(title, text) {
  const content = `${title} ${text}`.toLowerCase();
  for (const bad of OFF_TOPIC) {
    if (content.includes(bad)) return false;
  }
  return EV_KEYWORDS.some((kw) => content.includes(kw));
}

function findObjectsWithKey(obj, key, results = []) {
  if (!obj || typeof obj !== "object") return results;
  if (obj[key]) results.push(obj[key]);
  for (const k of Object.keys(obj)) {
    findObjectsWithKey(obj[k], key, results);
  }
  return results;
}

async function syncDolubatarya(categoryId) {
  console.log("\n⚡ [1/4] Dolubatarya YouTube Gönderileri & Videoları Çekiliyor...");
  let count = 0;

  // 1. Topluluk Gönderileri
  try {
    const res = await fetch("https://www.youtube.com/@dolubatarya/posts", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData = ({.*?});<\/script>/s);
      if (match) {
        const data = JSON.parse(match[1]);
        const posts = findObjectsWithKey(data, "backstagePostRenderer");
        console.log(`-> ${posts.length} adet Dolubatarya topluluk gönderisi bulundu.`);

        for (const p of posts) {
          const postId = p.postId;
          const rawText = p.contentText?.runs?.map((r) => r.text).join("") || "";
          if (!postId || !rawText.trim()) continue;

          let img = null;
          const att = p.backstageAttachment;
          if (att?.backstageImageRenderer) {
            const thumbs = att.backstageImageRenderer.image?.thumbnails;
            img = thumbs ? thumbs[thumbs.length - 1]?.url : null;
          } else if (att?.postMultiImageRenderer) {
            const imgs = att.postMultiImageRenderer.images;
            if (imgs && imgs.length > 0) {
              const thumbs = imgs[0].backstageImageRenderer?.image?.thumbnails;
              img = thumbs ? thumbs[thumbs.length - 1]?.url : null;
            }
          } else if (att?.videoRenderer) {
            const thumbs = att.videoRenderer.thumbnail?.thumbnails;
            img = thumbs ? thumbs[thumbs.length - 1]?.url : null;
          }

          if (!img) continue;

          const title = cleanTitle(rawText);
          const spot = cleanSpot(rawText, title);
          const sourceUrl = `https://www.youtube.com/post/${postId}`;
          const hash = contentHash(title, spot, sourceUrl);
          const slug = `${slugify(title) || "dolubatarya"}-${hash.slice(0, 6)}`;

          const contentHtml = rawText
            .split(/\n\s*\n/)
            .map((par) => `<p class="mb-4 leading-relaxed">${par.replace(/\n/g, "<br />")}</p>`)
            .join("\n") +
            `\n<div class="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
               <p class="font-bold text-xs text-neutral-500 mb-1">KAYNAK</p>
               <p class="text-sm text-neutral-800">
                 Bu haber <strong>Dolubatarya</strong> tarafından paylaşılmıştır.
                 <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="ml-2 font-bold text-red-600 hover:underline">
                   YouTube Gönderisini Görüntüle ›
                 </a>
               </p>
             </div>`;

          const existing = await prisma.article.findFirst({
            where: { OR: [{ externalId: postId }, { sourceUrl }] }
          });

          if (existing) {
            await prisma.article.update({
              where: { id: existing.id },
              data: {
                title,
                spot,
                image: img,
                isHeadline: true,
                isFeatured: true,
                status: "PUBLISHED",
                sourceName: "Dolubatarya",
                sourceUrl,
              }
            });
          } else {
            await prisma.article.create({
              data: {
                title,
                slug,
                spot,
                content: contentHtml,
                image: img,
                imageCredit: "Dolubatarya",
                categoryId,
                readTime: 3,
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
              }
            });
            count++;
          }
        }
      }
    }
  } catch (e) {
    console.error("Dolubatarya topluluk hatası:", e.message);
  }

  // 2. Video Akışı
  try {
    const res = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=UCLRYyGAoqR26MpjAmbrG6oQ");
    if (res.ok) {
      const xml = await res.text();
      const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
      console.log(`-> ${entries.length} adet Dolubatarya videosu bulundu.`);

      for (const entryMatch of entries.slice(0, 6)) {
        const entry = entryMatch[1];
        const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
        const title = stripHtml(entry.match(/<title>([^<]+)<\/title>/)?.[1]);
        const desc = stripHtml(entry.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] || title);
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        if (!videoId || !title) continue;

        const img = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const spot = cleanSpot(desc, title);
        const hash = contentHash(title, spot, url);
        const slug = `${slugify(title) || "dolubatarya-video"}-${hash.slice(0, 6)}`;

        const contentHtml = `<p class="mb-4 text-base font-semibold leading-relaxed">${spot}</p>
          <div class="my-6 aspect-video w-full rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
            <iframe src="https://www.youtube-nocookie.com/embed/${videoId}" class="w-full h-full" allowfullscreen></iframe>
          </div>
          <p class="leading-relaxed text-neutral-700">${desc.replace(/\n/g, "<br />")}</p>
          <div class="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <p class="font-bold text-xs text-neutral-500 mb-1">KAYNAK</p>
            <p class="text-sm text-neutral-800">
              Bu video haber <strong>Dolubatarya</strong> YouTube kanalında yayınlanmıştır.
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="ml-2 font-bold text-red-600 hover:underline">
                YouTube'da İzle ›
              </a>
            </p>
          </div>`;

        const existing = await prisma.article.findFirst({
          where: { OR: [{ externalId: videoId }, { sourceUrl: url }] }
        });

        if (existing) {
          await prisma.article.update({
            where: { id: existing.id },
            data: {
              title,
              spot,
              image: img,
              isHeadline: true,
              isVideo: true,
              status: "PUBLISHED",
              sourceName: "Dolubatarya",
              sourceUrl: url,
            }
          });
        } else {
          await prisma.article.create({
            data: {
              title,
              slug,
              spot,
              content: contentHtml,
              image: img,
              imageCredit: "Dolubatarya YouTube",
              categoryId,
              readTime: 4,
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
            }
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("Dolubatarya video hatası:", e.message);
  }

  console.log(`✓ Dolubatarya tamamlandı: ${count} yeni eklendi.`);
}

async function syncVoltHaber(categoryId) {
  console.log("\n⚡ [2/4] VoltHaber RSS Beslemesi Çekiliyor...");
  let count = 0;
  try {
    const res = await fetch("https://volthaber.com/feed/", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      console.log(`-> ${items.length} adet VoltHaber yazısı bulundu.`);

      for (const itemMatch of items) {
        const item = itemMatch[1];
        const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
        const url = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
        const desc = stripHtml(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || title);
        const encoded = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1] || "";
        
        let img = item.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/)?.[1] ||
                  item.match(/<media:content[^>]+url=["']([^"']+)["']/)?.[1] ||
                  item.match(/<enclosure[^>]+url=["']([^"']+)["']/)?.[1] ||
                  encoded.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/)?.[1];

        if (!title || !url || !img) continue;

        const spot = cleanSpot(desc, title);
        const hash = contentHash(title, spot, url);
        const slug = `${slugify(title) || "volthaber"}-${hash.slice(0, 6)}`;

        const existing = await prisma.article.findFirst({
          where: { OR: [{ externalId: url }, { sourceUrl: url }] }
        });

        const contentHtml = (encoded ? stripHtml(encoded).split(". ").slice(0, 8).map(s => `<p class="mb-4 leading-relaxed">${s}.</p>`).join("\n") : `<p>${spot}</p>`) +
          `\n<div class="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
             <p class="font-bold text-xs text-neutral-500 mb-1">KAYNAK</p>
             <p class="text-sm text-neutral-800">
               Bu içerik <strong>VoltHaber</strong> kaynağından derlenmiştir.
               <a href="${url}" target="_blank" rel="noopener noreferrer" class="ml-2 font-bold text-red-600 hover:underline">
                 Orijinal Haberi Görüntüle ›
               </a>
             </p>
           </div>`;

        if (existing) {
          await prisma.article.update({
            where: { id: existing.id },
            data: {
              title,
              spot,
              image: img,
              isHeadline: true,
              status: "PUBLISHED",
              sourceName: "VoltHaber",
              sourceUrl: url,
            }
          });
        } else {
          await prisma.article.create({
            data: {
              title,
              slug,
              spot,
              content: contentHtml,
              image: img,
              imageCredit: "VoltHaber",
              categoryId,
              readTime: 3,
              publishedAt: new Date(),
              status: "PUBLISHED",
              isHeadline: true,
              isFeatured: true,
              sourceName: "VoltHaber",
              sourceUrl: url,
              externalId: url,
              contentHash: hash,
              ingestedAt: new Date(),
            }
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("VoltHaber hatası:", e.message);
  }
  console.log(`✓ VoltHaber tamamlandı: ${count} yeni eklendi.`);
}

async function syncWebtekno(categoryId) {
  console.log("\n⚡ [3/4] Webtekno Otomotiv & EV Haberleri Çekiliyor...");
  let count = 0;
  try {
    const res = await fetch("https://www.webtekno.com/rss.xml", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      console.log(`-> ${items.length} adet Webtekno haberi bulundu, EV filtreleniyor...`);

      for (const itemMatch of items) {
        const item = itemMatch[1];
        const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
        const url = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
        const desc = stripHtml(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || title);
        
        let img = item.match(/<enclosure[^>]+url=["']([^"']+)["']/)?.[1] ||
                  item.match(/<media:content[^>]+url=["']([^"']+)["']/)?.[1] ||
                  item.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/)?.[1];

        if (!title || !url || !img) continue;

        // Yalnızca Elektrikli Araç filtre eşleşmesi
        if (!isEvArticle(title, desc)) continue;

        const spot = cleanSpot(desc, title);
        const hash = contentHash(title, spot, url);
        const slug = `${slugify(title) || "webtekno"}-${hash.slice(0, 6)}`;

        const existing = await prisma.article.findFirst({
          where: { OR: [{ externalId: url }, { sourceUrl: url }] }
        });

        const contentHtml = `<p class="mb-4 leading-relaxed">${spot}</p>
          <div class="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <p class="font-bold text-xs text-neutral-500 mb-1">KAYNAK</p>
            <p class="text-sm text-neutral-800">
              Bu içerik <strong>Webtekno</strong> kaynağından derlenmiştir.
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="ml-2 font-bold text-red-600 hover:underline">
                Orijinal Haberi Görüntüle ›
              </a>
            </p>
          </div>`;

        if (existing) {
          await prisma.article.update({
            where: { id: existing.id },
            data: {
              title,
              spot,
              image: img,
              isHeadline: true,
              status: "PUBLISHED",
              sourceName: "Webtekno",
              sourceUrl: url,
            }
          });
        } else {
          await prisma.article.create({
            data: {
              title,
              slug,
              spot,
              content: contentHtml,
              image: img,
              imageCredit: "Webtekno",
              categoryId,
              readTime: 3,
              publishedAt: new Date(),
              status: "PUBLISHED",
              isHeadline: true,
              isFeatured: true,
              sourceName: "Webtekno",
              sourceUrl: url,
              externalId: url,
              contentHash: hash,
              ingestedAt: new Date(),
            }
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("Webtekno hatası:", e.message);
  }
  console.log(`✓ Webtekno tamamlandı: ${count} yeni eklendi.`);
}

async function syncDonanimhaber(categoryId) {
  console.log("\n⚡ [4/4] DonanımHaber Otomotiv & EV Haberleri Çekiliyor...");
  let count = 0;
  try {
    const res = await fetch("https://www.donanimhaber.com/rss/tum/", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (res.ok) {
      const xml = await res.text();
      const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
      console.log(`-> ${items.length} adet DonanımHaber içeriği bulundu, EV filtreleniyor...`);

      for (const itemMatch of items) {
        const item = itemMatch[1];
        const title = stripHtml(item.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
        const url = item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim();
        const desc = stripHtml(item.match(/<description>([\s\S]*?)<\/description>/)?.[1] || title);
        
        let img = item.match(/<enclosure[^>]+url=["']([^"']+)["']/)?.[1] ||
                  item.match(/<media:content[^>]+url=["']([^"']+)["']/)?.[1] ||
                  item.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/)?.[1];

        if (!title || !url || !img) continue;

        // Yalnızca Elektrikli Araç filtre eşleşmesi
        if (!isEvArticle(title, desc)) continue;

        const spot = cleanSpot(desc, title);
        const hash = contentHash(title, spot, url);
        const slug = `${slugify(title) || "donanimhaber"}-${hash.slice(0, 6)}`;

        const existing = await prisma.article.findFirst({
          where: { OR: [{ externalId: url }, { sourceUrl: url }] }
        });

        const contentHtml = `<p class="mb-4 leading-relaxed">${spot}</p>
          <div class="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <p class="font-bold text-xs text-neutral-500 mb-1">KAYNAK</p>
            <p class="text-sm text-neutral-800">
              Bu haber <strong>DonanımHaber</strong> kaynağından derlenmiştir.
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="ml-2 font-bold text-red-600 hover:underline">
                Orijinal Haberi Görüntüle ›
              </a>
            </p>
          </div>`;

        if (existing) {
          await prisma.article.update({
            where: { id: existing.id },
            data: {
              title,
              spot,
              image: img,
              isHeadline: true,
              status: "PUBLISHED",
              sourceName: "DonanımHaber",
              sourceUrl: url,
            }
          });
        } else {
          await prisma.article.create({
            data: {
              title,
              slug,
              spot,
              content: contentHtml,
              image: img,
              imageCredit: "DonanımHaber",
              categoryId,
              readTime: 3,
              publishedAt: new Date(),
              status: "PUBLISHED",
              isHeadline: true,
              isFeatured: true,
              sourceName: "DonanımHaber",
              sourceUrl: url,
              externalId: url,
              contentHash: hash,
              ingestedAt: new Date(),
            }
          });
          count++;
        }
      }
    }
  } catch (e) {
    console.error("DonanımHaber hatası:", e.message);
  }
  console.log(`✓ DonanımHaber tamamlandı: ${count} yeni eklendi.`);
}

async function registerDataSources() {
  console.log("\n📦 Veri Kaynakları (DataSources) Kaydediliyor...");
  const sources = [
    {
      key: "news:dolubatarya",
      name: "Dolubatarya",
      kind: "news",
      schedule: "0 */2 * * *",
      endpoint: "https://www.youtube.com/@dolubatarya/posts",
      categorySlug: "haber-merkezi",
      attribution: "Kaynak: Dolubatarya",
      autoPublish: true,
      isActive: true,
    },
    {
      key: "news:volthaber",
      name: "VoltHaber",
      kind: "news",
      schedule: "0 */2 * * *",
      endpoint: "https://volthaber.com/feed/",
      categorySlug: "haber-merkezi",
      attribution: "Kaynak: VoltHaber",
      autoPublish: true,
      isActive: true,
    },
    {
      key: "news:donanimhaber",
      name: "DonanımHaber",
      kind: "news",
      schedule: "0 */2 * * *",
      endpoint: "https://www.donanimhaber.com/rss/tum/",
      categorySlug: "teknoloji",
      attribution: "Kaynak: DonanımHaber",
      autoPublish: true,
      isActive: true,
    },
    {
      key: "news:webtekno",
      name: "Webtekno",
      kind: "news",
      schedule: "0 */2 * * *",
      endpoint: "https://www.webtekno.com/rss.xml",
      categorySlug: "teknoloji",
      attribution: "Kaynak: Webtekno",
      autoPublish: true,
      isActive: true,
    },
  ];

  for (const s of sources) {
    await prisma.dataSource.upsert({
      where: { key: s.key },
      update: {
        name: s.name,
        kind: s.kind,
        endpoint: s.endpoint,
        categorySlug: s.categorySlug,
        attribution: s.attribution,
        autoPublish: true,
        isActive: true,
      },
      create: {
        key: s.key,
        name: s.name,
        kind: s.kind,
        schedule: s.schedule,
        endpoint: s.endpoint,
        categorySlug: s.categorySlug,
        attribution: s.attribution,
        autoPublish: true,
        isActive: true,
      },
    });
  }
}

async function main() {
  console.log("=== EV HABER SENKRONİZASYONU BAŞLATILIYOR ===");
  const category = await prisma.category.findFirst({
    where: { slug: { in: ["haber-merkezi", "teknoloji"] } },
    orderBy: { order: "asc" }
  }) || await prisma.category.findFirst();

  if (!category) {
    console.error("Kategori bulunamadı!");
    return;
  }

  await registerDataSources();
  await syncDolubatarya(category.id);
  await syncVoltHaber(category.id);
  await syncWebtekno(category.id);
  await syncDonanimhaber(category.id);

  console.log("\n=== SENKRONİZASYON TAMAMLANDI ===");
  const total = await prisma.article.count({ where: { status: "PUBLISHED" } });
  const bySource = await prisma.article.groupBy({
    by: ["sourceName"],
    where: { status: "PUBLISHED" },
    _count: true,
  });
  console.log(`Toplam yayındaki haber: ${total}`);
  console.log("Kaynak dağılımı:", bySource);
}

main().finally(() => prisma.$disconnect());
