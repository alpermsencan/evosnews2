import { prisma } from "@/lib/prisma";
import LineChart from "@/components/tools/LineChart";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";
import { IconChart } from "@/components/ui/Icons";
import AiPriceEstimator from "@/components/tools/AiPriceEstimator";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;
export const metadata = {
  title: "Fiyat Analizi",
  description:
    "Türkiye'de satıştaki elektrikli araçların fiyat, menzil ve segment analizi; kilometre başına enerji maliyeti.",
};

/**
 * FİYAT ANALİZİ
 *
 * Sayfadaki her rakam sitedeki gerçek kayıtlardan hesaplanır:
 *  - Fiyat/menzil/segment analizi → araç kataloğu (üretici liste fiyatları)
 *  - Şarj maliyeti → operatörün doğrulayıp girdiği istasyon tarifeleri
 *  - Aylık seri → her ay kaydedilen katalog anlık görüntüleri
 *
 * Batarya hücre maliyeti ve EV pazar payı gibi göstergeler için ücretsiz ve
 * güvenilir bir veri kaynağı bulunmadığından bu sayfada YER ALMAZ; ilgili
 * bölümler ancak operatör doğrulanmış veri girerse görünür.
 */
export default async function PriceAnalysisPage() {
  const [index, vehicles, pricedStations, news] = await Promise.all([
    prisma.priceIndex.findMany({ orderBy: { order: "asc" }, take: 24 }),
    prisma.vehicle.findMany({ orderBy: { price: "asc" } }),
    prisma.chargeStation.findMany({
      where: { pricePerKwh: { not: null } },
      select: { pricePerKwh: true, isFast: true },
    }),
    getByCategory("fiyat-analizi", 4),
  ]);

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
        <Header />
        <p className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          Araç kataloğu henüz doldurulmadı. Analizler katalog verisinden
          hesaplandığı için burada gösterilecek bir şey yok.
        </p>
      </div>
    );
  }

  const avgPrice = Math.round(vehicles.reduce((a, v) => a + v.price, 0) / vehicles.length);
  const avgRange = Math.round(vehicles.reduce((a, v) => a + v.rangeKm, 0) / vehicles.length);
  const avgConsumption = vehicles.reduce((a, v) => a + v.consumption, 0) / vehicles.length;
  const cheapest = vehicles[0];
  const longest = [...vehicles].sort((a, b) => b.rangeKm - a.rangeKm)[0];

  // Aylık seri en az iki nokta olunca anlam kazanır; tek anlık görüntüyle
  // "trend" çizmek yanıltıcı olur.
  const hasTrend = index.length >= 2;
  const trendChange = hasTrend
    ? (
        ((index[index.length - 1].avgEvPrice - index[0].avgEvPrice) / index[0].avgEvPrice) *
        100
      ).toFixed(1)
    : null;

  // Segment bazlı ortalama fiyat ve menzil
  const bySegment = new Map<string, { total: number; count: number; range: number }>();
  for (const v of vehicles) {
    const cur = bySegment.get(v.segment) ?? { total: 0, count: 0, range: 0 };
    cur.total += v.price;
    cur.range += v.rangeKm;
    cur.count += 1;
    bySegment.set(v.segment, cur);
  }

  // Menzil başına maliyet: bütçeye göre en verimli modeli gösteren gerçek ölçüt.
  const perKm = [...vehicles]
    .map((v) => ({ ...v, costPerKm: Math.round(v.price / v.rangeKm) }))
    .sort((a, b) => a.costPerKm - b.costPerKm)
    .slice(0, 10);

  // Şarj maliyeti yalnızca operatörün doğruladığı tarifelerden hesaplanır.
  const avgOf = (rows: { pricePerKwh: number | null }[]) =>
    rows.length
      ? rows.reduce((a, s) => a + (s.pricePerKwh ?? 0), 0) / rows.length
      : null;

  const dcTariff = avgOf(pricedStations.filter((s) => s.isFast));
  const acTariff = avgOf(pricedStations.filter((s) => !s.isFast));

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <Header modelCount={vehicles.length} />

      {/* AI DESTEKLİ FİYAT TAHMİNİ */}
      <section className="my-2">
        <AiPriceEstimator />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Ortalama liste fiyatı" value={formatTL(avgPrice, { compact: true })} sub={trendChange ? `%${trendChange} (kayıt başlangıcından beri)` : undefined} />
        <Stat label="Ortalama menzil" value={`${avgRange} km`} />
        <Stat
          label="En uygun fiyatlı"
          value={formatTL(cheapest.price, { compact: true })}
          sub={`${cheapest.brand} ${cheapest.model}`}
        />
        <Stat
          label="En uzun menzil"
          value={`${longest.rangeKm} km`}
          sub={`${longest.brand} ${longest.model}`}
        />
      </div>

      {hasTrend ? (
        <section>
          <SectionTitle title="ORTALAMA LİSTE FİYATI (AYLIK)" color="#b45309" />
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <LineChart
              labels={index.map((i) => i.month)}
              series={[
                {
                  label: "Katalog ortalaması",
                  color: "#e30613",
                  values: index.map((i) => i.avgEvPrice),
                },
              ]}
            />
            <p className="mt-2 text-[11px] text-neutral-500">
              Seri, katalogdaki modellerin liste fiyatlarından her ay
              hesaplanan anlık görüntülerden oluşur.
            </p>
          </div>
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-5 text-center text-xs text-neutral-500">
          Aylık fiyat serisi bu ay kaydedilmeye başlandı. Grafik ikinci aydan
          itibaren görünecek — geçmişe dönük veri uydurulmuyor.
        </p>
      )}

      <section>
        <SectionTitle title="MENZİL BAŞINA MALİYET (₺ / km)" color="#b45309" />
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">MODEL</th>
                <th className="px-4 py-3">MENZİL</th>
                <th className="px-4 py-3">FİYAT</th>
                <th className="px-4 py-3 text-right">KM BAŞINA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {perKm.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold text-neutral-900">
                    {v.brand} {v.model}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{v.rangeKm} km</td>
                  <td className="px-4 py-3 text-neutral-600">{formatTL(v.price)}</td>
                  <td className="px-4 py-3 text-right font-black text-evos">
                    {formatTL(v.costPerKm)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-neutral-500">
          Etiket fiyatının gerçek menzile bölümü. Düşük değer, satın alınan her
          kilometrelik menzilin daha ucuza geldiği anlamına gelir.
        </p>
      </section>

      <section>
        <SectionTitle title="100 KİLOMETRE ENERJİ MALİYETİ" color="#15803d" />
        {dcTariff == null && acTariff == null ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-5 text-center text-xs text-neutral-500">
            Şarj tarifesi karşılaştırması için doğrulanmış operatör fiyatı
            gerekiyor. Tarifeler yönetim panelinden girildiğinde bu bölüm
            otomatik olarak dolar — tahmini fiyat gösterilmiyor.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {dcTariff != null && (
                <CostCard
                  label="DC hızlı şarj"
                  value={`${(avgConsumption * dcTariff).toFixed(0)} ₺`}
                  sub={`${dcTariff.toFixed(2)} ₺/kWh ortalama`}
                  color="bg-amber-600"
                />
              )}
              {acTariff != null && (
                <CostCard
                  label="Halka açık AC"
                  value={`${(avgConsumption * acTariff).toFixed(0)} ₺`}
                  sub={`${acTariff.toFixed(2)} ₺/kWh ortalama`}
                  color="bg-cyan-600"
                />
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Hesaplama, katalogdaki araçların ortalama{" "}
              {avgConsumption.toFixed(1)} kWh/100 km tüketimi ve{" "}
              {pricedStations.length} istasyonun doğrulanmış tarifesi baz alınarak
              yapılmıştır.
            </p>
          </>
        )}
      </section>

      <section>
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

      {news.length > 0 && (
        <section>
          <SectionTitle title="FİYAT ANALİZİ HABERLERİ" href="/kategori/fiyat-analizi" color="#b45309" />
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

function Header({ modelCount }: { modelCount?: number }) {
  return (
    <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-amber-600 to-orange-800 p-6 text-white">
      <div className="flex items-center gap-2">
        <IconChart className="h-7 w-7" />
        <h1 className="text-2xl font-black sm:text-4xl">FİYAT ANALİZİ</h1>
      </div>
      <p className="max-w-3xl text-sm text-white/85 sm:text-base">
        {modelCount
          ? `Türkiye'de satıştaki ${modelCount} elektrikli model varyantının liste fiyatı, menzili ve segment dağılımı. Tüm rakamlar katalogdaki gerçek kayıtlardan hesaplanır.`
          : "Türkiye'de satıştaki elektrikli modellerin liste fiyatı, menzili ve segment dağılımı."}
      </p>
    </header>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <span className="text-[11px] font-semibold text-neutral-500">{label}</span>
      <span className="text-lg font-black text-neutral-900">{value}</span>
      {sub && <span className="text-[10px] text-neutral-400">{sub}</span>}
    </div>
  );
}

function CostCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4">
      <span className="text-[11px] font-bold text-neutral-500">{label}</span>
      <span className="text-2xl font-black text-neutral-900">{value}</span>
      <span className="text-[10px] text-neutral-400">{sub}</span>
      <div className={`h-1 w-10 rounded-full ${color}`} />
    </div>
  );
}
