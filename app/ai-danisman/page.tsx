import { prisma } from "@/lib/prisma";
import AdvisorWizard from "@/components/tools/AdvisorWizard";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import { getByCategory } from "@/lib/queries";
import { IconSparkles } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "AI Danışman",
  description:
    "Yapay zekâ destekli elektrikli araç danışmanı: bütçe, kullanım profili ve şarj imkânına göre kişisel öneri.",
};

const FEATURES = [
  {
    t: "Kullanım profili analizi",
    d: "Günlük kilometreniz, uzun yol sıklığınız ve şarj imkânınız birlikte değerlendirilir; menzil ihtiyacınız gerçek kullanıma göre hesaplanır.",
  },
  {
    t: "Toplam sahip olma maliyeti",
    d: "Enerji, bakım ve tahmini değer kaybı birleştirilerek 5 yıllık gerçek maliyet çıkarılır. Sadece etiket fiyatına bakmazsınız.",
  },
  {
    t: "Gerekçeli öneri",
    d: "Her öneri için hangi kriterin belirleyici olduğu açıkça listelenir. Kararın arkasındaki mantığı görürsünüz.",
  },
  {
    t: "Canlı veri",
    d: "Öneriler, Evos veri tabanındaki güncel araç, fiyat ve şarj tarifesi verileri üzerinden anlık üretilir.",
  },
];

export default async function AiAdvisorPage() {
  const [bodyTypes, news, vehicleCount] = await Promise.all([
    prisma.vehicle.findMany({
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    }),
    getByCategory("ai-danisman", 3),
    prisma.vehicle.count(),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-800 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconSparkles className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">AI DANIŞMAN</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Evos AI Danışman, veri tabanındaki {vehicleCount} model varyantını
          kullanım profilinize göre puanlar; menzil, şarj hızı, tüketim ve
          toplam maliyet dengesini sizin adınıza kurar.
        </p>
      </header>

      <AdvisorWizard bodyTypes={bodyTypes.map((b) => b.bodyType)} />

      <section>
        <SectionTitle title="DANIŞMAN NASIL ÇALIŞIYOR?" color="#4f46e5" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <div
              key={f.t}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">
                {i + 1}
              </span>
              <h3 className="text-[15px] font-black text-neutral-900">{f.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle title="AI DANIŞMAN HABERLERİ" href="/kategori/ai-danisman" color="#4f46e5" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {news.map((a) => (
              <NewsCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
