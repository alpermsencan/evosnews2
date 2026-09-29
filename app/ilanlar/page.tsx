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
  title: "İkinci El Elektrikli Araçlar — EVOtoPilot",
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
      {/* HEADER: 2. EL ELEKTRİKLİ ARAÇLAR (Kurumsal, Dikkat Çekici & Lüks Tasarım) */}
      <header className="relative flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-neutral-950 via-slate-950 to-neutral-900 p-6 sm:p-8 text-white shadow-xl border border-neutral-800 ring-1 ring-white/10 overflow-hidden">
        {/* Arka Plan Dekoratif Mavi & Cam Göbeği Enerji Işıması */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex flex-col gap-2 max-w-2xl">
            {/* Üst Kurumsal Belirteç */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-400">
                TÜRKİYE&apos;NİN RESMÎ ELEKTRİKLİ ARAÇ PAZARYERİ
              </span>
            </div>

            {/* Dikkat Çekici & Kurumsal Başlık */}
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-sm">
              İkinci El Elektrikli Araçlar
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 font-semibold leading-relaxed">
              Türkiye&apos;nin en zengin, güncel ve güvenilir elektrikli araç ilan platformu.
            </p>
          </div>

          {/* Sağ Kolon: İlan Ver Butonu & İlan Sayacı */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0">
            <Link
              href="/ilanlar/yeni"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 px-7 py-3.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:from-sky-400 hover:to-blue-600 hover:scale-[1.02] active:scale-95 border border-sky-400/40"
            >
              <span className="text-base leading-none">+</span>
              <span className="tracking-wide">ÜCRETSİZ İLAN VER</span>
            </Link>

            <span className="text-xs font-bold text-neutral-400">
              Toplam <strong className="text-white font-black">{total}</strong> ilan yayında
            </span>
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
