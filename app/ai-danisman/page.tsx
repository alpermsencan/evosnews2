import { prisma } from "@/lib/prisma";
import AdvisorWizard from "@/components/tools/AdvisorWizard";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import LeadForm from "@/components/ui/LeadForm";
import { getByCategory } from "@/lib/queries";
import { IconSparkles, IconMic, IconCheck } from "@/components/ui/Icons";
import { toDate } from "@/lib/utils";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;
export const metadata = {
  title: "AI Danışman",
  description:
    "Yapay zekâ destekli elektrikli araç danışmanı ve sesli asistan: bütçe, kullanım profili ve şarj imkânına göre kişisel öneri; doğal dilde araç komutları.",
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

/**
 * Sesli asistan hedefleri.
 *
 * Buradaki maddeler ÜRÜN HEDEFİDİR, ölçülmüş sonuç değildir. Daha önce bu
 * bölümde yer alan "%94 komut doğruluğu", "380+ desteklenen komut",
 * "çağrıların %46'sı otomatik çözülüyor" gibi rakamlar hiçbir ölçüme
 * dayanmadığı için kaldırıldı; gerçek ölçüm yapıldığında yöntemiyle birlikte
 * yayımlanmalıdır.
 */
const CAPABILITIES = [
  {
    t: "Bağlam koruma",
    d: "Arka arkaya sorulan soruların önceki komutla ilişkilendirilmesi hedefleniyor.",
  },
  {
    t: "Türkçe doğal dil",
    d: "Günlük konuşma dilini ve kısaltmaları anlaması, komut ezberi gerektirmemesi amaçlanıyor.",
  },
  {
    t: "Şarj ve rota planlama",
    d: "Menzil, şarj durumu ve güzergâh üzerindeki istasyonları birlikte değerlendirmesi hedefleniyor.",
  },
  {
    t: "Araç entegrasyonu",
    d: "Klima, ön koşullandırma ve navigasyon komutlarının araca iletilmesi planlanıyor.",
  },
  {
    t: "Gürültü toleransı",
    d: "Seyir hâlindeki kabin gürültüsünde güvenilir komut algılama üzerinde çalışılıyor.",
  },
  {
    t: "Gizlilik",
    d: "Ses kayıtlarının anonimleştirilmesi ve komut geçmişinin kullanıcı talebiyle silinebilmesi.",
  },
];

export default async function AiAdvisorPage() {
  const [bodyTypes, advisorNews, voiceNews, vehicleCount] = await Promise.all([
    prisma.vehicle.findMany({
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    }),
    getByCategory("ai-danisman", 3),
    getByCategory("voice-intelligence", 3),
    prisma.vehicle.count(),
  ]);

  // İki kategori birleşti; haberler de tek listede, tarihe göre gösterilir.
  // publishedAt önbellekten string olarak dönebilir — toDate ile normalize edilir.
  const news = [...advisorNews, ...voiceNews]
    .filter((a, i, all) => all.findIndex((x) => x.id === a.id) === i)
    .sort((a, b) => toDate(b.publishedAt).getTime() - toDate(a.publishedAt).getTime())
    .slice(0, 6);

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
          toplam maliyet dengesini sizin adınıza kurar. Aynı zekâ, araç içinde
          sesli asistan olarak da çalışır.
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

      {/* --- Sesli asistan (eski Voice Intelligence sayfası) --- */}
      <section
        id="sesli-asistan"
        className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-cyan-600 to-sky-900 p-6 text-white"
      >
        <div className="flex items-center gap-2">
          <IconMic className="h-7 w-7" />
          <h2 className="text-xl font-black sm:text-3xl">SESLİ ASİSTAN</h2>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Şarj planlamasından rota optimizasyonuna kadar aracınızla doğal dilde
          konuşmayı hedefleyen sesli asistan çalışmamız geliştirme aşamasında.
          Kurumsal pilot uygulamalar için aşağıdaki formu kullanabilirsiniz.
        </p>
      </section>

      <section>
        <SectionTitle title="SESLİ ASİSTAN HEDEFLERİ" color="#0891b2" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div
              key={c.t}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <IconCheck className="h-5 w-5 text-cyan-600" />
              <h3 className="text-[15px] font-black text-neutral-900">{c.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">
            Kurumsal entegrasyon talebi
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            AI Danışman ve sesli asistanı filo yönetim sisteminize, çağrı
            merkezinize veya kendi mobil uygulamanıza entegre etmek için
            ekibimizle iletişime geçin.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="ai-danisman" />
        </div>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle
            title="AI DANIŞMAN HABERLERİ"
            href="/kategori/ai-danisman"
            color="#4f46e5"
          />
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
