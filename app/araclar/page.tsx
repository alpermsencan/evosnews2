import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import VehicleCard from "@/components/vehicles/VehicleCard";
import VehiclesExplorer from "@/components/vehicles/VehiclesExplorer";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import BodyTypeExplorer from "@/components/vehicles/BodyTypeExplorer";
import FeaturedVehiclesShowcase from "@/components/vehicles/FeaturedVehiclesShowcase";
import { formatTL } from "@/lib/utils";

export const revalidate = 60;
export const metadata = {
  title: "Araçları Keşfet | EVOS Elektrikli Araç Rehberi",
  description:
    "Türkiye'de satışta olan elektrikli araçların menzil, batarya, şarj gücü, kredi kampanyaları ve fiyat karşılaştırması.",
};

type SP = Promise<Record<string, string | undefined>>;

// Kasa tipi geniş eşleştirme
const BODY_TYPE_MAPPING: Record<string, string[]> = {
  SUV: ["SUV", "Crossover", "SUV Fastback", "Arazi"],
  Sedan: ["Sedan", "Fastback Sedan", "Fastback"],
  Hatchback: ["Hatchback", "Hot Hatch", "Kompakt"],
  Ticari: ["Minivan", "Ticari", "Panelvan", "VAN"],
  Minivan: ["Minivan", "Ticari", "Panelvan", "VAN"],
  Coupe: ["Coupe", "Cabrio", "Roadster", "Spor"],
  "Station Wagon": ["Station Wagon", "Touring"],
};

// Finansman ve sıfır faiz kampanyası olan modeller
const CAMPAIGN_MODELS = [
  "T10X",
  "Model Y 'Juniper' RWD",
  "EV3 Long Range",
  "EV6 GT-Line 84 kWh",
  "Inster",
  "Ioniq 5 Advance 84 kWh",
  "5 E-Tech Iconic Cinq",
  "Kangoo E-Tech",
  "Seal 160 kW",
  "Atto 3",
  "Torres EVX",
];

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const sp = await searchParams;

  const where: Prisma.VehicleWhereInput = {};
  if (sp.marka) where.brand = sp.marka;
  if (sp.segment) where.segment = sp.segment;

  // Kasa filtresi
  if (sp.kasa) {
    const mapped = BODY_TYPE_MAPPING[sp.kasa];
    if (mapped) {
      where.bodyType = { in: mapped };
    } else {
      where.bodyType = sp.kasa;
    }
  }

  // Türkiye Satış Durumu
  if (sp.durum) where.marketStatus = sp.durum;

  // Kampanyalı Araçlar
  if (sp.kampanya === "1") {
    where.OR = [
      { model: { in: CAMPAIGN_MODELS } },
      { brand: { in: ["TOGG", "Tesla", "Kia", "Hyundai", "Renault", "BYD"] } },
    ];
  }

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
      ? { rating: "desc" }
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
      {/* VİTRİN: TOGG, TESLA, KIA EV, HYUNDAI IONIQ/INSTER */}
      <Suspense fallback={<div className="h-64 rounded-2xl bg-white animate-pulse" />}>
        <FeaturedVehiclesShowcase />
      </Suspense>

      {/* ANA KATALOG VE FİLTRELEME ALANI */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SOL: Açılır Menü Filtreler (Üste Alındı) */}
        <Suspense fallback={<div className="h-64 w-72 rounded-2xl bg-white" />}>
          <VehiclesExplorer
            brands={brands.map((b) => ({ value: b.brand, label: b.brand }))}
            segments={segments.map((s) => ({ value: s.segment, label: s.segment }))}
            bodyTypes={bodyTypes.map((b) => ({ value: b.bodyType, label: b.bodyType }))}
            totalCount={vehicles.length}
          />
        </Suspense>

        <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">
          {/* ARAÇ TİPİNE GÖRE KEŞFET (Ticari, TR Satışta, Kampanyalı Araçlar) */}
          <Suspense fallback={<div className="h-28 rounded-2xl bg-white animate-pulse" />}>
            <BodyTypeExplorer />
          </Suspense>

          <SectionTitle
            title={`ELEKTRİKLİ MODELLER (${vehicles.length})`}
            color="#DC2626"
          />

          {vehicles.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm font-semibold text-neutral-500 shadow-xs">
              Filtrelerinize uygun araç bulunamadı. Lütfen filtre kriterlerini genişletin.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KARŞILAŞTIRMA TABLOSU */}
      <section>
        <SectionTitle title="TEKNİK KARŞILAŞTIRMA TABLOSU" color="#DC2626" />
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
                  <td className="px-4 py-3 text-neutral-500">{v.segment || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{v.rangeKm} km</td>
                  <td className="px-4 py-3 text-neutral-600">{v.batteryKwh} kWh</td>
                  <td className="px-4 py-3 text-neutral-600">{v.motorPowerHp} HP</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {v.dcChargeKw ? `${v.dcChargeKw} kW` : "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{v.acceleration} sn</td>
                  <td className="px-4 py-3 text-neutral-600">{v.consumption} kWh/100km</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-black text-sky-800 border border-sky-100">
                      %{v.otvRate}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-neutral-900">
                    {formatTL(v.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* İLGİLİ HABERLER */}
      {news.length > 0 && (
        <section>
          <SectionTitle
            title="ARAÇ DÜNYASINDAN GELİŞMELER"
            href="/kategori/arac-merkezi"
            color="#DC2626"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {news.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
