import { Suspense } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import ListingRowCard from "@/components/listings/ListingRowCard";
import CategorySelectModal from "@/components/listings/CategorySelectModal";
import { listingCardSelect } from "@/lib/listings";
import { IconCar, IconChevronRight } from "@/components/ui/Icons";
import { LISTING_CATEGORIES } from "@/lib/listingCategories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "2.EL İLANLAR — Elektrikli Araç Pazaryeri",
  description:
    "Doğrulanmış batarya raporlu, güven endeksli ve garantili 2. el elektrikli araç ilanları.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function ListingsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const where: Prisma.ListingWhereInput = { status: "PUBLISHED" };
  if (sp.marka) where.brand = sp.marka;
  if (sp.sehir) where.city = sp.sehir;
  if (sp.durum === "SIFIR" || sp.durum === "IKINCI_EL") where.condition = sp.durum;
  if (sp.rapor === "1") where.batteryReport = { is: { verifiedAt: { not: null } } };

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
      {/* HEADER: 2.EL İLANLAR (İstatistik sütunları kaldırıldı) */}
      <header className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-evos-ink via-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
              <IconCar className="h-7 w-7" />
            </span>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-400">
                GÜVENLİ PAZARYERİ
              </span>
              <h1 className="text-2xl font-black sm:text-4xl text-white">2.EL İLANLAR</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/ilanlar/yeni"
              className="rounded-xl bg-sky-500 px-5 py-2.5 text-xs font-black text-white shadow transition hover:bg-sky-400"
            >
              + ÜCRETSİZ İLAN VER
            </Link>
            <Link
              href="/batarya-raporu"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white transition hover:bg-white/20"
            >
              BATARYA RAPORU NEDİR?
            </Link>
          </div>
        </div>

        <p className="max-w-3xl text-xs sm:text-sm text-neutral-300 leading-relaxed mt-1">
          Klasik ilan siteleri aracın sadece fotoğrafını gösterir. Burada aracın elektrikli yaşam
          verisi de var: ölçülmüş batarya sağlığı, gerçek menzil, şarj alışkanlığı ve bunları tek sayıya indiren VoltScore.
        </p>
      </header>

      {/* BİRLEŞTİRİLMİŞ ARAMA VE TAM SAYFA FİLTRELER BUTONU */}
      <CategorySelectModal />

      {/* 8 KATEGORİ HIZLI SEÇİM KARTLARI */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <span>⚡</span>
            <span>ARAÇ KATEGORİSİ SEÇİN</span>
          </h2>
          <span className="text-xs font-bold text-neutral-400">8 Kategori</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
          {LISTING_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/ilanlar/${cat.slug}`}
              className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm transition hover:border-sky-400 hover:bg-sky-50/50 hover:shadow-md"
            >
              <span className="text-3xl group-hover:scale-110 transition duration-300">
                {cat.icon}
              </span>
              <span className="text-xs sm:text-sm font-black text-neutral-900 group-hover:text-sky-700 transition leading-tight">
                {cat.name}
              </span>
              <span className="text-[10px] font-bold text-neutral-400 group-hover:text-sky-600">
                İlanları Gör →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* TÜM İLANLAR LİSTESİ (YENİ SÜTUN KARTLARI) */}
      <section className="flex flex-col gap-4">
        <SectionTitle
          title={`GÜNCEL İLANLAR (${listings.length})`}
          subtitle="En son eklenen ve bataryası kontrol edilmiş 2. el elektrikli araçlar"
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
