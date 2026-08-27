import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import VehicleCard from "@/components/vehicles/VehicleCard";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
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
    prisma.vehicle.findMany({ where, orderBy }),
    prisma.vehicle.findMany({ select: { brand: true }, distinct: ["brand"], orderBy: { brand: "asc" } }),
    prisma.vehicle.findMany({ select: { segment: true }, distinct: ["segment"], orderBy: { segment: "asc" } }),
    prisma.vehicle.findMany({ select: { bodyType: true }, distinct: ["bodyType"], orderBy: { bodyType: "asc" } }),
    prisma.vehicle.aggregate({ _avg: { price: true, rangeKm: true }, _min: { price: true }, _max: { rangeKm: true } }),
    getByCategory("arac-merkezi", 4),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-teal-700 to-emerald-800 p-6 text-white">
        <h1 className="text-2xl font-black sm:text-4xl">ARAÇLARI KEŞFET</h1>
        <p className="max-w-2xl text-sm text-white/85 sm:text-base">
          Türkiye pazarındaki elektrikli modelleri menzil, batarya kapasitesi,
          şarj gücü ve fiyat kriterleriyle karşılaştırın.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Model sayısı" value={`${vehicles.length}`} />
          <Stat label="Ortalama fiyat" value={formatTL(Math.round(stats._avg.price ?? 0), { compact: true })} />
          <Stat label="Ortalama menzil" value={`${Math.round(stats._avg.rangeKm ?? 0)} km`} />
          <Stat label="En uzun menzil" value={`${stats._max.rangeKm ?? 0} km`} />
        </div>
      </header>

      <Suspense fallback={<div className="h-16 rounded-lg bg-white" />}>
        <FilterBar
          fields={[
            { key: "marka", label: "Marka", type: "select", options: brands.map((b) => ({ value: b.brand, label: b.brand })) },
            { key: "segment", label: "Segment", type: "select", options: segments.map((s) => ({ value: s.segment, label: s.segment })) },
            { key: "kasa", label: "Kasa tipi", type: "select", options: bodyTypes.map((b) => ({ value: b.bodyType, label: b.bodyType })) },
            { key: "maxFiyat", label: "Maks. fiyat (₺)", type: "number", placeholder: "2000000" },
            { key: "minMenzil", label: "Min. menzil (km)", type: "number", placeholder: "400" },
            {
              key: "sirala",
              label: "Sırala",
              type: "select",
              options: [
                { value: "fiyat-artan", label: "Fiyat (artan)" },
                { value: "fiyat-azalan", label: "Fiyat (azalan)" },
                { value: "menzil", label: "Menzil" },
                { value: "hizlanma", label: "Hızlanma" },
                { value: "puan", label: "Puan" },
              ],
            },
          ]}
        />
      </Suspense>

      <section className="flex flex-col gap-8">
        <SectionTitle
          title={`ELEKTRİKLİ MODELLER (${vehicles.length})`}
          color="#0f766e"
        />
        {vehicles.length === 0 ? (
          <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
            Filtrelerinize uygun araç bulunamadı.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.keys(
              vehicles.reduce((acc, v) => {
                if (!acc[v.brand]) acc[v.brand] = [];
                acc[v.brand].push(v);
                return acc;
              }, {} as Record<string, typeof vehicles>)
            ).sort().map((brandName) => {
              const brandVehicles = vehicles.filter((v) => v.brand === brandName);
              return (
                <div key={brandName} className="flex flex-col gap-3">
                  <h3 className="text-base font-black text-neutral-800 border-b border-neutral-150 pb-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-600"></span>
                    {brandName}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {brandVehicles.map((v) => (
                      <VehicleCard key={v.id} vehicle={v} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
            <tbody className="divide-y divide-neutral-100">
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}
