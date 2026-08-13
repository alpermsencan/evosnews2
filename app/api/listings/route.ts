import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import { isAdminCookie, ADMIN_COOKIE } from "@/lib/admin-auth";
import { listingCardSelect, recalcVoltScore } from "@/lib/listings";
import { touchListings } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CONDITIONS = ["SIFIR", "IKINCI_EL"] as const;
const SELLER_TYPES = ["Yetkili Bayi", "Galeri", "Sahibinden"] as const;

const optionalInt = (v: unknown) => {
  const n = Number(v);
  return v === "" || v == null || !Number.isFinite(n) || n < 0 ? null : Math.round(n);
};

/**
 * GET /api/listings
 * ?marka= &sehir= &durum=SIFIR|IKINCI_EL &minFiyat= &maxFiyat= &minPuan=
 * &rapor=1 (yalnızca doğrulanmış batarya raporu olanlar) &sirala= &limit=
 *
 * Yalnızca YAYINDAKİ ilanlar döner. Moderasyondan geçmemiş ilan herkese
 * açık uçtan görünmez.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Prisma.ListingWhereInput = { status: "PUBLISHED" };

  const brand = sp.get("marka");
  const city = sp.get("sehir");
  const condition = sp.get("durum");
  const minPrice = Number(sp.get("minFiyat"));
  const maxPrice = Number(sp.get("maxFiyat"));
  const minScore = Number(sp.get("minPuan"));
  const q = sp.get("q");

  if (brand) where.brand = brand;
  if (city) where.city = city;
  if (condition && CONDITIONS.includes(condition as (typeof CONDITIONS)[number])) {
    where.condition = condition;
  }
  if (Number.isFinite(minPrice) && minPrice > 0) where.price = { gte: minPrice };
  if (Number.isFinite(maxPrice) && maxPrice > 0) {
    where.price = { ...(where.price as object), lte: maxPrice };
  }
  if (Number.isFinite(minScore) && minScore > 0) where.voltScore = { gte: minScore };
  if (sp.get("rapor") === "1") where.batteryReport = { is: { verifiedAt: { not: null } } };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }

  const sort = sp.get("sirala");
  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sort === "ucuz"
      ? [{ price: "asc" }]
      : sort === "pahali"
        ? [{ price: "desc" }]
        : sort === "puan"
          ? [{ voltScore: "desc" }]
          : sort === "km"
            ? [{ km: "asc" }]
            // Varsayılan: sponsorlu ilanlar üstte, sonra yeniden eskiye.
            : [{ isSponsored: "desc" }, { createdAt: "desc" }];

  return handle(async () => {
    const [items, brands, cities] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        take: Math.min(num(sp.get("limit"), 60), 120),
        select: {
          ...listingCardSelect,
          batteryReport: { select: { verifiedAt: true, sohPercent: true, riskLevel: true } },
        },
      }),
      prisma.listing.findMany({
        where: { status: "PUBLISHED" },
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
      prisma.listing.findMany({
        where: { status: "PUBLISHED" },
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      }),
    ]);

    return {
      items,
      total: items.length,
      brands: brands.map((b) => b.brand),
      cities: cities.map((c) => c.city),
    };
  });
}

/**
 * POST /api/listings — üye ilan verir.
 *
 * İlan PENDING olarak düşer; moderasyondan geçmeden yayına çıkmaz. Yönetici
 * doğrudan yayınlayabilir.
 */
export async function POST(req: NextRequest) {
  try {
    const viewer = await getRequestUser(req);
    const isAdmin = await isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);

    // getRequestUser askıya alınmış üye için zaten null döner.
    if (!viewer && !isAdmin) return fail("İlan vermek için giriş yapın", 401);

    const b = await req.json();
    for (const field of ["title", "brand", "model", "city"]) {
      if (!b[field]) return fail(`${field} zorunludur`);
    }

    const price = Number(b.price);
    if (!Number.isFinite(price) || price <= 0) return fail("Geçerli bir fiyat girin");

    const year = Number(b.year);
    const currentYear = new Date().getFullYear();
    if (!Number.isFinite(year) || year < 2010 || year > currentYear + 1) {
      return fail("Geçerli bir model yılı girin");
    }

    const condition = CONDITIONS.includes(b.condition) ? b.condition : "IKINCI_EL";
    const sellerType = SELLER_TYPES.includes(b.sellerType) ? b.sellerType : "Sahibinden";

    // Slug çakışmasını engellemek için sona kısa bir ayırıcı eklenir.
    const suffix = Math.random().toString(36).slice(2, 7);

    const listing = await prisma.listing.create({
      data: {
        title: String(b.title).slice(0, 140),
        slug: `${slugify(b.title) || "ilan"}-${suffix}`,
        brand: b.brand,
        model: b.model,
        year: Math.round(year),
        km: optionalInt(b.km) ?? 0,
        price: Math.round(price),
        city: b.city,
        image: b.image || "/arac-placeholder.svg",
        images: Array.isArray(b.images) ? b.images.slice(0, 10) : [],
        condition,
        sellerType,
        sellerName: b.sellerName || viewer?.name || "Evos üyesi",
        // Beyan edilen batarya sağlığı; doğrulanmış rapor geldiğinde onun
        // ölçümü öncelik kazanır (bkz. lib/listings.ts).
        batteryHealth: optionalInt(b.batteryHealth) ?? 100,
        rangeKm: optionalInt(b.rangeKm) ?? 0,
        color: b.color || "Belirtilmemiş",
        damage: b.damage || "Hasarsız",
        description: String(b.description ?? "").slice(0, 4000),
        vehicleId: b.vehicleId || null,
        warrantyMonthsLeft: optionalInt(b.warrantyMonthsLeft),
        serviceHistory: b.serviceHistory || null,
        fastChargeHabit: b.fastChargeHabit || null,
        realRangeKm: optionalInt(b.realRangeKm),
        userId: viewer?.id ?? null,
        // Sponsorlu vitrin ticari bir karardır; üye kendi ilanını öne çıkaramaz.
        isSponsored: isAdmin ? !!b.isSponsored : false,
        status: isAdmin ? (b.status ?? "PUBLISHED") : "PENDING",
      },
    });

    // Puan create'ten SONRA hesaplandığı için elimizdeki `listing` nesnesi
    // bayat kalır; yanıtta güncel puanı döndürmek için taze kaydı okuyoruz.
    const scored = await recalcVoltScore(listing.id);
    touchListings();

    return ok(
      { listing: { ...listing, voltScore: scored?.score ?? null }, moderation: !isAdmin },
      201,
    );
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İlan oluşturulamadı", 500);
  }
}
