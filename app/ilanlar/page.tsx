import { Suspense } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/news/SectionTitle";
import ListingCard from "@/components/listings/ListingCard";
import { listingCardSelect } from "@/lib/listings";
import { IconCar, IconChevronRight } from "@/components/ui/Icons";
import { formatTL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "İlanlar — Elektrikli Araç Pazaryeri",
  description:
    "Sıfır ve ikinci el elektrikli araç ilanları. Doğrulanmış batarya raporu, VoltScore güven puanı, gerçek menzil ve şarj verisiyle.",
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

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sp.sirala === "ucuz"
      ? [{ price: "asc" }]
      : sp.sirala === "pahali"
        ? [{ price: "desc" }]
        : sp.sirala === "puan"
          ? [{ voltScore: "desc" }]
          : [{ isSponsored: "desc" }, { createdAt: "desc" }];

  const [listings, brands, cities, total, reported, agg] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      take: 60,
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
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
    prisma.listing.count({
      where: { status: "PUBLISHED", batteryReport: { is: { verifiedAt: { not: null } } } },
    }),
    prisma.listing.aggregate({ where: { status: "PUBLISHED" }, _avg: { price: true, voltScore: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-evos-ink to-slate-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconCar className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">İLANLAR</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Klasik ilan siteleri aracın fotoğrafını gösterir. Burada aracın
          elektrikli yaşam verisi de var: ölçülmüş batarya sağlığı, gerçek
          menzil, şarj alışkanlığı ve bunları tek sayıya indiren VoltScore.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Yayındaki ilan" value={`${total}`} />
          <Stat label="Batarya raporlu" value={`${reported}`} />
          <Stat
            label="Ortalama fiyat"
            value={agg._avg.price ? formatTL(Math.round(agg._avg.price), { compact: true }) : "—"}
          />
          <Stat
            label="Ortalama VoltScore"
            value={agg._avg.voltScore ? `${Math.round(agg._avg.voltScore)}` : "—"}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/ilanlar/yeni"
            className="rounded-md bg-white px-4 py-2.5 text-[13px] font-black text-evos-ink transition hover:bg-white/90"
          >
            İLAN VER
          </Link>
          <Link
            href="/batarya-raporu"
            className="rounded-md border border-white/40 px-4 py-2.5 text-[13px] font-black text-white transition hover:bg-white/10"
          >
            BATARYA RAPORU NEDİR?
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="h-16 rounded-lg bg-white" />}>
        <FilterBar
          fields={[
            {
              key: "durum",
              label: "Durum",
              type: "select",
              options: [
                { value: "SIFIR", label: "Sıfır" },
                { value: "IKINCI_EL", label: "İkinci el" },
              ],
            },
            {
              key: "marka",
              label: "Marka",
              type: "select",
              options: brands.map((b) => ({ value: b.brand, label: b.brand })),
            },
            {
              key: "sehir",
              label: "Şehir",
              type: "select",
              options: cities.map((c) => ({ value: c.city, label: c.city })),
            },
            { key: "maxFiyat", label: "Maks. fiyat (₺)", type: "number", placeholder: "2500000" },
            { key: "minPuan", label: "Min. VoltScore", type: "number", placeholder: "75" },
            {
              key: "rapor",
              label: "Batarya raporu",
              type: "select",
              options: [{ value: "1", label: "Yalnızca raporlu" }],
            },
            {
              key: "sirala",
              label: "Sırala",
              type: "select",
              options: [
                { value: "puan", label: "VoltScore (yüksek)" },
                { value: "ucuz", label: "Fiyat (artan)" },
                { value: "pahali", label: "Fiyat (azalan)" },
              ],
            },
          ]}
        />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Sütun: Dikey Kategori ve Marka Seçimi */}
        <aside className="lg:col-span-1 flex flex-col gap-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h3 className="text-sm font-black text-neutral-900 border-b border-neutral-100 pb-2 mb-3">
              KATEGORİ / DURUM
            </h3>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-neutral-600">
              <Link
                href="/ilanlar"
                className={`flex items-center justify-between rounded px-2.5 py-2 hover:bg-neutral-50 hover:text-sky-600 ${!sp.durum && !sp.marka && !sp.rapor ? "bg-sky-50 text-sky-600 font-black" : ""}`}
              >
                <span>Tüm İlanlar</span>
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 font-bold">{total}</span>
              </Link>
              <Link
                href="/ilanlar?durum=SIFIR"
                className={`flex items-center justify-between rounded px-2.5 py-2 hover:bg-neutral-50 hover:text-sky-600 ${sp.durum === "SIFIR" ? "bg-sky-50 text-sky-600 font-black" : ""}`}
              >
                <span>Sıfır Elektrikli Araçlar</span>
              </Link>
              <Link
                href="/ilanlar?durum=IKINCI_EL"
                className={`flex items-center justify-between rounded px-2.5 py-2 hover:bg-neutral-50 hover:text-sky-600 ${sp.durum === "IKINCI_EL" ? "bg-sky-50 text-sky-600 font-black" : ""}`}
              >
                <span>İkinci El İlanları</span>
              </Link>
              <Link
                href="/ilanlar?rapor=1"
                className={`flex items-center justify-between rounded px-2.5 py-2 hover:bg-neutral-50 hover:text-sky-600 ${sp.rapor === "1" ? "bg-sky-50 text-sky-600 font-black" : ""}`}
              >
                <span>Batarya Raporlu İlanlar</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600 font-bold">{reported}</span>
              </Link>
            </div>

            <h3 className="text-sm font-black text-neutral-900 border-b border-neutral-100 pb-2 mt-5 mb-3">
              MARKALAR
            </h3>
            <div className="flex flex-col gap-1.5 text-xs font-bold text-neutral-600">
              {brands.map((b) => (
                <Link
                  key={b.brand}
                  href={`/ilanlar?marka=${b.brand}`}
                  className={`flex items-center justify-between rounded px-2.5 py-2 hover:bg-neutral-50 hover:text-sky-600 ${sp.marka === b.brand ? "bg-sky-50 text-sky-600 font-black" : ""}`}
                >
                  <span>{b.brand}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Sağ Sütun: İlan Vitrini & Liste */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Vitrin / Öne Çıkan İlanlar */}
          {listings.some((l) => l.isSponsored) && (
            <section className="rounded-lg border border-sky-100 bg-sky-50/20 p-4">
              <h3 className="text-sm font-black text-sky-950 mb-3 tracking-wide flex items-center gap-1.5">
                <span>⭐</span> <span>ÖNE ÇIKAN VİTRİN İLANLARI</span>
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listings.filter((l) => l.isSponsored).map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}

          {/* Normal İlanlar */}
          <section>
            <h3 className="text-sm font-black text-neutral-900 mb-3 tracking-wide">
              TÜM İLANLAR ({listings.length})
            </h3>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listings.filter((l) => !l.isSponsored).map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <EmptyState hasFilters={Object.keys(sp).length > 0} total={total} />
            )}
          </section>
        </div>
      </div>

      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">
            Sıfır mı, ikinci el mi?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Katalogdaki sıfır modellerle buradaki ikinci el ilanları aynı
            tabloda karşılaştırabilirsiniz. Kartlardaki &quot;Karşılaştır&quot;
            düğmesiyle en fazla 4 araç seçin; seçiminiz sayfalar arasında korunur.
          </p>
        </div>
        <Link
          href="/karsilastir"
          className="flex shrink-0 items-center justify-center gap-1 rounded-md bg-evos px-5 py-3 text-sm font-black text-white transition hover:bg-evos-dark"
        >
          KARŞILAŞTIRMA EKRANI <IconChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

/**
 * Boş durum iki farklı şey anlatır: filtre sonucu boş mu, yoksa pazaryerinde
 * henüz hiç ilan yok mu? İkincisi normaldir — ilanlar üyelerden gelir, örnek
 * veriyle doldurulmaz.
 */
function EmptyState({ hasFilters, total }: { hasFilters: boolean; total: number }) {
  if (total > 0 && hasFilters) {
    return (
      <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
        Filtrelerinize uygun ilan bulunamadı.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
      <IconCar className="h-10 w-10 text-neutral-300" />
      <h3 className="text-base font-black text-neutral-800">Henüz ilan yok</h3>
      <p className="max-w-md text-sm text-neutral-500">
        Pazaryeri örnek ilanla doldurulmaz; buradaki her ilan gerçek bir
        satıcıdan gelir. İlk ilanı siz verin — ilanınız moderasyondan geçtikten
        sonra yayına alınır.
      </p>
      <Link
        href="/ilanlar/yeni"
        className="mt-1 rounded-md bg-evos px-5 py-2.5 text-sm font-black text-white transition hover:bg-evos-dark"
      >
        İLAN VER
      </Link>
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
