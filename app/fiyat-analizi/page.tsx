import { prisma } from "@/lib/prisma";
import LineChart from "@/components/tools/LineChart";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";
import { IconChart } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Fiyat Analizi",
  description:
    "Evos Fiyat Endeksi: elektrikli araç fiyatları, şarj maliyetleri, batarya fiyatları ve pazar payı.",
};

export default async function PriceAnalysisPage() {
  const [index, vehicles, listings, news] = await Promise.all([
    prisma.priceIndex.findMany({ orderBy: { order: "asc" } }),
    prisma.vehicle.findMany({ orderBy: { price: "asc" } }),
    prisma.listing.findMany(),
    getByCategory("fiyat-analizi", 4),
  ]);

  const labels = index.map((i) => i.month);
  const first = index[0];
  const last = index[index.length - 1];

  const evChange = (((last.avgEvPrice - first.avgEvPrice) / first.avgEvPrice) * 100).toFixed(1);
  const iceChange = (((last.avgIcePrice - first.avgIcePrice) / first.avgIcePrice) * 100).toFixed(1);
  const batteryChange = (((last.batteryUsd - first.batteryUsd) / first.batteryUsd) * 100).toFixed(1);

  // Segment bazlı ortalama fiyat
  const bySegment = new Map<string, { total: number; count: number; range: number }>();
  for (const v of vehicles) {
    const cur = bySegment.get(v.segment) ?? { total: 0, count: 0, range: 0 };
    cur.total += v.price;
    cur.range += v.rangeKm;
    cur.count += 1;
    bySegment.set(v.segment, cur);
  }

  // İkinci el değer kaybı (aynı marka sıfır fiyatına göre)
  const depreciation = listings
    .map((l) => {
      const zero = vehicles.find((v) => v.brand === l.brand);
      if (!zero) return null;
      const loss = ((zero.price - l.price) / zero.price) * 100;
      return {
        title: l.title,
        brand: l.brand,
        year: l.year,
        km: l.km,
        price: l.price,
        zeroPrice: zero.price,
        loss: Number(loss.toFixed(1)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.loss - b!.loss)
    .slice(0, 10) as {
    title: string;
    brand: string;
    year: number;
    km: number;
    price: number;
    zeroPrice: number;
    loss: number;
  }[];

  // 100 km maliyet karşılaştırması
  const avgConsumption =
    vehicles.reduce((a, v) => a + v.consumption, 0) / vehicles.length;
  const homeCost = (avgConsumption * 2.8).toFixed(0);
  const acCost = (avgConsumption * last.acChargeCost).toFixed(0);
  const dcCost = (avgConsumption * last.dcChargeCost).toFixed(0);
  const fuel = last.fuelCost.toFixed(0);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-amber-600 to-orange-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconChart className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">FİYAT ANALİZİ</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Evos Fiyat Endeksi; 38 marka ve 214 varyantın liste fiyatları, şarj
          tarifeleri ve batarya maliyetleri üzerinden aylık olarak hesaplanır.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Ortalama EV fiyatı" value={formatTL(last.avgEvPrice, { compact: true })} sub={`%${evChange} (12 ay)`} />
          <Stat label="Benzinli ortalama" value={formatTL(last.avgIcePrice, { compact: true })} sub={`%${iceChange} (12 ay)`} />
          <Stat label="Batarya maliyeti" value={`${last.batteryUsd} $/kWh`} sub={`%${batteryChange} (12 ay)`} />
          <Stat label="EV pazar payı" value={`%${last.evShare}`} sub={`${first.evShare} → ${last.evShare}`} />
        </div>
      </header>

      <section>
        <SectionTitle title="ORTALAMA ARAÇ FİYATI (12 AY)" color="#b45309" />
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <LineChart
            labels={labels}
            series={[
              {
                label: "Elektrikli ortalama",
                color: "#e30613",
                values: index.map((i) => i.avgEvPrice),
              },
              {
                label: "Benzinli ortalama",
                color: "#334155",
                values: index.map((i) => i.avgIcePrice),
              },
            ]}
          />
        </div>
      </section>

      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="min-w-0 flex-1">
          <SectionTitle title="ŞARJ MALİYETİ (₺/kWh)" color="#15803d" />
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <LineChart
              height={190}
              labels={labels}
              series={[
                { label: "DC hızlı şarj", color: "#15803d", values: index.map((i) => i.dcChargeCost) },
                { label: "AC şarj", color: "#0891b2", values: index.map((i) => i.acChargeCost) },
              ]}
            />
          </div>
        </section>

        <section className="min-w-0 flex-1">
          <SectionTitle title="BATARYA MALİYETİ ($/kWh)" color="#9333ea" />
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <LineChart
              height={190}
              labels={labels}
              series={[
                { label: "Hücre maliyeti", color: "#9333ea", values: index.map((i) => i.batteryUsd) },
              ]}
            />
          </div>
        </section>
      </div>

      <section>
        <SectionTitle title="100 KİLOMETRE MALİYET KARŞILAŞTIRMASI" color="#b45309" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CostCard label="Ev şarjı (gece)" value={`${homeCost} ₺`} color="bg-volt" pct={100} />
          <CostCard label="Halka açık AC" value={`${acCost} ₺`} color="bg-cyan-600" pct={(Number(acCost) / Number(fuel)) * 100} />
          <CostCard label="DC hızlı şarj" value={`${dcCost} ₺`} color="bg-amber-600" pct={(Number(dcCost) / Number(fuel)) * 100} />
          <CostCard label="Benzinli araç" value={`${fuel} ₺`} color="bg-evos" pct={100} />
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Hesaplama, filodaki araçların ortalama {avgConsumption.toFixed(1)}{" "}
          kWh/100 km tüketimi baz alınarak yapılmıştır.
        </p>
      </section>

      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="min-w-0 flex-1">
          <SectionTitle title="SEGMENT BAZLI ORTALAMA FİYAT" color="#b45309" />
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">SEGMENT</th>
                  <th className="px-4 py-3">MODEL</th>
                  <th className="px-4 py-3">ORT. MENZİL</th>
                  <th className="px-4 py-3 text-right">ORT. FİYAT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {[...bySegment.entries()]
                  .sort((a, b) => a[1].total / a[1].count - b[1].total / b[1].count)
                  .map(([seg, d]) => (
                    <tr key={seg} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-bold text-neutral-900">{seg}</td>
                      <td className="px-4 py-3 text-neutral-600">{d.count}</td>
                      <td className="px-4 py-3 text-neutral-600">
                        {Math.round(d.range / d.count)} km
                      </td>
                      <td className="px-4 py-3 text-right font-black text-evos">
                        {formatTL(Math.round(d.total / d.count))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 flex-1">
          <SectionTitle title="İKİNCİ EL DEĞER KAYBI" color="#be123c" />
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">İLAN</th>
                  <th className="px-4 py-3">YIL</th>
                  <th className="px-4 py-3 text-right">DEĞER KAYBI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {depreciation.map((d) => (
                  <tr key={d.title} className="hover:bg-neutral-50">
                    <td className="max-w-[220px] truncate px-4 py-3 font-bold text-neutral-900">
                      {d.title}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{d.year}</td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded px-2 py-1 text-xs font-black text-white ${
                          d.loss < 25 ? "bg-volt" : d.loss < 40 ? "bg-amber-600" : "bg-evos"
                        }`}
                      >
                        %{d.loss}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section>
        <SectionTitle title="FİYAT ANALİZİ HABERLERİ" href="/kategori/fiyat-analizi" color="#b45309" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
      {sub && <span className="text-[10px] text-white/60">{sub}</span>}
    </div>
  );
}

function CostCard({
  label,
  value,
  color,
  pct,
}: {
  label: string;
  value: string;
  color: string;
  pct: number;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4">
      <span className="text-[11px] font-bold text-neutral-500">{label}</span>
      <span className="text-2xl font-black text-neutral-900">{value}</span>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
