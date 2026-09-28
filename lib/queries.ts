import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { TAGS, TTL } from "./cache";
import { slugify } from "./api";

export const ARTICLE_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  spot: true,
  image: true,
  tags: true,
  isBreaking: true,
  isVideo: true,
  isFeatured: true,
  views: true,
  readTime: true,
  publishedAt: true,
  sourceName: true,
  sourceUrl: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { name: true, slug: true, avatar: true } },
} as const;

/**
 * Onaylı Elektrikli Araç (EV) Kaynakları.
 * Kullanıcı talebi doğrultusunda tüm site genelindeki haberler yalnızca bu
 * kaynaklardan derlenir ve Dolubatarya en yüksek ağırlığa sahiptir.
 */
export const ALLOWED_EV_SOURCES = [
  "Dolubatarya",
  "VoltHaber",
  "DonanımHaber",
  "Webtekno",
  "Elektrikli Otomobil Haber",
] as const;

/**
 * Yayın filtresi.
 * Yalnızca PUBLISHED ve onaylı elektrikli araç kaynaklarından olan içerikler görünür.
 */
const PUBLISHED = {
  status: "PUBLISHED",
  sourceName: { in: [...ALLOWED_EV_SOURCES] },
} as const;

/**
 * ÖNBELLEKLEME NEDEN YOK
 *
 * Bu sorgular daha önce `unstable_cache` ile etiketli olarak önbellekleniyordu.
 * Sorun şu: `revalidateTag` girdiyi silmez, BAYAT işaretler — bayat girdi bir
 * sonraki isteğe olduğu gibi servis edilir, tazeleme arka planda yapılır.
 * Sonuç: panelden bir haber düzenlendiğinde sayfayı ilk açan ziyaretçi hâlâ
 * eski içeriği görüyordu. Anında geçersiz kılan `updateTag` ise yalnızca
 * Server Action içinden çağrılabiliyor, route handler'lardan çağrılamıyor.
 *
 * Sitenin tüm sayfaları zaten istek başına render ediliyor (kök layout oturumu
 * sunucuda okuyor), yani önbellek yalnızca birkaç indeksli Mongo sorgusunu
 * tasarruf ediyordu. Doğruluk bu tasarruftan değerli olduğu için okumalar
 * doğrudan yapılıyor.
 *
 * Tek istisna: getPublishedIndex (sitemap/RSS için binlerce kayıt). Orada
 * saniyelik tazelik gereksiz, maliyet ise yüksek olduğu için önbellek kalıyor.
 */
function cached<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyParts: string[],
  tags: string[],
  revalidate: number,
) {
  return unstable_cache(fn, keyParts, { tags, revalidate });
}

export const getCategories = () => prisma.category.findMany({ orderBy: { order: "asc" } });

export const getCategoryBySlug = (slug: string) => prisma.category.findUnique({ where: { slug } });

/**
 * Manşet carousel'i (Hero Slider).
 *
 * Yalnızca kullanıcının talep ettiği seçkin elektrikli araç kaynaklarından derlenir:
 * 1. Dolubatarya (En yüksek ağırlık / öncelik - topluluk gönderileri & video haberleri)
 * 2. VoltHaber
 * 3. DonanımHaber Otomotiv
 * 4. Webtekno Otomotiv
 * 5. Elektrikli Otomobil Haber
 */
