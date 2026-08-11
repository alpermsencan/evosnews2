import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import LeadForm from "@/components/ui/LeadForm";
import { getByCategory } from "@/lib/queries";
import { IconCheck, IconShield } from "@/components/ui/Icons";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;
export const metadata = {
  title: "Evos Protect",
  description:
    "Elektrikli araçlar için batarya güvencesi, genişletilmiş garanti ve yol yardım paketleri hakkında bilgi alın.",
};

/**
 * Bu sayfa bir TANITIM ve TALEP TOPLAMA sayfasıdır.
 *
 * Daha önce burada yer alan paket fiyatları ("4.900 ₺/yıl"), anlaşmalı servis
 * sayısı ve kapsam vaatleri gerçek bir ürüne dayanmıyordu; kaldırıldı.
 * Fiyat ve kapsam ancak gerçek bir poliçe/ürün tanımlandığında, doğrulanmış
 * verisiyle birlikte yayımlanmalıdır.
 */

/** Kapsam başlıkları — fiyat veya sayısal vaat içermez. */
const TOPICS = [
  {
    t: "Batarya kapasite güvencesi",
    d: "Üretici garantisi sona erdikten sonra kapasite kaybına karşı ek koruma seçenekleri.",
  },
  {
    t: "Genişletilmiş garanti",
    d: "Elektrikli aktarma organları ve şarj donanımı için üretici garantisi sonrası kapsam.",
  },
  {
    t: "Yol yardım ve çekici",
    d: "Şarjı biten veya arızalanan aracın en yakın şarj noktasına ya da servise ulaştırılması.",
  },
  {
    t: "Mobil şarj desteği",
    d: "Yolda kalma durumunda araca yerinde enerji aktarımı hizmetinin kapsama alınması.",
  },
];

export default async function ProtectPage() {
  const news = await getByCategory("evos-protect", 4);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconShield className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">EVOS PROTECT</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Elektrikli aracın en değerli parçası bataryadır. Evos Protect,
          batarya güvencesi ve genişletilmiş garanti ihtiyacınızı anlamak için
          kurulan danışma hattıdır. İhtiyacınızı iletin, size uygun kapsam ve
          fiyatlandırmayı çalışıp dönelim.
        </p>
      </header>

      <section>
        <SectionTitle title="HANGİ KONULARDA DESTEK VERİYORUZ?" color="#1d4ed8" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TOPICS.map((p) => (
            <div
              key={p.t}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <IconCheck className="h-5 w-5 text-blue-600" />
              <h3 className="text-[15px] font-black text-neutral-900">{p.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="teklif"
        className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Bilgi ve teklif talebi</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Aracınızın marka, model ve yılını mesaj kısmında belirtin. Kapsam ve
            fiyatlandırma araç değerine, yaşına ve yıllık kilometrenize göre
            değiştiği için hazır bir liste fiyatı yayımlamıyoruz; talebinizi
            aldıktan sonra size özel bilgilendirme yapıyoruz.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="evos-protect" />
        </div>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle title="PROTECT HABERLERİ" href="/kategori/evos-protect" color="#1d4ed8" />
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
