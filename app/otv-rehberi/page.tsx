import { prisma } from "@/lib/prisma";
import OtvCalculator from "@/components/tools/OtvCalculator";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";
import { IconTag } from "@/components/ui/Icons";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;
export const metadata = {
  title: "ÖTV Rehberi",
  description:
    "Elektrikli araçlarda ÖTV matrah dilimleri, oranlar ve etiket fiyatı hesaplama rehberi.",
};

export default async function OtvPage() {
  const [brackets, vehicles, news] = await Promise.all([
    prisma.otvBracket.findMany({ orderBy: { order: "asc" } }),
    prisma.vehicle.findMany({
      orderBy: { price: "asc" },
      select: { slug: true, brand: true, model: true, price: true, motorPowerKw: true, otvRate: true },
    }),
    getByCategory("otv-rehberi", 4),
  ]);

  const byRate = new Map<number, number>();
  for (const v of vehicles) byRate.set(v.otvRate, (byRate.get(v.otvRate) ?? 0) + 1);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-violet-700 to-purple-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconTag className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">2026 ÖTV REHBERİ</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          2026 yılı güncel mevzuatına göre elektrikli otomobillerde ÖTV; motor gücü ve matrah tutarına göre
          belirleniyor. Aşağıdaki hesaplayıcı ile matrahtan etiket fiyatına
          giden yolu adım adım görebilirsiniz.
        </p>
      </header>

      <OtvCalculator vehicles={vehicles} />

      <section>
        <SectionTitle title="GÜNCEL ÖTV DİLİMLERİ" color="#7c3aed" />
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">DİLİM</th>
                <th className="px-4 py-3">MOTOR GÜCÜ</th>
                <th className="px-4 py-3">MATRAH</th>
                <th className="px-4 py-3">ORAN</th>
                <th className="px-4 py-3">MODEL SAYISI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {brackets.map((b) => (
                <tr key={b.id} className="align-top hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className="font-bold text-neutral-900">{b.label}</span>
                    {b.note && (
                      <p className="mt-1 text-xs text-neutral-500">{b.note}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {b.motorMaxKw >= 999 ? "160 kW üzeri" : `≤ ${b.motorMaxKw} kW`}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {b.priceMax >= 999_000_000
                      ? `${formatTL(b.priceMin, { compact: true })} üzeri`
                      : `${formatTL(b.priceMax, { compact: true })} altı`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-violet-100 px-2 py-1 text-sm font-black text-violet-700">
                      %{b.rate}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-neutral-700">
                    {byRate.get(b.rate) ?? 0} model
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionTitle title="MODELLERE GÖRE ÖTV YÜKÜ" color="#7c3aed" />
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">MODEL</th>
                <th className="px-4 py-3">MOTOR</th>
                <th className="px-4 py-3">ÖTV ORANI</th>
                <th className="px-4 py-3">TAHMİNİ MATRAH</th>
                <th className="px-4 py-3 text-right">ETİKET FİYATI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {vehicles.map((v) => {
                const base = Math.round(v.price / (1.2 * (1 + v.otvRate / 100)));
                return (
                  <tr key={v.slug} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-bold text-neutral-900">
                      {v.brand} {v.model}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{v.motorPowerKw} kW</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-violet-50 px-2 py-1 text-xs font-black text-violet-700">
                        %{v.otvRate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatTL(base)}</td>
                    <td className="px-4 py-3 text-right font-black text-evos">
                      {formatTL(v.price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            t: "Matrah nedir?",
            d: "ÖTV matrahı, aracın vergiler hariç satış bedelidir. Distribütör iskontoları ve donanım paketleri matrahı doğrudan etkiler.",
          },
          {
            t: "Neden dilim önemli?",
            d: "Matrah sınırının 1 TL üzerine çıkmak, oranın %10'dan %40'a sıçramasına ve etiket fiyatının yüzlerce bin TL artmasına yol açabilir.",
          },
          {
            t: "KDV nasıl hesaplanır?",
            d: "KDV, matrah ve ÖTV toplamı üzerinden %20 olarak hesaplanır. Yani ÖTV üzerinden de KDV ödenir.",
          },
        ].map((c) => (
          <div
            key={c.t}
            className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
          >
            <h3 className="text-base font-black text-neutral-900">{c.t}</h3>
            <p className="text-sm leading-relaxed text-neutral-600">{c.d}</p>
          </div>
        ))}
      </section>

      <section>
        <SectionTitle title="ÖTV HABERLERİ" href="/kategori/otv-rehberi" color="#7c3aed" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
