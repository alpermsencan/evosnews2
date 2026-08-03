import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { formatTL } from "@/lib/utils";
import { IconBattery, IconCheck, IconLayers } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dijital Garaj",
  description:
    "Aracınızın dijital ikizi: bakım takibi, batarya sağlığı, sigorta poliçeleri ve servis geçmişi.",
};

const TIMELINE = [
  { d: "12 Temmuz 2026", t: "Periyodik bakım", n: "40.000 km bakımı yapıldı · Kabin filtresi değişti", ok: true },
  { d: "3 Mayıs 2026", t: "Batarya kapasite ölçümü", n: "Kalan kapasite %96,4 · Hücre dengesi normal", ok: true },
  { d: "18 Şubat 2026", t: "Lastik değişimi", n: "4 adet EV özel yaz lastiği takıldı", ok: true },
  { d: "9 Ocak 2026", t: "Yazılım güncellemesi", n: "OTA 4.2.1 · Şarj eğrisi optimizasyonu", ok: true },
  { d: "22 Ekim 2025", t: "Kasko yenileme", n: "Poliçe 1 yıl uzatıldı", ok: true },
];

const FEATURES = [
  { t: "Servis geçmişi entegrasyonu", d: "9 marka için yetkili servis kayıtları şase doğrulaması sonrası otomatik aktarılır." },
  { t: "Batarya sağlık takibi", d: "Yıllık ölçüm sonuçları grafik olarak saklanır, kapasite eğrinizi zaman içinde görürsünüz." },
  { t: "Bakım hatırlatmaları", d: "Kilometre ve tarih bazlı hatırlatmalar; lastik, fren hidroliği, filtre kalemleri ayrı takip edilir." },
  { t: "Poliçe yönetimi", d: "Kasko ve trafik poliçeleri yüklenir, bitişten 30 gün önce yenileme bildirimi gelir." },
  { t: "Şarj harcama raporu", d: "Ev ve halka açık şarj harcamalarınız aylık olarak raporlanır, kilometre maliyeti hesaplanır." },
  { t: "Tek tıkla ilan", d: "Garaj kaydınızı Evos Market ilanına aktararak doğrulanmış geçmişle daha hızlı satış yapın." },
];

export default async function GaragePage() {
  const [vehicle, news] = await Promise.all([
    prisma.vehicle.findFirst({ where: { isFeatured: true }, orderBy: { rangeKm: "desc" } }),
    getByCategory("dijital-garaj", 4),
  ]);

  const health = 96;
  const kmDriven = 42380;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-sky-700 to-blue-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconLayers className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">DİJİTAL GARAJ</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Aracınızın tüm yaşam döngüsü tek ekranda: bakım, batarya sağlığı,
          sigorta, şarj harcamaları ve satış geçmişi.
        </p>
      </header>

      {/* DEMO GARAJ KARTI */}
      {vehicle && (
        <section>
          <SectionTitle title="ÖRNEK GARAJ GÖRÜNÜMÜ" color="#0369a1" />
          <div className="flex flex-col gap-5 overflow-hidden rounded-lg border border-neutral-200 bg-white p-5 lg:flex-row">
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 lg:w-[340px]">
              <Image
                src={vehicle.image}
                alt={`${vehicle.brand} ${vehicle.model}`}
                fill
                sizes="340px"
                className="object-cover"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xl font-black text-neutral-900">
                  {vehicle.brand} {vehicle.model}
                </h3>
                <span className="rounded bg-sky-100 px-2 py-1 text-[11px] font-black text-sky-700">
                  34 EVS 2026
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Toplam km" value={kmDriven.toLocaleString("tr-TR")} />
                <Metric label="Batarya sağlığı" value={`%${health}`} good />
                <Metric label="Tahmini değer" value={formatTL(Math.round(vehicle.price * 0.78), { compact: true })} />
                <Metric label="Sonraki bakım" value="7.620 km" />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500">
                  <span className="flex items-center gap-1">
                    <IconBattery className="h-3.5 w-3.5 text-volt" />
                    BATARYA KAPASİTE EĞRİSİ
                  </span>
                  <span>{vehicle.batteryKwh} kWh nominal</span>
                </div>
                <div className="flex items-end gap-1.5">
                  {[100, 99, 98, 98, 97, 97, 96, 96].map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-volt/80"
                        style={{ height: `${(v - 90) * 8}px` }}
                      />
                      <span className="text-[9px] font-bold text-neutral-400">%{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link
                  href="/evos-protect"
                  className="flex-1 rounded-md bg-sky-700 px-4 py-2.5 text-center text-sm font-black text-white transition hover:bg-sky-800"
                >
                  GARANTİ EKLE
                </Link>
                <Link
                  href="/marketplace"
                  className="flex-1 rounded-md border border-neutral-300 px-4 py-2.5 text-center text-sm font-bold text-neutral-700 transition hover:border-evos hover:text-evos"
                >
                  İLANA DÖNÜŞTÜR
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="min-w-0 flex-1">
          <SectionTitle title="ARAÇ GEÇMİŞİ" color="#0369a1" />
          <ol className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {TIMELINE.map((t) => (
              <li
                key={t.d}
                className="flex items-start gap-3 border-b border-neutral-100 p-4 last:border-0"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-volt/10 text-volt">
                  <IconCheck className="h-4 w-4" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[11px] font-bold text-neutral-400">{t.d}</span>
                  <span className="text-[15px] font-black text-neutral-900">{t.t}</span>
                  <span className="text-[13px] text-neutral-600">{t.n}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="min-w-0 flex-1">
          <SectionTitle title="ÖZELLİKLER" color="#0369a1" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.t}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4"
              >
                <h3 className="text-[14px] font-black text-neutral-900">{f.t}</h3>
                <p className="text-[13px] leading-relaxed text-neutral-600">{f.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section>
        <SectionTitle title="DİJİTAL GARAJ HABERLERİ" href="/kategori/dijital-garaj" color="#0369a1" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex flex-col rounded-md bg-neutral-50 px-3 py-2">
      <span className="text-[10px] font-bold text-neutral-400">{label}</span>
      <span className={`text-[15px] font-black ${good ? "text-volt-dark" : "text-neutral-800"}`}>
        {value}
      </span>
    </div>
  );
}
