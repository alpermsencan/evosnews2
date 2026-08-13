import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import TariffTable from "@/components/stations/TariffTable";
import { getByCategory } from "@/lib/queries";
import { IconBolt, IconChevronRight, IconChart } from "@/components/ui/Icons";
import { TIERS, tierSummary, formatTariff, type TierKey } from "@/lib/tariffs";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer.
export const revalidate = 60;

export const metadata = {
  title: "Şarj Fiyatları — Operatör Tarife Karşılaştırması",
  description:
    "Türkiye'deki elektrikli araç şarj operatörlerinin güncel AC, DC hızlı ve DC ultra hızlı şarj tarifeleri (₺/kWh). KDV dâhil liste fiyatları, tek tabloda karşılaştırma.",
};

/** %10 → %80 aralığı: hızlı şarjda pratikte kullanılan pencere. */
const CHARGE_WINDOW = 0.7;

export default async function ChargePricesPage() {
  const [tariffs, batteryAgg, stationCount, news] = await Promise.all([
    prisma.operatorTariff.findMany({
      where: { isActive: true },
      orderBy: { operator: "asc" },
    }),
    prisma.vehicle.aggregate({ _avg: { batteryKwh: true } }),
    prisma.chargeStation.count(),
    getByCategory("sarj-agi", 4),
  ]);

  const summaries = Object.fromEntries(
    TIERS.map((t) => [t.key, tierSummary(tariffs, t.key)]),
  ) as Record<TierKey, ReturnType<typeof tierSummary>>;

  const cheapest = Object.fromEntries(
    TIERS.map((t) => [t.key, summaries[t.key]?.min]),
  ) as Partial<Record<TierKey, number>>;

  // En son doğrulanan satırın tarihi = tablonun tazeliği.
  const verifiedAt = tariffs.reduce<Date | null>((newest, t) => {
    if (!t.verifiedAt) return newest;
    return !newest || t.verifiedAt > newest ? t.verifiedAt : newest;
  }, null);

  // Örnek dolum maliyeti, kataloğun GERÇEK ortalama batarya kapasitesinden
  // hesaplanır; katalog boşsa bölüm hiç gösterilmez.
  const avgBattery = batteryAgg._avg.batteryKwh;
  const sampleKwh = avgBattery ? Math.round(avgBattery * CHARGE_WINDOW) : null;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-volt-dark to-green-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconBolt className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">ŞARJ FİYATLARI</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Türkiye&apos;de faaliyet gösteren halka açık şarj ağlarının ilan ettiği
          ₺/kWh tarifeleri. Tüm fiyatlara KDV dâhildir. Kademeler operatörlerin
          kendi fiyat yapısıyla aynıdır: AC (≤ 22 kW), DC hızlı (&lt; 150 kW) ve
          DC ultra (≥ 150 kW).
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Operatör" value={`${tariffs.length}`} />
          {TIERS.map((t) => (
            <Stat
              key={t.key}
              label={`En ucuz ${t.label.replace("DC ", "").replace("ŞARJ", "").trim()}`}
              value={
                summaries[t.key]
                  ? formatTariff(summaries[t.key]!.min, null)
                  : "—"
              }
              hint={summaries[t.key]?.cheapest?.operator}
            />
          ))}
        </div>
      </header>

      {/* KADEME ÖZETİ — tipik fiyat aralığı */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TIERS.map((t) => {
          const s = summaries[t.key];
          if (!s) return null;
          return (
            <div
              key={t.key}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-black text-neutral-900">{t.label}</h2>
                <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-black text-neutral-500">
                  {t.range}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-volt-dark">
                  {formatTariff(s.median, null)}
                </span>
                <span className="text-[11px] font-bold text-neutral-400">/kWh ortanca</span>
              </div>
              <p className="text-[12px] text-neutral-500">
                {s.count} operatörün tarifesi · {formatTariff(s.min, null)} –{" "}
                {formatTariff(s.max, null)} arası
              </p>
              {sampleKwh && (
                <p className="mt-auto border-t border-neutral-100 pt-2 text-[12px] text-neutral-600">
                  Ortalama bir EV&apos;yi (%10→%80, ~{sampleKwh} kWh) doldurmak{" "}
                  <strong className="font-black text-neutral-900">
                    {Math.round(s.median * sampleKwh).toLocaleString("tr-TR")} ₺
                  </strong>{" "}
                  tutar.
                </p>
              )}
            </div>
          );
        })}
      </section>

      <section>
        <SectionTitle
          title="OPERATÖR TARİFE TABLOSU"
          color="#15803d"
          subtitle="Sütun başlıklarındaki sıralama düğmeleriyle en ucuz operatörü bulun"
        />
        {tariffs.length > 0 ? (
          <TariffTable tariffs={tariffs} cheapest={cheapest} />
        ) : (
          <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
            Henüz doğrulanmış operatör tarifesi girilmedi. Tarifeler{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5">npm run db:tariffs</code>{" "}
            ile aktarılır veya panelden tek tek girilir.
          </p>
        )}
      </section>

      {/* KAYNAK VE UYARILAR */}
      <section className="flex flex-col gap-4 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="text-base font-black text-neutral-900">
            Fiyatlar nereden geliyor?
          </h2>
          <p className="text-[13px] leading-relaxed text-neutral-600">
            Tarifeler operatörlerin kendi yayımladığı liste fiyatlarından
            derlenir; her satır kaynağı ve doğrulama tarihiyle birlikte tutulur.
            Doğrulanmamış hiçbir fiyat tabloya girmez — operatörün o kademede
            hizmeti yoksa hücre &quot;—&quot; kalır.
            {verifiedAt && (
              <>
                {" "}
                Tablodaki son doğrulama:{" "}
                <strong className="font-black text-neutral-900">
                  {verifiedAt.toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
                .
              </>
            )}
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px] text-neutral-600">
            <li>Tüm fiyatlara KDV dâhildir.</li>
            <li>
              Abonelik paketleri, kurumsal anlaşmalar ve ortak kart (roaming)
              kullanımı fiyatı değiştirebilir.
            </li>
            <li>
              Bazı operatörler soket gücüne göre kademeli fiyatlar; bu durumda
              tabloda aralık gösterilir ve detay &quot;Not&quot; sütununda yazar.
            </li>
            <li>Yola çıkmadan önce operatörün uygulamasından teyit edin.</li>
          </ul>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 lg:w-[330px]">
          <IconChart className="h-7 w-7 text-volt-dark" />
          <h2 className="text-base font-black leading-tight text-neutral-900">
            Fiyatı bildiniz, istasyonu bulun
          </h2>
          <p className="text-[13px] text-neutral-600">
            Şarj ağı sayfasında {stationCount.toLocaleString("tr-TR")} istasyonu
            ile, operatöre ve güce göre filtreleyip rota alabilirsiniz.
          </p>
          <Link
            href="/sarj-agi"
            className="mt-auto flex items-center justify-center gap-1 rounded-md bg-volt px-4 py-2.5 text-center text-sm font-black text-white transition hover:bg-volt-dark"
          >
            ŞARJ AĞINI GÖSTER <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
        </aside>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle
            title="ŞARJ AĞI HABERLERİ"
            href="/kategori/sarj-agi"
            color="#15803d"
          />
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

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
      {hint && <span className="truncate text-[10px] text-white/60">{hint}</span>}
    </div>
  );
}
