import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import LeadForm from "@/components/ui/LeadForm";
import { getByCategory } from "@/lib/queries";
import { IconLayers, IconCheck } from "@/components/ui/Icons";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;
export const metadata = {
  title: "Platformu İncele",
  description:
    "Evos platform mimarisi, API'ler, iş ortaklıkları ve kurumsal filo çözümleri.",
};

/**
 * Modül listesi. Yayında OLAN ve OLMAYAN modüller ayrı ayrı işaretlenir;
 * geliştirme aşamasındaki bir modülü yayındaymış gibi göstermek okuyucuyu
 * yanıltır.
 */
const MODULES = [
  { t: "Haber Merkezi", d: "Kaynak beslemelerinden günlük derlenen, yeniden yazılan ve moderasyondan geçen yayın akışı.", href: "/kategori/haber-merkezi", live: true },
  { t: "Araç Veri Tabanı", d: "Türkiye'de satıştaki elektrikli model varyantları; liste fiyatı, teknik veri ve ÖTV oranı.", href: "/araclar", live: true },
  { t: "Şarj Ağı", d: "Open Charge Map açık verisinden tazelenen istasyon envanteri, soket tipleri ve güç kapasiteleri.", href: "/sarj-agi", live: true },
  { t: "AI Danışman", d: "Kullanım profiline göre katalogdan araç önerisi ve beş yıllık maliyet karşılaştırması.", href: "/ai-danisman", live: true },
  { t: "Dijital Garaj", d: "Servis geçmişi, poliçe takibi ve bakım hatırlatmaları. Geliştirme aşamasında.", href: "/dijital-garaj", live: false },
  { t: "Evos Protect", d: "Batarya güvencesi ve genişletilmiş garanti danışmanlığı. Talep toplama aşamasında.", href: "/evos-protect", live: false },
];

/** Gerçekten yayında olan, herkese açık okuma uçları. */
const ENDPOINTS = [
  { m: "GET", p: "/api/articles", d: "Haber listesi (kategori, arama, sayfalama)" },
  { m: "GET", p: "/api/vehicles", d: "Araç kataloğu ve teknik filtreler" },
  { m: "GET", p: "/api/stations", d: "Şarj istasyonları, il/operatör/güç filtreleri" },
  { m: "GET", p: "/api/prices", d: "Aylık fiyat endeksi ve katalogdan türetilen pazar sayaçları" },
  { m: "GET", p: "/api/search", d: "Haber, araç ve istasyonda birleşik arama" },
  { m: "GET", p: "/api/ticker", d: "Üst veri şeridi: TCMB kurları ve katalog sayaçları" },
  { m: "GET", p: "/api/otv", d: "Güncel ÖTV dilimleri" },
  { m: "POST", p: "/api/otv", d: "Matrah ve motor gücünden ÖTV/KDV hesaplar" },
  { m: "POST", p: "/api/advisor", d: "Kullanım profiline göre araç önerisi üretir" },
  { m: "GET", p: "/api/route-to", d: "Bir istasyona gerçek sürüş rotası ve mesafe" },
  { m: "POST", p: "/api/leads", d: "İletişim / teklif talebi kaydeder" },
  { m: "GET", p: "/feed.xml", d: "Yayındaki haberlerin RSS beslemesi" },
];

export default async function PlatformPage() {
  const [news, counts] = await Promise.all([
    getByCategory("platform", 4),
    Promise.all([
      // Yalnızca yayındaki haberler sayılır; moderasyon kuyruğundaki
      // taslakları saymak sayacı şişirir.
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.vehicle.count(),
      prisma.chargeStation.count(),
      prisma.chargeStation.aggregate({ _sum: { socketCount: true } }),
    ]),
  ]);

  const [articleCount, vehicleCount, stationCount, socketAgg] = counts;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconLayers className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">PLATFORMU İNCELE</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Evos; haber yayıncılığı, araç verisi, şarj altyapısı ve yapay zekâ
          servislerini tek veri modelinde birleştiren bütünleşik bir mobilite
          platformudur. Aşağıdaki sayaçlar veri tabanındaki güncel kayıt
          sayılarıdır.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Yayındaki haber" value={`${articleCount}`} />
          <Stat label="Araç varyantı" value={`${vehicleCount}`} />
          <Stat label="Şarj istasyonu" value={`${stationCount}`} />
          <Stat label="Toplam soket" value={`${socketAgg._sum.socketCount ?? 0}`} />
        </div>
      </header>

      <section>
        <SectionTitle title="PLATFORM MODÜLLERİ" color="#334155" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m) => (
            <Link
              key={m.t}
              href={m.href}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5 transition hover:border-evos hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-black text-neutral-900">{m.t}</h3>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-[9px] font-black text-white ${
                    m.live ? "bg-volt" : "bg-neutral-400"
                  }`}
                >
                  {m.live ? "YAYINDA" : "GELİŞTİRİLİYOR"}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed text-neutral-600">{m.d}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="AÇIK API UÇLARI" color="#334155" />
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] font-black tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">METOT</th>
                <th className="px-4 py-3">UÇ NOKTA</th>
                <th className="px-4 py-3">AÇIKLAMA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {ENDPOINTS.map((e) => (
                <tr key={e.p + e.m} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-black text-white ${
                        e.m === "GET" ? "bg-volt" : "bg-evos"
                      }`}
                    >
                      {e.m}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[13px] font-bold text-neutral-800">
                    {e.p}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">{e.d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionTitle title="TEKNOLOJİ MİMARİSİ" color="#334155" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { t: "Next.js App Router", d: "Sunucu bileşenleriyle veri tabanına doğrudan erişim; ek API katmanı gecikmesi olmadan render." },
            { t: "MongoDB + Prisma", d: "Şema doğrulamalı, tip güvenli veri erişimi. İndekslenmiş sorgularla düşük gecikme." },
            { t: "Tailwind CSS", d: "Mobil öncelikli, flexbox tabanlı responsive arayüz; tek tema üzerinden tutarlı tasarım." },
          ].map((x) => (
            <div key={x.t} className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
              <IconCheck className="h-5 w-5 text-volt" />
              <h3 className="text-[15px] font-black text-neutral-900">{x.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="iletisim"
        className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">İletişim ve iş ortaklığı</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Filo entegrasyonu, API erişimi, reklam ve içerik iş birliği için
            formu doldurun. Talepleriniz yönetim paneline anlık düşer.
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-neutral-600">
            <li>• Kurumsal filo çözümleri</li>
            <li>• Şarj operatörü entegrasyonu</li>
            <li>• Veri lisanslama</li>
          </ul>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="platform" />
        </div>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle title="PLATFORM HABERLERİ" href="/kategori/platform" color="#334155" />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}