export const getHeadlines = async (limit: number = 6) => {
  const baseWhere = {
    ...PUBLISHED,
    NOT: { image: "" },
  };

  // 1. ÖNCELİK: Dolubatarya (Ağırlıklı pay: limit 6 ise ilk 4 slot)
  const dolubataryaQuota = Math.max(3, Math.ceil(limit * 0.6));
  const dolubataryaSlides = await prisma.article.findMany({
    where: {
      ...baseWhere,
      sourceName: "Dolubatarya",
    },
    orderBy: { publishedAt: "desc" },
    take: dolubataryaQuota,
    select: ARTICLE_CARD_SELECT,
  });

  const selectedSlides = [...dolubataryaSlides];
  const seenIds = new Set(selectedSlides.map((s) => s.id));

  // 2. ÖNCELİK: Diğer onaylı EV kaynakları (VoltHaber, DonanımHaber, Webtekno, Elektrikli Otomobil Haber)
  const remaining = limit - selectedSlides.length;
  if (remaining > 0) {
    const partnerSlides = await prisma.article.findMany({
      where: {
        ...baseWhere,
        sourceName: {
          in: ["VoltHaber", "DonanımHaber", "Webtekno", "Elektrikli Otomobil Haber"],
        },
      },
      orderBy: { publishedAt: "desc" },
      take: remaining * 2,
      select: ARTICLE_CARD_SELECT,
    });

    for (const slide of partnerSlides) {
      if (!seenIds.has(slide.id)) {
        seenIds.add(slide.id);
        selectedSlides.push(slide);
        if (selectedSlides.length >= limit) break;
      }
    }
  }

  // 3. EĞER PARTNERLERDEN EKSİK KALDIYSA: Dolubatarya'dan daha fazla haber varsa ekle
  if (selectedSlides.length < limit) {
    const extraDolubatarya = await prisma.article.findMany({
      where: {
        ...baseWhere,
        sourceName: "Dolubatarya",
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });
    for (const slide of extraDolubatarya) {
      if (!seenIds.has(slide.id)) {
        seenIds.add(slide.id);
        selectedSlides.push(slide);
        if (selectedSlides.length >= limit) break;
      }
    }
  }

  // 4. EĞER İLK KURULUMDA HÂLÂ EKSİKSE: Manşet ve genel yayındaki haberlerle doldur
  if (selectedSlides.length < limit) {
    const fallback = await prisma.article.findMany({
      where: {
        ...baseWhere,
        isHeadline: true,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });
    for (const slide of fallback) {
      if (!seenIds.has(slide.id)) {
        seenIds.add(slide.id);
        selectedSlides.push(slide);
        if (selectedSlides.length >= limit) break;
      }
    }
  }

  if (selectedSlides.length < limit) {
    const fallbackAll = await prisma.article.findMany({
      where: baseWhere,
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });
    for (const slide of fallbackAll) {
      if (!seenIds.has(slide.id)) {
        seenIds.add(slide.id);
        selectedSlides.push(slide);
        if (selectedSlides.length >= limit) break;
      }
    }
  }

  return selectedSlides.slice(0, limit);
};

/**
 * En son yayınlanan elektrikli araç haberleri.
 * Dolubatarya'ya en yüksek ağırlık verilerek (en az %50) listelenir.
 */
export const getLatest = async (limit: number = 12, skip: number = 0) => {
  const baseWhere = {
    ...PUBLISHED,
    NOT: { image: "" },
  };

  // Dolubatarya ağırlığı: Listenin en az %50'si Dolubatarya olsun
  const dolubataryaQuota = Math.max(3, Math.ceil(limit * 0.5));
  const dolubataryaArticles = await prisma.article.findMany({
    where: {
      ...baseWhere,
      sourceName: "Dolubatarya",
    },
    orderBy: { publishedAt: "desc" },
    take: dolubataryaQuota,
    skip,
    select: ARTICLE_CARD_SELECT,
  });

  const selected = [...dolubataryaArticles];
  const seenIds = new Set(selected.map((a) => a.id));

  // Kalan slotları diğer onaylı EV kaynaklarıyla doldur
  const remaining = limit - selected.length;
  if (remaining > 0) {
    const partnerArticles = await prisma.article.findMany({
      where: {
        ...baseWhere,
        sourceName: { in: ["VoltHaber", "DonanımHaber", "Webtekno", "Elektrikli Otomobil Haber"] },
      },
      orderBy: { publishedAt: "desc" },
      take: remaining * 2,
      skip,
      select: ARTICLE_CARD_SELECT,
    });

    for (const a of partnerArticles) {
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id);
        selected.push(a);
        if (selected.length >= limit) break;
      }
    }
  }

  // Eğer partnerlerden eksik kaldıysa Dolubatarya'dan devam et
  if (selected.length < limit) {
    const moreDolubatarya = await prisma.article.findMany({
      where: {
        ...baseWhere,
        sourceName: "Dolubatarya",
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });
    for (const a of moreDolubatarya) {
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id);
        selected.push(a);
        if (selected.length >= limit) break;
      }
    }
  }

  return selected.slice(0, limit);
};

