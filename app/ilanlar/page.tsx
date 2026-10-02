import { Suspense } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import ListingRowCard from "@/components/listings/ListingRowCard";
import CategorySelectModal from "@/components/listings/CategorySelectModal";
import { listingCardSelect } from "@/lib/listings";
import { IconCar, IconChevronRight } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "İkinci El Elektrikli Araçlar — e-aracım",
  description:
    "Türkiye'nin en zengin, güncel ve güvenilir elektrikli araç ilan platformu.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function ListingsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const where: Prisma.ListingWhereInput = { status: "PUBLISHED" };
  if (sp.marka) where.brand = sp.marka;
  if (sp.sehir) where.city = sp.sehir;
  if (sp.durum === "SIFIR" || sp.durum === "IKINCI_EL") where.condition = sp.durum;

  const maxPrice = Number(sp.maxFiyat);
  if (Number.isFinite(maxPrice) && maxPrice > 0) where.price = { lte: maxPrice };
  const minScore = Number(sp.minPuan);
  if (Number.isFinite(minScore) && minScore > 0) where.voltScore = { gte: minScore };

  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } },
      { city: { contains: sp.q, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sp.sirala === "ucuz"
      ? [{ price: "asc" }]
      : sp.sirala === "pahali"
        ? [{ price: "desc" }]
        : sp.sirala === "puan"
          ? [{ voltScore: "desc" }]
          : [{ isSponsored: "desc" }, { createdAt: "desc" }];

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      take: 60,
      select: {
        ...listingCardSelect,
        batteryReport: { select: { verifiedAt: true, sohPercent: true, riskLevel: true } },
      },
    }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      {/* HEADER: 2. EL ELEKTRİKLİ ARAÇLAR (Sade, Kompakt & Kurumsal) */}
      <header className="relative flex flex-col gap-3 rounded-2xl sm:rounded-3xl bg-neutral-950 p-4 sm:p-6 lg:p-7 text-white shadow-md border border-neutral-800 overflow-hidden">
        {/* Zarif Mavi Arka Plan Işıltısı */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-5">
          <div className="flex flex-col gap-1 sm:gap-1.5 max-w-2xl">
            {/* Üst Belirteç */}
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-400">
                ELEKTRİKLİ ARAÇ PAZARYERİ
              </span>
            </div>

            {/* Sadeleştirilmiş & Küçültülmüş Başlık */}
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-white tracking-tight uppercase leading-snug">
              İkinci El Elektrikli Araçlar
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
              Türkiye genelinde yayındaki güncel elektrikli araç ilanları ve detaylı incelemeler.
            </p>
          </div>

          {/* Sağ Kolon: İlan Ver Butonu & İlan Sayacı */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 sm:gap-2.5 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-neutral-800">
            <span className="text-xs text-neutral-400 font-medium">
              <strong className="text-white font-bold">{total}</strong> ilan yayında
            </span>

            <Link
              href="/ilanlar/yeni"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 sm:px-5 sm:py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
            >
              <span>+</span>
              <span>Ücretsiz İlan Ver</span>
            </Link>
          </div>
        </div>
      </header>

      {/* BİRLEŞTİRİLMİŞ ARAMA VE TAM SAYFA FİLTRELER BUTONU */}
      <CategorySelectModal />

      {/* TÜM İLANLAR LİSTESİ (YENİ SÜTUN KARTLARI) */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title={`GÜNCEL İLANLAR (${listings.length})`}
          subtitle="En son eklenen güncel 2. el elektrikli araçlar"
          color="#0284c7"
        />

        {listings.length > 0 ? (
          <div className="flex flex-col gap-3">
            {listings.map((l) => (
              <ListingRowCard key={l.id} listing={l as any} />
            ))}
          </div>
        ) : (
          <EmptyState hasFilters={Object.keys(sp).length > 0} total={total} />
        )}
      </section>
    </div>
  );
}

function EmptyState({ hasFilters, total }: { hasFilters: boolean; total: number }) {
  if (total > 0 && hasFilters) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center text-sm font-semibold text-neutral-500 border border-neutral-200">
        Filtrelerinize uygun ilan bulunamadı.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
      <IconCar className="h-10 w-10 text-neutral-300" />
      <h3 className="text-base font-black text-neutral-800">Henüz ilan yok</h3>
      <p className="max-w-md text-xs text-neutral-500">
        Pazaryeri örnek ilanla doldurulmaz; buradaki her ilan gerçek bir
        satıcıdan gelir. İlk ilanı siz verin — ilanınız moderasyondan geçtikten sonra yayına alınır.
      </p>
      <Link
        href="/ilanlar/yeni"
        className="mt-2 rounded-xl bg-sky-600 px-6 py-2.5 text-xs font-black text-white shadow transition hover:bg-sky-700"
      >
        İLAN VER
      </Link>
    </div>
  );
}
