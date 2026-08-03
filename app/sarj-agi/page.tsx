import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import FilterBar from "@/components/ui/FilterBar";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { IconBolt, IconClock, IconMap } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Şarj Ağı · Evos Charge Network",
  description:
    "Türkiye genelindeki hızlı şarj istasyonları, operatör tarifeleri ve güç kapasiteleri.",
};

type SP = Promise<Record<string, string | undefined>>;

export default async function ChargePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;

  const where: Prisma.ChargeStationWhereInput = {};
  if (sp.il) where.city = sp.il;
  if (sp.operator) where.operator = sp.operator;
  if (sp.hizli === "1") where.isFast = true;
  const minGuc = Number(sp.minGuc);
  if (minGuc > 0) where.maxPowerKw = { gte: minGuc };

  const [stations, cities, operators, agg, fastCount, news] = await Promise.all([
    prisma.chargeStation.findMany({ where, orderBy: [{ maxPowerKw: "desc" }, { city: "asc" }] }),
    prisma.chargeStation.findMany({ select: { city: true }, distinct: ["city"], orderBy: { city: "asc" } }),
    prisma.chargeStation.findMany({ select: { operator: true }, distinct: ["operator"], orderBy: { operator: "asc" } }),
    prisma.chargeStation.aggregate({
      _sum: { socketCount: true },
      _avg: { pricePerKwh: true, maxPowerKw: true },
      _count: true,
    }),
    prisma.chargeStation.count({ where: { isFast: true } }),
    getByCategory("sarj-agi", 4),
  ]);

  // Operatör tarife özeti
  const byOperator = new Map<
    string,
    { count: number; sockets: number; totalPrice: number; maxKw: number }
  >();
  const all = await prisma.chargeStation.findMany();
  for (const s of all) {
    const cur = byOperator.get(s.operator) ?? {
      count: 0,
      sockets: 0,
      totalPrice: 0,
      maxKw: 0,
    };
    cur.count += 1;
    cur.sockets += s.socketCount;
    cur.totalPrice += s.pricePerKwh;
    cur.maxKw = Math.max(cur.maxKw, s.maxPowerKw);
    byOperator.set(s.operator, cur);
  }

  const cityCounts = new Map<string, number>();
  for (const s of all) cityCounts.set(s.city, (cityCounts.get(s.city) ?? 0) + s.socketCount);
  const topCities = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCity = topCities[0]?.[1] ?? 1;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-green-700 to-emerald-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconBolt className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">ŞARJ AĞINI GÖSTER</h1>
        </div>
        <p className="max-w-2xl text-sm text-white/85 sm:text-base">
          Evos Charge Network ve anlaşmalı operatörlerin Türkiye genelindeki
          istasyonları, güç kapasiteleri ve güncel kWh tarifeleri.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="İstasyon" value={`${agg._count}`} />
          <Stat label="Toplam soket" value={`${agg._sum.socketCount ?? 0}`} />
          <Stat label="Hızlı şarj noktası" value={`${fastCount}`} />
          <Stat
            label="Ortalama tarife"
            value={`${(agg._avg.pricePerKwh ?? 0).toFixed(2)} ₺`}
          />
        </div>
      </header>

      <Suspense fallback={<div className="h-16 rounded-lg bg-white" />}>
        <FilterBar
          fields={[
            { key: "il", label: "İl", type: "select", options: cities.map((c) => ({ value: c.city, label: c.city })) },
            { key: "operator", label: "Operatör", type: "select", options: operators.map((o) => ({ value: o.operator, label: o.operator })) },
            { key: "minGuc", label: "Min. güç (kW)", type: "number", placeholder: "150" },
            {
              key: "hizli",
              label: "Şarj tipi",
              type: "select",
              options: [{ value: "1", label: "Sadece hızlı (DC)" }],
            },
          ]}
        />
      </Suspense>

      <section>
        <SectionTitle
          title={`İSTASYONLAR (${stations.length})`}
          color="#15803d"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((s) => (
            <article
              key={s.id}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-black leading-tight text-neutral-900">
                  {s.name}
                </h3>
                <span
                  className={`shrink-0 rounded px-2 py-1 text-[10px] font-black text-white ${
                    s.isFast ? "bg-volt" : "bg-neutral-400"
                  }`}
                >
                  {s.maxPowerKw} kW
                </span>
              </div>

              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <IconMap className="h-3.5 w-3.5" />
                {s.city} / {s.district}
              </span>
              <span className="text-xs text-neutral-500">{s.address}</span>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <Chip>{s.operator}</Chip>
                <Chip>{s.socketCount} soket</Chip>
                {s.socketTypes.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
                {s.is24h && (
                  <Chip>
                    <IconClock className="mr-1 inline h-3 w-3" />
                    7/24
                  </Chip>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-neutral-100 pt-2">
                <span className="text-[11px] font-semibold text-neutral-400">
                  {s.amenities.join(" · ") || "Ek hizmet yok"}
                </span>
                <span className="text-sm font-black text-volt-dark">
                  {s.pricePerKwh.toFixed(2)} ₺/kWh
                </span>
              </div>
            </article>
          ))}
        </div>
        {stations.length === 0 && (
          <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
            Filtrelerinize uygun istasyon bulunamadı.
          </p>
        )}
      </section>

      {/* OPERATÖR TARİFE TABLOSU + İL DAĞILIMI */}
      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="min-w-0 flex-1">
          <SectionTitle title="OPERATÖR TARİFE KARŞILAŞTIRMASI" color="#15803d" />
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">OPERATÖR</th>
                  <th className="px-4 py-3">İSTASYON</th>
                  <th className="px-4 py-3">SOKET</th>
                  <th className="px-4 py-3">MAKS. GÜÇ</th>
                  <th className="px-4 py-3 text-right">ORT. TARİFE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[...byOperator.entries()]
                  .sort((a, b) => b[1].sockets - a[1].sockets)
                  .map(([op, d]) => (
                    <tr key={op} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-bold text-neutral-900">{op}</td>
                      <td className="px-4 py-3 text-neutral-600">{d.count}</td>
                      <td className="px-4 py-3 text-neutral-600">{d.sockets}</td>
                      <td className="px-4 py-3 font-semibold text-volt-dark">
                        {d.maxKw} kW
                      </td>
                      <td className="px-4 py-3 text-right font-black text-neutral-900">
                        {(d.totalPrice / d.count).toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="w-full shrink-0 lg:w-[380px]">
          <SectionTitle title="İL BAZLI SOKET DAĞILIMI" color="#15803d" />
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
            {topCities.map(([city, count]) => (
              <div key={city} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-600">
                  <span>{city}</span>
                  <span>{count} soket</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-volt"
                    style={{ width: `${(count / maxCity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <Link
              href="/platform"
              className="mt-2 rounded-md bg-volt px-4 py-2.5 text-center text-sm font-black text-white transition hover:bg-volt-dark"
            >
              İSTASYON YATIRIMCISI OL
            </Link>
          </div>
        </aside>
      </div>

      <section>
        <SectionTitle title="ŞARJ AĞI HABERLERİ" href="/kategori/sarj-agi" color="#15803d" />
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
      {children}
    </span>
  );
}
