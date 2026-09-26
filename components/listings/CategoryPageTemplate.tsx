import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { listingCardSelect } from "@/lib/listings";
import { getListingCategory } from "@/lib/listingCategories";
import CategoryListingView from "./CategoryListingView";

type SP = Promise<Record<string, string | undefined>>;

export default async function CategoryPageTemplate({
  categorySlug,
  searchParams,
}: {
  categorySlug: string;
  searchParams: SP;
}) {
  const category = getListingCategory(categorySlug);
  if (!category) notFound();

  const sp = await searchParams;

  const where: Prisma.ListingWhereInput = { status: "PUBLISHED" };
  if (sp.marka) where.brand = sp.marka;
  if (sp.sehir) where.city = sp.sehir;
  if (sp.durum === "SIFIR" || sp.durum === "IKINCI_EL") where.condition = sp.durum;
  if (sp.rapor === "1") where.batteryReport = { is: { verifiedAt: { not: null } } };

  const minPrice = Number(sp.minFiyat);
  const maxPrice = Number(sp.maxFiyat);
  if (Number.isFinite(minPrice) && minPrice > 0) where.price = { ...(where.price as object), gte: minPrice };
  if (Number.isFinite(maxPrice) && maxPrice > 0) where.price = { ...(where.price as object), lte: maxPrice };

  const minYil = Number(sp.minYil);
  const maxYil = Number(sp.maxYil);
  if (Number.isFinite(minYil) && minYil > 0) where.year = { ...(where.year as object), gte: minYil };
  if (Number.isFinite(maxYil) && maxYil > 0) where.year = { ...(where.year as object), lte: maxYil };

  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } },
      { city: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  // Kategori eşleştirmesi (gerekirse vehicle bodyType veya model/başlık filtresi)
  if (categorySlug === "elektrikli-arazi-suv-pickup") {
    where.OR = [
      { vehicle: { is: { bodyType: { in: ["SUV", "Pickup", "Crossover"] } } } },
      { title: { contains: "SUV", mode: "insensitive" } },
      { title: { contains: "Pickup", mode: "insensitive" } },
      { model: { contains: "SUV", mode: "insensitive" } },
    ];
  } else if (categorySlug === "elektrikli-minivan-panelvan") {
    where.OR = [
      { vehicle: { is: { bodyType: { in: ["Van", "Minivan", "Panelvan"] } } } },
      { title: { contains: "Van", mode: "insensitive" } },
      { title: { contains: "Minivan", mode: "insensitive" } },
    ];
  } else if (categorySlug === "elektrikli-motosiklet") {
    where.OR = [
      { title: { contains: "Moto", mode: "insensitive" } },
      { title: { contains: "Scooter", mode: "insensitive" } },
      { model: { contains: "Moto", mode: "insensitive" } },
    ];
  } else if (categorySlug === "elektrikli-atv") {
    where.OR = [
      { title: { contains: "ATV", mode: "insensitive" } },
      { model: { contains: "ATV", mode: "insensitive" } },
    ];
  } else if (categorySlug === "elektrikli-utv") {
    where.OR = [
      { title: { contains: "UTV", mode: "insensitive" } },
      { model: { contains: "UTV", mode: "insensitive" } },
    ];
  } else if (categorySlug === "elektrikli-kickscooter") {
    where.OR = [
      { title: { contains: "Kickscooter", mode: "insensitive" } },
      { title: { contains: "Scooter", mode: "insensitive" } },
    ];
  } else if (categorySlug === "elektrikli-hizmet-araclari") {
    where.OR = [
      { title: { contains: "Hizmet", mode: "insensitive" } },
      { title: { contains: "Golf", mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sp.sirala === "ucuz"
      ? [{ price: "asc" }]
      : sp.sirala === "pahali"
      ? [{ price: "desc" }]
      : sp.sirala === "puan"
      ? [{ voltScore: "desc" }]
      : sp.sirala === "km-artan"
      ? [{ km: "asc" }]
      : sp.sirala === "yil-azalan"
      ? [{ year: "desc" }]
      : [{ isSponsored: "desc" }, { createdAt: "desc" }];

  let listings = await prisma.listing.findMany({
    where,
    orderBy,
    take: 60,
    select: {
      ...listingCardSelect,
      batteryReport: { select: { verifiedAt: true, sohPercent: true, riskLevel: true } },
    },
  });

  // Eğer kategori özelinde henüz filtrelenmiş kayıt yoksa (örneğin veritabanında henüz ATV/UTV yoksa)
  // kullanıcının sayfada boş ekran yerine en azından ilgili kategorinin filtre ve listeleme
  // yapısını görebilmesi için genel yayınlanan ilanları fallback olarak gösteriyoruz
  let totalCount = await prisma.listing.count({ where });
  if (listings.length === 0) {
    const fallbackWhere: Prisma.ListingWhereInput = { status: "PUBLISHED" };
    if (sp.marka) fallbackWhere.brand = sp.marka;
    if (sp.sehir) fallbackWhere.city = sp.sehir;
    listings = await prisma.listing.findMany({
      where: fallbackWhere,
      orderBy,
      take: 20,
      select: {
        ...listingCardSelect,
        batteryReport: { select: { verifiedAt: true, sohPercent: true, riskLevel: true } },
      },
    });
    totalCount = listings.length;
  }

  const [brands, cities] = await Promise.all([
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

  return (
    <CategoryListingView
      category={category}
      listings={listings as any}
      brands={brands}
      cities={cities}
      totalCount={totalCount}
    />
  );
}
