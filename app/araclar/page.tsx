import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import VehiclesDiscoverClient from "@/components/vehicles/VehiclesDiscoverClient";
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

export default async function VehiclesPage() {
  // Fetch all vehicles to let client-side filtering and sorting run with zero latency
  const [vehicles, stats, news] = await Promise.all([
    prisma.vehicle.findMany({
      include: { syncImages: true },
    }),
    prisma.vehicle.aggregate({
      _avg: { price: true, rangeKm: true },
      _min: { price: true },
      _max: { rangeKm: true },
    }),
    getByCategory("arac-merkezi", 4),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-teal-700 to-emerald-800 p-6 text-white shadow-sm">
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

      {/* Stateful interactive client catalog */}
      <Suspense fallback={<div className="h-48 rounded-lg bg-white border border-neutral-200 animate-pulse" />}>
        <VehiclesDiscoverClient vehicles={vehicles} />
      </Suspense>

      {/* Teknik Karşılaştırma Tablosu */}
      <section className="mt-4">
        <SectionTitle title="TÜM MODELLER TEKNİK DEĞERLER LİSTESİ" color="#0f766e" />
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
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

      <section className="mt-4">
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