export const getMostRead = (limit: number = 8) =>
    prisma.article.findMany({
      where: PUBLISHED,
      orderBy: { views: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });

export const getByCategory = (slug: string, limit: number = 8, skip: number = 0) =>
    prisma.article.findMany({
      where: { ...PUBLISHED, category: { slug } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip,
      select: ARTICLE_CARD_SELECT,
    });

export const countByCategory = (slug: string) => prisma.article.count({ where: { ...PUBLISHED, category: { slug } } });

/**
 * Haber detayı. Taslak/reddedilmiş içerik genel tarafta 404 döner.
 *
 * Yorumlar bilerek DIŞARIDA bırakıldı: haber gövdesi nadiren, yorumlar sürekli
 * değişir. İkisi aynı önbellek girdisinde olsaydı yeni bir yorum, TTL dolana
 * kadar diğer ziyaretçilere görünmezdi. Yorumlar getArticleComments ile
 * önbelleksiz okunur.
 */
export const getArticleBySlug = async (rawSlug: string, allowDraft: boolean = false) => {
  if (!rawSlug || typeof rawSlug !== "string") return null;

  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(rawSlug).trim();
  } catch {}

  const clean = decoded.toLowerCase().trim();
  const slugified = slugify(decoded);

  const orConditions: Array<{ slug?: string; id?: string }> = [
    { slug: rawSlug },
    { slug: decoded },
    { slug: clean },
    { slug: slugified },
  ];

  if (/^[0-9a-fA-F]{24}$/.test(rawSlug)) {
    orConditions.push({ id: rawSlug });
  }
  if (/^[0-9a-fA-F]{24}$/.test(decoded) && decoded !== rawSlug) {
    orConditions.push({ id: decoded });
  }

  const article = await prisma.article.findFirst({
    where: {
      OR: orConditions,
    },
    include: { category: true, author: true },
  });

  if (!article) return null;
  if (article.status === "PUBLISHED" || allowDraft) return article;
  return null;
};

/**
 * Haber yorumları — ÖNBELLEKLENMEZ.
 * Yorum yazan kişi kendi yorumunu istemci tarafında anında görür; bu sorgu
 * diğer ziyaretçilerin de gecikmesiz görmesini sağlar.
 */
export function getArticleComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId, approved: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, username: true, avatar: true } },
    },
  });
}

export const getRelated = (categoryId: string, excludeId: string, limit: number = 4) =>
    prisma.article.findMany({
      where: { ...PUBLISHED, categoryId, NOT: { id: excludeId } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: ARTICLE_CARD_SELECT,
    });

/**
 * Sitemap ve RSS için: yayındaki tüm haberlerin hafif listesi.
 *
 * Tek önbelleklenen sorgu. Binlerce kayıt döndürdüğü için maliyetlidir, buna
 * karşılık okuyucusu arama motoru tarayıcısıdır; birkaç dakikalık gecikme
 * önemsizdir. Yeni içerik geldiğinde `touchArticles()` etiketi tazeler.
 */
export const getPublishedIndex = cached(
  (limit: number = 5000) =>
    prisma.article.findMany({
      where: PUBLISHED,
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        slug: true,
        title: true,
        spot: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    }),
  ["published-index"],
  [TAGS.articles],
  TTL.articles,
);

/** Kök layout'taki son dakika şeridi. */
export const getBreakingBar = (limit: number = 8) =>
    prisma.article.findMany({
      where: { ...PUBLISHED, OR: [{ isBreaking: true }, { isFeatured: true }] },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: { id: true, title: true, slug: true },
    });

export const getTickers = () => prisma.ticker.findMany({ orderBy: { order: "asc" } });

export const getActivePoll = () =>
    prisma.poll.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

/**
 * Serbest filtreli araç sorgusu (arama/filtre ekranları).
 * Filtre kombinasyonu sınırsız olduğundan önbelleklenmez.
 *
 * NOT: Araç detayı, şarj istasyonu listesi ve ÖTV dilimleri için burada
 * önbellekli yardımcı YOKTUR. İlgili sayfalar prisma'ya doğrudan gider;
 * böylece panelden yapılan bir düzenleme anında yansır.
 */
export async function getVehicles(
  where: Record<string, unknown> = {},
  orderBy: Record<string, unknown> = { price: "asc" },
) {
  return prisma.vehicle.findMany({ where, orderBy });
}

export const getFeaturedVehicles = (limit: number = 6) =>
    prisma.vehicle.findMany({
      where: { isFeatured: true },
      orderBy: { rangeKm: "desc" },
      take: limit,
      include: { syncImages: true },
    });



export const getCommunityPosts = (limit: number | undefined) =>
    prisma.communityPost.findMany({
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

export const getPriceIndex = () => prisma.priceIndex.findMany({ orderBy: { order: "asc" } });


/** Arama sorgusu kullanıcıya özgüdür; önbelleklenmez. */
export async function searchArticles(q: string, limit = 30) {
  if (!q?.trim()) return [];
  return prisma.article.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { spot: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: ARTICLE_CARD_SELECT,
  });
}

export type ArticleCard = Awaited<ReturnType<typeof getLatest>>[number];
