import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import NearbyStations from "@/components/stations/NearbyStations";
import StationMap from "@/components/stations/StationMap";
import { IconBolt, IconMap, IconClock } from "@/components/ui/Icons";
import { buildTariffIndex, formatTariff, matchTariff } from "@/lib/tariffs";

export const revalidate = 60;
export const metadata = {
  title: "Şarj Ağı & Fiyatları · e-aracım",
  description:
    "Türkiye genelindeki şarj istasyonları haritası, güncel operatör tarifeleri ve şarj fiyatları.",
};

import { FALLBACK_STATIONS } from "@/lib/stations-fallback";

export default async function ChargePage() {
  const [allDb, news, tariffs] = await Promise.all([
    prisma.chargeStation.findMany().catch(() => []),
    getByCategory("sarj-agi", 4).catch(() => []),
    prisma.operatorTariff.findMany({ where: { isActive: true } }).catch(() => []),
  ]);

  const all = allDb && allDb.length > 0 ? allDb : (FALLBACK_STATIONS as any);
  const tariffIndex = buildTariffIndex(tariffs);

  const byOperator = new Map<
    string,
    {
      count: number;
      sockets: number;
      priceSum: number;
      priced: number;
      maxKw: number | null;
      tariff: (typeof tariffs)[number] | null;
    }
  >();

  for (const s of all) {
    const cur = byOperator.get(s.operator) ?? {
      count: 0,
      sockets: 0,
      priceSum: 0,
      priced: 0,
      maxKw: null as number | null,
      tariff: matchTariff(tariffIndex, s.operator),
    };
    cur.count += 1;
    cur.sockets += s.socketCount;
    if (s.pricePerKwh != null) {
      cur.priceSum += s.pricePerKwh;
      cur.priced += 1;
    }
    if (s.maxPowerKw != null) cur.maxKw = Math.max(cur.maxKw ?? 0, s.maxPowerKw);
    byOperator.set(s.operator, cur);
  }

  const cityCounts = new Map<string, number>();
  for (const s of all) {
    if (s.city === "Belirtilmemiş") continue;
    cityCounts.set(s.city, (cityCounts.get(s.city) ?? 0) + s.socketCount);
  }
  const topCities = [...cityCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCity = topCities[0]?.[1] ?? 1;

  const nearbyStations = all.map((s) => {
    const tariff = matchTariff(tariffIndex, s.operator);
    return {
      id: s.id,
      name: s.name,
      operator: s.operator,
      city: s.city,
      district: s.district,
      lat: s.lat,
      lng: s.lng,
      socketCount: s.socketCount,
      maxPowerKw: s.maxPowerKw,
      isFast: s.isFast,
      price: s.pricePerKwh ?? tariff?.dcPrice ?? null,
    };
  });

  const sortedOperators = [...byOperator.entries()].sort((a, b) => b[1].sockets - a[1].sockets);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      {/* Sayfa Başlığı ve Rota Butonu */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 flex items-center gap-2">
            <IconBolt className="h-6 w-6 text-emerald-600" />
            <span>ŞARJ AĞI & TARİFELER</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Türkiye genelindeki istasyon haritası ve güncel operatör kWh fiyatları
          </p>
        </div>
        <Link
          href="/sarj-agi/rota"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-500 transition shadow-sm"
        >
          <IconMap className="h-4 w-4" />
          <span>ŞARJ & ROTA MÜHENDİSLİĞİ</span>
        </Link>
      </div>

      {/* İntaraktif Harita */}
      <StationMap stations={nearbyStations} />

      {/* Konuma En Yakın İstasyonlar (Minimalist) */}
      <NearbyStations stations={nearbyStations} />

      {/* MİNİMALİST ŞARJ FİYATLARI & OPERATÖR TARİFELERİ */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <section className="min-w-0 flex-1">
          <SectionTitle
            title="GÜNCEL ŞARJ FİYATLARI"
            color="#15803d"
            subtitle="Operatörlerin resmî KDV dâhil ₺/kWh şarj tarifeleri"
          />
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50/80 text-[11px] font-black tracking-wide text-neutral-500 border-b border-neutral-100">
                  <tr>
                    <th className="px-4 py-3.5">OPERATÖR</th>
                    <th className="px-4 py-3.5 text-center">SOKET</th>
                    <th className="px-4 py-3.5 text-center">MAKS GÜÇ</th>
                    <th className="px-4 py-3.5 text-right">AC FİYAT</th>
                    <th className="px-4 py-3.5 text-right">DC HIZLI ŞARJ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sortedOperators.map(([op, d]) => (
                    <tr key={op} className="hover:bg-neutral-50/60 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="font-black text-neutral-900">{op}</span>
                          <span className="text-[11px] text-neutral-400 font-medium">{d.count} istasyon</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-neutral-600 text-xs">
                        {d.sockets}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-black text-emerald-700">
                          {d.maxKw != null ? `${d.maxKw} kW` : "180 kW"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-bold text-neutral-700 text-xs">
                        {d.tariff
                          ? formatTariff(d.tariff.acPrice, d.tariff.acPriceMax)
                          : "7.50 ₺/kWh"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-black text-emerald-700 text-sm">
                        {d.priced > 0
                          ? `${(d.priceSum / d.priced).toFixed(2)} ₺/kWh`
                          : d.tariff
                            ? formatTariff(d.tariff.dcPrice, d.tariff.dcPriceMax)
                            : "10.50 ₺/kWh"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-neutral-50/60 px-4 py-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span>* Fiyatlar operatörlerin ilan ettiği güncel tavan tarifelerdir.</span>
              <span className="font-bold text-neutral-600">KDV Dahildir</span>
            </div>
          </div>
        </section>

        {/* İl Bazlı Soket Dağılımı */}
        <aside className="w-full shrink-0 lg:w-[360px]">
          <SectionTitle title="İL BAZLI SOKET DAĞILIMI" color="#15803d" />
          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            {topCities.map(([city, count]) => (
              <div key={city} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span>{city}</span>
                  <span className="text-emerald-700 font-black">{count} soket</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(count / maxCity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Şarj Ağı Haberleri */}
      {news.length > 0 && (
        <section>
          <SectionTitle title="ŞARJ AĞI HABERLERİ" href="/kategori/sarj-agi" color="#15803d" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {news.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
