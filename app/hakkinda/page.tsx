import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import { IconBolt, IconCheck, IconChevronRight } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hakkımızda",
  description:
    "Evos, elektrikli araç deneyimini araştırmadan satışa kadar tek platformda toplar. Veri ilkelerimiz ve nasıl çalıştığımız.",
};

/**
 * Kurumsal tanıtım sayfası.
 *
 * Buradaki rakamlar SABİT DEĞİL: veritabanından okunur. Tanıtım sayfalarına
 * elle yazılan "10.000+ kullanıcı" tarzı ifadeler kısa sürede yalan olur;
 * gerçek sayaç hem doğrudur hem de kendini günceller.
 */
export default async function AboutPage() {
  const [articles, vehicles, stations, tariffs, listings, members] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.vehicle.count(),
    prisma.chargeStation.count(),
    prisma.operatorTariff.count({ where: { isActive: true } }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count(),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-evos to-evos-dark p-6 text-white">
        <div className="flex items-center gap-2">
          <IconBolt className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">HAKKIMIZDA</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Evos, elektrikli araç deneyimini araştırmadan satışa kadar tek
          platformda toplar: haber, model kataloğu, şarj ağı ve tarifeleri,
          ikinci el pazaryeri, batarya raporu ve yapay zekâ destekli danışman.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Yayında haber" value={articles} />
          <Stat label="Katalog modeli" value={vehicles} />
          <Stat label="Şarj istasyonu" value={stations} />
          <Stat label="Operatör tarifesi" value={tariffs} />
          <Stat label="İlan" value={listings} />
          <Stat label="Üye" value={members} />
        </div>
      </header>

      <section>
        <SectionTitle title="VERİ İLKELERİMİZ" color="#e30613" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Principle
            t="Örnek veri yoktur"
            d="Sitedeki her kayıt ya bir dış kaynaktan otomatik gelir, ya kullanıcıdan, ya da yönetim panelinden doğrulanarak girilir. Sayfayı dolu göstermek için sahte ilan, sahte yorum veya sahte kullanıcı üretilmez."
          />
          <Principle
            t="Bilinmeyen alan boş kalır"
            d="Bir aracın DC şarj gücü ya da bir istasyonun tarifesi doğrulanamıyorsa alan boş bırakılır ve arayüzde '—' görünür. Tahmini bir sayı yazmak, kullanıcının o sayıya güvenmesine yol açardı."
          />
          <Principle
            t="Her rakamın kaynağı vardır"
            d="Fiyat, tarife ve menzil değerleri kaynağı ve doğrulama tarihiyle birlikte saklanır. Veri bayatladığında panelde uyarı çıkar; 'güncel' demek ölçülebilir bir iddiadır."
          />
          <Principle
            t="Haberde telif güvenliği"
            d="Kaynağın metni asla kopyalanmaz. Her haber olgular çıkarılarak sıfırdan Türkçe yeniden yazılır; yazılamayan haber yayına çıkmaz, kuyrukta kalır. Kaynak adı ve bağlantısı her zaman korunur."
          />
          <Principle
            t="Puanlar şeffaftır"
            d="VoltScore sunucuda, her araca aynı formülle hesaplanır. Verisi olmayan kriter puana katılmaz ve puanın hangi veri kapsamıyla üretildiği kullanıcıya gösterilir."
          />
          <Principle
            t="Bağımsız altyapı"
            d="Harita için dış döşeme sunucusu kullanılmaz; ülke sınırı kamu malı veriden bir kez üretilip site içinde saklanır. Kotaya, anahtara ve sağlayıcıya bağımlı değiliz."
          />
        </div>
      </section>

      <section>
        <SectionTitle title="NE YAPIYORUZ?" color="#e30613" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Module href="/kategori/haber-merkezi" t="Haber merkezi" d="Günlük otomatik akış, Türkçe yeniden yazım, kaynak atfı." />
          <Module href="/araclar" t="Model kataloğu" d="Teknik veri, karşılaştırma ve gerçek mevsimsel menzil." />
          <Module href="/ilanlar" t="Pazaryeri" d="Sıfır ve ikinci el ilanlar, batarya raporu ve VoltScore ile." />
          <Module href="/sarj-agi" t="Şarj ağı" d="İstasyon haritası, konuma göre sıralama ve gerçek sürüş rotası." />
          <Module href="/sarj-fiyatlari" t="Şarj fiyatları" d="Operatör tarifelerinin AC/DC/ultra karşılaştırması." />
          <Module href="/finansman" t="Finansman" d="Vergi, kredi taksiti ve enerji maliyeti tek ekranda." />
          <Module href="/ai-danisman" t="AI Danışman" d="Kullanım profiline göre araç önerisi ve sesli asistan." />
          <Module href="/topluluk" t="Topluluk" d="Model bazlı gruplar, akış, reels ve tartışmalar." />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Bize ulaşın</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            İş birliği, kurumsal entegrasyon, veri ortaklığı ya da basın
            talepleriniz için iletişim sayfasından yazabilirsiniz.
          </p>
        </div>
        <Link
          href="/iletisim"
          className="flex shrink-0 items-center justify-center gap-1 rounded-md bg-evos px-5 py-3 text-sm font-black text-white transition hover:bg-evos-dark"
        >
          İLETİŞİM <IconChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col rounded-lg bg-white/10 px-3 py-2 backdrop-blur">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg font-black">{value.toLocaleString("tr-TR")}</span>
    </div>
  );
}

function Principle({ t, d }: { t: string; d: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
      <IconCheck className="h-5 w-5 text-evos" />
      <h3 className="text-[15px] font-black text-neutral-900">{t}</h3>
      <p className="text-[13px] leading-relaxed text-neutral-600">{d}</p>
    </div>
  );
}

function Module({ href, t, d }: { href: string; t: string; d: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-evos hover:shadow-md"
    >
      <h3 className="text-[14px] font-black text-neutral-900">{t}</h3>
      <p className="text-[12px] leading-relaxed text-neutral-500">{d}</p>
    </Link>
  );
}
