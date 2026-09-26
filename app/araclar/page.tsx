import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehiclesExplorer from "@/components/vehicles/VehiclesExplorer";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";

export const revalidate = 60;
export const metadata = {
  title: "Araçları Keşfet",
  description:
    "Türkiye'de satışta olan elektrikli araçların menzil, batarya, şarj gücü ve fiyat karşılaştırması.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;

  const where: Prisma.VehicleWhereInput = {};
  if (sp.marka) where.brand = sp.marka;
  if (sp.segment) where.segment = sp.segment;
  if (sp.kasa) where.bodyType = sp.kasa;
  if (sp.durum) where.marketStatus = sp.durum;
  const minFiyat = Number(sp.minFiyat);
  const maxFiyat = Number(sp.maxFiyat);
  const minMenzil = Number(sp.minMenzil);
  if (minFiyat > 0) where.price = { ...(where.price as object), gte: minFiyat };
  if (maxFiyat > 0) where.price = { ...(where.price as object), lte: maxFiyat };
  if (minMenzil > 0) where.rangeKm = { gte: minMenzil };

  const orderBy: Prisma.VehicleOrderByWithRelationInput =
    sp.sirala === "fiyat-azalan"
      ? { price: "desc" }
      : sp.sirala === "menzil"
      ? { rangeKm: "desc" }
      : sp.sirala === "hizlanma"
      ? { acceleration: "asc" }
      : sp.sirala === "puan"
      ? // MongoDB'de null, azalan sıralamada sayıların ardına düşer:
        // puanı olmayan (henüz incelenmemiş) araçlar listenin sonunda kalır.
        { rating: "desc" }
      : { price: "asc" };

  const [vehicles, brands, segments, bodyTypes, stats, news] = await Promise.all([
    prisma.vehicle.findMany({ where, orderBy, include: { syncImages: true } }),
    prisma.vehicle.findMany({ select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }),
    prisma.vehicle.findMany({ select: { segment: true }, distinct: ["segment"], orderBy: { segment: "asc" } }),
    prisma.vehicle.findMany({ select: { bodyType: true }, distinct: ["bodyType"], orderBy: { bodyType: "asc" } }),
    prisma.vehicle.aggregate({ _avg: { price: true, rangeKm: true }, _min: { price: true }, _max: { rangeKm: true } }),
    getByCategory("arac-merkezi", 4),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 p-6 text-white shadow-sm">
        <h1 className="text-2xl font-black sm:text-4xl">ARAÇLARI KEŞFET</h1>
        <p className="max-w-2xl text-sm text-white/85 sm:text-base">
          Türkiye pazarındaki elektrikli modelleri menzil, batarya kapasitesi,
          şarj gücü ve fiyat kriterleriyle karşılaştırın.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <Suspense fallback={<div className="h-64 w-72 rounded-2xl bg-white" />}>
          <VehiclesExplorer
            brands={brands.map((b) => ({ value: b.brand, label: b.brand }))}
            segments={segments.map((s) => ({ value: s.segment, label: s.segment }))}
            bodyTypes={bodyTypes.map((b) => ({ value: b.bodyType, label: b.bodyType }))}
            totalCount={vehicles.length}
          />
        </Suspense>

        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          <SectionTitle
            title={`ELEKTRİKLİ MODELLER (${vehicles.length})`}
            color="#0f766e"
          />

          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm font-semibold text-neutral-500 shadow-sm">
              Filtrelerinize uygun araç bulunamadı. Lütfen filtre kriterlerini genişletin.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KARŞILAŞTIRMA TABLOSU */}
      <section>
        <SectionTitle title="TEKNİK KARŞILAŞTIRMA TABLOSU" color="#0f766e" />
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">MODEL</th>
                <th className="px-4 py-3">SEGMENT</th>
                <th className="px-4 py-3">MENZİL</th>
                <th className="px-4 py-3">BATARYA</th>
                <th className="px-4 py-3">MOTOR</th>
                <th className="px-4 py-3">DC ŞARJ</th>
                <th className="px-4 py-3">0-100</th>
                <th className="px-4 py-3">TÜKETİM</th>
                <th className="px-4 py-3">ÖTV</th>
                <th className="px-4 py-3 text-right">FİYAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {vehicles.map((v) => (
                <tr key={v.id} className="transition hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold text-neutral-900">
                    {v.brand} {v.model}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{v.segment}</td>
                  <td className="px-4 py-3 font-semibold text-volt-dark">{v.rangeKm} km</td>
                  <td className="px-4 py-3 text-neutral-600">{v.batteryKwh} kWh</td>
                  <td className="px-4 py-3 text-neutral-600">{v.motorPowerHp} HP</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {v.dcChargeKw != null ? `${v.dcChargeKw} kW` : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{v.acceleration} sn</td>
                  <td className="px-4 py-3 text-neutral-600">{v.consumption} kWh</td>
                  <td className="px-4 py-3 text-neutral-600">%{v.otvRate}</td>
                  <td className="px-4 py-3 text-right font-black text-evos">
                    {formatTL(v.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="px-1 text-[11px] leading-relaxed text-neutral-500">
        Fiyatlar Türkiye anahtar teslim liste fiyatlarıdır ve sık değişir. Menzil
        ile tüketim değerleri üretici beyanı değil, gerçek kullanım ortalamalarıdır
        (kaynak: EV Database). Boş bırakılan alanlar için doğrulanmış veri yoktur.
      </p>

      <section>
        <SectionTitle title="ARAÇ HABERLERİ" href="/arac-merkezi" color="#0f766e" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
