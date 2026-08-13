import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import LeadForm from "@/components/ui/LeadForm";
import { getByCategory } from "@/lib/queries";
import { IconLayers } from "@/components/ui/Icons";
import { prisma } from "@/lib/prisma";
import GarageExplorer from "@/components/tools/GarageExplorer";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;
export const metadata = {
  title: "Dijital Garaj",
  description:
    "Aracınızın bakım geçmişi, batarya sağlığı ve şarj harcamalarını tek yerde toplayacak dijital garaj çalışması.",
};

/**
 * Bu sayfa bir ÜRÜN TANITIM sayfasıdır.
 *
 * Daha önce burada bir "örnek garaj" kartı vardı: uydurma plaka (34 EVS 2026),
 * uydurma kilometre, uydurma batarya sağlığı ve uydurma servis geçmişi. Gerçek
 * bir kullanıcı verisi gibi göründüğü için tamamı kaldırıldı. Modül hayata
 * geçtiğinde bu bölüm oturum açmış kullanıcının GERÇEK aracını göstermelidir.
 */

const FEATURES = [
  {
    t: "Servis geçmişi",
    d: "Yetkili servis kayıtlarının şase doğrulaması sonrası tek bir zaman çizelgesinde toplanması.",
  },
  {
    t: "Batarya sağlık takibi",
    d: "Yıllık kapasite ölçüm sonuçlarının saklanması ve kapasite eğrisinin zaman içinde izlenmesi.",
  },
  {
    t: "Bakım hatırlatmaları",
    d: "Kilometre ve tarih bazlı hatırlatmalar; lastik, fren hidroliği ve filtre kalemleri ayrı takip.",
  },
  {
    t: "Poliçe yönetimi",
    d: "Kasko ve trafik poliçelerinin yüklenmesi, bitiş tarihinden önce yenileme bildirimi.",
  },
  {
    t: "Şarj harcama raporu",
    d: "Ev ve halka açık şarj harcamalarının aylık raporlanması, kilometre maliyetinin hesaplanması.",
  },
  {
    t: "Devredilebilir geçmiş",
    d: "Araç satışında doğrulanmış bakım geçmişinin yeni sahibe aktarılabilmesi.",
  },
];

export default async function GaragePage() {
  const [news, features] = await Promise.all([
    getByCategory("dijital-garaj", 4),
    prisma.garageFeature.findMany({
      orderBy: [{ brand: "asc" }, { model: "asc" }, { order: "asc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-sky-700 to-blue-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconLayers className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">DİJİTAL GARAJ</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Aracınızın tüm yaşam döngüsünü tek ekranda toplamayı hedefleyen
          modül geliştirme aşamasında: bakım, batarya sağlığı, sigorta ve şarj
          harcamaları. Erken erişim için kaydolabilirsiniz.
        </p>
      </header>

      {/* YAZILIM ÖZELLİKLERİ — gerçek, doğrulanmış veri.
          Sayfanın geri kalanı ürün hedefidir; bu bölüm ise bugün elimizde
          olan bilgiyi gösterir: hangi modelde hangi yazılım özelliği var,
          hangisi ek donanım/abonelik istiyor. */}
      <section>
        <SectionTitle
          title="ELEKTRİKLİ ARAÇ YAZILIM ÖZELLİKLERİ"
          color="#0369a1"
          subtitle="Marka ve modele göre aktif, opsiyonel ve abonelik gerektiren özellikler"
        />
        <GarageExplorer features={features} />
      </section>

      <section>
        <SectionTitle title="PLANLANAN ÖZELLİKLER" color="#0369a1" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.t}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <h3 className="text-[14px] font-black text-neutral-900">{f.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Erken erişim listesi</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Dijital Garaj yayına alındığında haberdar olmak için aracınızın
            marka ve modelini mesaj kısmında belirterek kaydolun. Hangi
            özelliklerin sizin için öncelikli olduğunu da yazabilirsiniz.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="dijital-garaj" />
        </div>
      </section>

      {news.length > 0 && (
        <section>
          <SectionTitle title="DİJİTAL GARAJ HABERLERİ" href="/kategori/dijital-garaj" color="#0369a1" />
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
