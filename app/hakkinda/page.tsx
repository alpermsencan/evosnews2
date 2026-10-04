import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import { IconBolt, IconCheck, IconChevronRight } from "@/components/ui/Icons";
import { SITE_DOMAIN, SITE_EMAIL, SITE_LOCATION, SITE_NAME, SITE_PHONE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Hakkımızda — ${SITE_NAME}`,
  description:
    `${SITE_NAME} (${SITE_DOMAIN}), elektrikli araç deneyimini araştırmadan satışa kadar tek platformda toplar. Veri ilkelerimiz ve misyonumuz.`,
};

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
      {/* Hero Banner */}
      <header className="flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-neutral-950 via-slate-900 to-neutral-900 p-6 sm:p-8 text-white border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <IconBolt className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-400">
              ELEKTRİKLİ MOBİLİTE PLATFORMU
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">HAKKIMIZDA</h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm sm:text-base text-neutral-300 leading-relaxed">
          <strong>{SITE_NAME}</strong> ({SITE_DOMAIN}), Türkiye&apos;de elektrikli araç ekosistemini
          araştırmadan satın almaya kadar tek çatı altında toplayan bağımsız platformdur: güncel haberler,
          kapsamlı model kataloğu, şarj asistanı ve tarifeleri, ikinci el elektrikli araç pazaryeri
          ve şeffaf teknik analizler.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Yayında haber" value={articles} />
          <Stat label="Katalog modeli" value={vehicles} />
          <Stat label="Şarj istasyonu" value={stations} />
          <Stat label="Operatör tarifesi" value={tariffs} />
          <Stat label="İlan" value={listings} />
          <Stat label="Üye" value={members} />
        </div>
      </header>

      {/* Veri İlkelerimiz */}
      <section>
        <SectionTitle title="VERİ İLKELERİMİZ" color="#0284c7" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Principle
            t="Doğrulanmış ve Gerçek Veri"
            d="Sitemizdeki her teknik kayıt resmî kataloglardan, üretici verilerinden veya yönetim panelinden teyit edilerek girilir. Sayfayı yapay olarak dolu göstermek için yanıltıcı veri veya sahte ilan barındırılmaz."
          />
          <Principle
            t="Bilinmeyen Alan Boş Kalır"
            d="Bir modelin şarj eğrisi, DC maksimum gücü ya da güncel fiyatı üretici tarafından açıklanmamışsa alan boş bırakılır. Tahmini bir rakam yazmak kullanıcıyı yanıltabileceği için spekülatif sayılar kullanılmaz."
          />
          <Principle
            t="Şeffaf ve Açık Kaynak"
            d="Menzil, motor gücü, batarya kapasitesi ve tüketim verileri uluslararası standartlar (WLTP) ve resmî test döngüleri doğrultusunda kullanıcılara tarafsız şekilde sunulur."
          />
          <Principle
            t="Özgün ve Doğru Habercilik"
            d="Sektörel gelişmeler, teknoloji lansmanları ve pazar verileri titizlikle incelenerek tarafsız bir dille okuyucuya aktarılır. Kaynaklar ve alıntılar her zaman şeffafça korunur."
          />
          <Principle
            t="Kullanıcı Odaklı Güvenlik"
            d="Kullanıcılarımızın kişisel bilgileri 6698 sayılı KVKK standartlarında korunur. Şifreler ve kimlik bilgileri yüksek güvenlikli kriptografik yöntemlerle saklanır."
          />
          <Principle
            t="Bağımsız Dijital Altyapı"
            d="Platformumuz kendi bağımsız mimarisiyle çalışır; modern web standartlarına, yüksek hıza ve kesintisiz kullanıcı deneyimine odaklanır."
          />
        </div>
      </section>

      {/* Ne Yapıyoruz */}
      <section>
        <SectionTitle title="NELER SUNUYORUZ?" color="#0284c7" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Module href="/" t="Haber & Analiz" d="Elektrikli otomobil dünyasından son gelişmeler ve özel teknoloji analizleri." />
          <Module href="/araclar" t="Model Kataloğu" d="Türkiye pazarındaki tüm modellerin detaylı teknik verileri ve karşılaştırması." />
          <Module href="/ilanlar" t="2. El Elektrikli Araçlar" d="Alıcı ve satıcıyı güvenle buluşturan elektrikli araç pazaryeri." />
          <Module href="/sarj-agi" t="Şarj Ağı & Asistanı" d="Operatör tarifeleri, istasyon haritası ve batarya dolum maliyet hesabı." />
          <Module href="/sarj-agi/rota" t="Şarj & Rota Planlama" d="Elektrikli aracınızla uzun yolda şarj durakları ve maliyet analizi planlayın." />
          <Module href="/topluluk" t="Topluluk (r/e-aracim)" d="Elektrikli araç sahiplerinin ve meraklılarının deneyim paylaştığı forum." />
          <Module href="/veri-gizlilik" t="Veri ve Gizlilik" d="KVKK aydınlatma bildirimimiz, şeffaf gizlilik ve çerez ilkelerimiz." />
          <Module href="/iletisim" t="Doğrudan İletişim" d="Kurumsal iş birliği, içerik düzeltme ve her türlü soru için bize yazın." />
        </div>
      </section>

      {/* İletişim Kartı */}
      <section className="flex flex-col gap-6 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm lg:flex-row lg:items-center justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Kurumsal İletişim & İş Birliği</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            {SITE_NAME} ile reklam, kurumsal entegrasyon, veri ortaklığı veya basın bülteni paylaşımı için doğrudan bizimle iletişime geçebilirsiniz.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-neutral-500">
            <span>E-posta: <a href={`mailto:${SITE_EMAIL}`} className="text-sky-600 hover:underline">{SITE_EMAIL}</a></span>
            <span>•</span>
            <span>Telefon: <a href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`} className="text-neutral-900 hover:underline">{SITE_PHONE}</a></span>
            <span>•</span>
            <span>Konum: <span className="text-neutral-700">{SITE_LOCATION}</span></span>
          </div>
        </div>
        <Link
          href="/iletisim"
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-neutral-950 hover:bg-neutral-900 px-6 py-3.5 text-sm font-black text-white transition active:scale-95 shadow-md"
        >
          <span>İLETİŞİME GEÇİN</span>
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col rounded-2xl bg-white/10 px-3.5 py-2.5 backdrop-blur border border-white/10">
      <span className="text-[11px] font-semibold text-white/70">{label}</span>
      <span className="text-lg sm:text-xl font-black text-sky-400">{value.toLocaleString("tr-TR")}</span>
    </div>
  );
}

function Principle({ t, d }: { t: string; d: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      <IconCheck className="h-5 w-5 text-sky-600" />
      <h3 className="text-[15px] font-black text-neutral-900">{t}</h3>
      <p className="text-[13px] leading-relaxed text-neutral-600">{d}</p>
    </div>
  );
}

function Module({ href, t, d }: { href: string; t: string; d: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-sky-500 hover:shadow-md group"
    >
      <h3 className="text-[14px] font-black text-neutral-900 group-hover:text-sky-600 transition-colors">{t}</h3>
      <p className="text-[12px] leading-relaxed text-neutral-500">{d}</p>
    </Link>
  );
}
