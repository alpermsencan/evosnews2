import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NewsCard from "@/components/news/NewsCard";
import VehicleCard from "@/components/vehicles/VehicleCard";
import CardRail from "@/components/ui/CardRail";
import SectionTitle from "@/components/news/SectionTitle";
import MostRead from "@/components/news/MostRead";
import { getByCategory, getMostRead } from "@/lib/queries";
import { formatTL } from "@/lib/utils";
import { IconCar } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Araç Merkezi",
  description:
    "Elektrikli araç incelemeleri, test sürüşleri, karşılaştırmalar ve satın alma rehberleri.",
};

export default async function VehicleHubPage() {
  const [news, tests, vehicles, mostRead, cheapest, longest, fastest] =
    await Promise.all([
      getByCategory("arac-merkezi", 10),
      getByCategory("test-surusu", 4),
      prisma.vehicle.findMany({ orderBy: { rating: "desc" }, take: 8 }),
      getMostRead(8),
      prisma.vehicle.findFirst({ orderBy: { price: "asc" } }),
      prisma.vehicle.findFirst({ orderBy: { rangeKm: "desc" } }),
      prisma.vehicle.findFirst({ orderBy: { acceleration: "asc" } }),
    ]);

  const champions = [
    { title: "EN UYGUN FİYATLI", v: cheapest, metric: cheapest ? formatTL(cheapest.price) : "", color: "bg-volt" },
    { title: "EN UZUN MENZİL", v: longest, metric: longest ? `${longest.rangeKm} km` : "", color: "bg-teal-700" },
    { title: "EN HIZLI", v: fastest, metric: fastest ? `0-100: ${fastest.acceleration} sn` : "", color: "bg-evos" },
  ];

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-teal-700 to-slate-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconCar className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">ARAÇ MERKEZİ</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Evos test ekibinin incelemeleri, uzun dönem raporları, karşılaştırmalar
          ve satın alma rehberleri.
        </p>
      </header>

      {/* ŞAMPİYONLAR */}
      <section>
        <SectionTitle title="SEGMENT ŞAMPİYONLARI" color="#0f766e" href="/araclar" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {champions.map(
            (c) =>
              c.v && (
                <Link
                  key={c.title}
                  href={`/araclar/${c.v.slug}`}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:shadow-md"
                >
                  <span className={`w-fit rounded px-2 py-1 text-[10px] font-black text-white ${c.color}`}>
                    {c.title}
                  </span>
                  <span className="text-lg font-black text-neutral-900">
                    {c.v.brand} {c.v.model}
                  </span>
                  <span className="text-2xl font-black text-evos">{c.metric}</span>
                  <span className="text-xs text-neutral-500">
                    {c.v.segment} · {c.v.batteryKwh} kWh · {c.v.dcChargeKw} kW DC
                  </span>
                </Link>
              )
          )}
        </div>
      </section>

      <section>
        <SectionTitle title="EN YÜKSEK PUANLI MODELLER" color="#0f766e" href="/araclar" />
        <CardRail itemClass="w-[62%] sm:w-[38%] lg:w-[27%]">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))}
        </CardRail>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <section>
            <SectionTitle title="İNCELEMELER" color="#0f766e" href="/kategori/arac-merkezi" />
            {news[0] && <NewsCard article={news[0]} variant="wide" priority />}
            <div className="mt-3 flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
              {news.slice(1, 7).map((a) => (
                <NewsCard key={a.id} article={a} variant="row" />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="TEST SÜRÜŞÜ" color="#ca8a04" href="/kategori/test-surusu" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tests.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[330px]">
          <MostRead articles={mostRead} />
          <div className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-teal-700 to-emerald-800 p-5 text-white">
            <h3 className="text-lg font-black leading-tight">
              Tüm modelleri karşılaştırın
            </h3>
            <p className="text-sm text-white/80">
              Menzil, batarya, şarj gücü ve fiyatı tek tabloda görün.
            </p>
            <Link
              href="/araclar"
              className="rounded-md bg-white px-4 py-2.5 text-center text-sm font-black text-teal-800 transition hover:bg-white/90"
            >
              ARAÇLARI KEŞFET
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
