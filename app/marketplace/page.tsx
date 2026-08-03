import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ListingCard from "@/components/market/ListingCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";
import { IconStore } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Evos Market · İkinci El Elektrikli Araç İlanları",
  description:
    "Batarya sağlık raporlu ikinci el elektrikli araç ilanları, fiyat ve kilometre filtreleri.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function MarketplacePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const where: Prisma.ListingWhereInput = {};
  if (sp.marka) where.brand = sp.marka;
  if (sp.il) where.city = sp.il;
  const maxFiyat = Number(sp.maxFiyat);
  const maxKm = Number(sp.maxKm);
  if (maxFiyat > 0) where.price = { lte: maxFiyat };
  if (maxKm > 0) where.km = { lte: maxKm };

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sp.sirala === "fiyat-artan"
      ? [{ price: "asc" }]
      : sp.sirala === "fiyat-azalan"
      ? [{ price: "desc" }]
      : sp.sirala === "km"
      ? [{ km: "asc" }]
      : sp.sirala === "yil"
      ? [{ year: "desc" }]
      : [{ isSponsored: "desc" }, { createdAt: "desc" }];

  const [listings, brands, cities, agg, news] = await Promise.all([
    prisma.listing.findMany({ where, orderBy }),
    prisma.listing.findMany({ select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }),
    prisma.listing.findMany({ select: { city: true }, distinct: ["city"], orderBy: { city: "asc" } }),
    prisma.listing.aggregate({
      _avg: { price: true, km: true, batteryHealth: true },
      _min: { price: true },
      _count: true,
    }),
    getByCategory("marketplace", 4),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-rose-700 to-red-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconStore className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">EVOS MARKET</h1>
        </div>
        <p className="max-w-2xl text-sm text-white/85 sm:text-base">
          Tüm ilanlarda yetkili serviste alınmış batarya sağlık raporu zorunlu.
          Ekspertizli, tramer geçmişi doğrulanmış ikinci el elektrikli araçlar.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Aktif ilan" value={`${agg._count}`} />
          <Stat label="Ortalama fiyat" value={formatTL(Math.round(agg._avg.price ?? 0), { compact: true })} />
          <Stat label="En uygun" value={formatTL(agg._min.price ?? 0, { compact: true })} />
          <Stat
            label="Ort. batarya sağlığı"
            value={`%${Math.round(agg._avg.batteryHealth ?? 0)}`}
          />
        </div>
      </header>

      <Suspense fallback={<div className="h-16 rounded-lg bg-white" />}>
        <FilterBar
          fields={[
            { key: "marka", label: "Marka", type: "select", options: brands.map((b) => ({ value: b.brand, label: b.brand })) },
            { key: "il", label: "Şehir", type: "select", options: cities.map((c) => ({ value: c.city, label: c.city })) },
            { key: "maxFiyat", label: "Maks. fiyat (₺)", type: "number", placeholder: "1500000" },
            { key: "maxKm", label: "Maks. km", type: "number", placeholder: "50000" },
            {
              key: "sirala",
              label: "Sırala",
              type: "select",
              options: [
                { value: "fiyat-artan", label: "Fiyat (artan)" },
                { value: "fiyat-azalan", label: "Fiyat (azalan)" },
                { value: "km", label: "Kilometre" },
                { value: "yil", label: "Model yılı" },
              ],
            },
          ]}
        />
      </Suspense>

      <section>
        <SectionTitle title={`İLANLAR (${listings.length})`} color="#be123c" />
        {listings.length === 0 ? (
          <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
            Filtrelerinize uygun ilan bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-black text-neutral-900">
            Aracınızı Evos Market&apos;te satın
          </h3>
          <p className="text-sm text-neutral-600">
            Ücretsiz batarya sağlık ölçümü, ekspertiz ve vitrin desteğiyle
            ortalama 24 günde alıcı bulun.
          </p>
        </div>
        <Link
          href="/dijital-garaj"
          className="shrink-0 rounded-md bg-evos px-6 py-3 text-center text-sm font-black text-white transition hover:bg-evos-dark"
        >
          İLAN VER
        </Link>
      </section>

      <section>
        <SectionTitle title="MARKET HABERLERİ" href="/kategori/marketplace" color="#be123c" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}
