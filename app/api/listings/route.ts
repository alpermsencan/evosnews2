import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, num, ok, slugify } from "@/lib/api";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** GET /api/listings?marka=&il=&minFiyat=&maxFiyat=&maxKm=&sirala= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const where: Prisma.ListingWhereInput = {};

  const brand = sp.get("marka");
  const city = sp.get("il");
  const minPrice = Number(sp.get("minFiyat"));
  const maxPrice = Number(sp.get("maxFiyat"));
  const maxKm = Number(sp.get("maxKm"));
  const q = sp.get("q");

  if (brand) where.brand = brand;
  if (city) where.city = city;
  if (Number.isFinite(minPrice) && minPrice > 0)
    where.price = { ...(where.price as object), gte: minPrice };
  if (Number.isFinite(maxPrice) && maxPrice > 0)
    where.price = { ...(where.price as object), lte: maxPrice };
  if (Number.isFinite(maxKm) && maxKm > 0) where.km = { lte: maxKm };
  if (q) where.title = { contains: q, mode: "insensitive" };

  const sort = sp.get("sirala");
  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sort === "fiyat-artan"
      ? [{ price: "asc" }]
      : sort === "fiyat-azalan"
      ? [{ price: "desc" }]
      : sort === "km"
      ? [{ km: "asc" }]
      : sort === "yil"
      ? [{ year: "desc" }]
      : [{ isSponsored: "desc" }, { createdAt: "desc" }];

  return handle(async () => {
    const [items, brands, cities] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        take: Math.min(num(sp.get("limit"), 60), 100),
      }),
      prisma.listing.findMany({
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
      prisma.listing.findMany({
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

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.title || !b.brand) return fail("title ve brand zorunludur");
    const slug = slugify(b.slug || b.title);
    const listing = await prisma.listing.create({
      data: {
        title: b.title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        brand: b.brand,
        model: b.model || "",
        year: Number(b.year) || new Date().getFullYear(),
        km: Number(b.km) || 0,
        price: Number(b.price) || 0,
        city: b.city || "İstanbul",
        image: b.image || `https://picsum.photos/seed/listing-${slug}/900/600`,
        images: b.images ?? [],
        sellerType: b.sellerType || "Sahibinden",
        sellerName: b.sellerName || "Evos Kullanıcısı",
        batteryHealth: Number(b.batteryHealth) || 95,
        rangeKm: Number(b.rangeKm) || 0,
        color: b.color || "Beyaz",
        damage: b.damage || "Hasarsız",
        isSponsored: !!b.isSponsored,
        description: b.description || "",
      },
    });
    return ok({ listing }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İlan eklenemedi", 500);
  }
}
