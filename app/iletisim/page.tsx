import Link from "next/link";
import SectionTitle from "@/components/news/SectionTitle";
import LeadForm from "@/components/ui/LeadForm";
import { IconUsers, IconChevronRight, IconBolt } from "@/components/ui/Icons";
import { SITE_DOMAIN, SITE_EMAIL, SITE_LOCATION, SITE_NAME, SITE_PHONE } from "@/lib/site";

export const metadata = {
  title: `İletişim — ${SITE_NAME}`,
  description:
    `${SITE_NAME} (${SITE_DOMAIN}) ile iletişime geçin: iş birliği, kurumsal entegrasyon, veri ortaklığı, basın ve içerik talepleri.`,
};

const TOPICS = [
  {
    t: "İş birliği ve Reklam",
    d: "Şarj operatörü, galeri, yetkili bayi, sigorta veya otomotiv iş ortaklığı için.",
  },
  {
    t: "Kurumsal Entegrasyon",
    d: "Şarj asistanı, istasyon ağı verisi veya araç kataloğunu kendi sisteminize bağlamak için.",
  },
  {
    t: "İlan ve Pazaryeri Desteği",
    d: "2. el elektrikli araç ilanı oluşturma, güncelleme ve doğrulama süreçleri hakkında.",
  },
  {
    t: "Basın ve İçerik Düzeltme",
    d: "Basın bülteni gönderimleri, haber düzeltme bildirimleri ve telif hakları için.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      {/* Hero Header */}
      <header className="flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-neutral-950 via-slate-900 to-neutral-900 p-6 sm:p-8 text-white border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
            <IconUsers className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-400">
              BİZE ULAŞIN
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">İLETİŞİM</h1>
          </div>
        </div>
        <p className="max-w-3xl text-sm sm:text-base text-neutral-300 leading-relaxed">
          <strong>{SITE_NAME}</strong> ({SITE_DOMAIN}) ekibiyle aşağıdaki kurumsal iletişim kanallarımız
          ya da mesaj formu üzerinden hızlıca irtibata geçebilirsiniz.
        </p>

        {/* Kurumsal İletişim Kartları */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
            <span className="text-[11px] font-bold text-neutral-400 uppercase block">E-Posta Adresi</span>
            <a href={`mailto:${SITE_EMAIL}`} className="text-sm sm:text-base font-black text-sky-400 hover:underline">
              {SITE_EMAIL}
            </a>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
            <span className="text-[11px] font-bold text-neutral-400 uppercase block">Müşteri & Bilgi Hattı</span>
            <a href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`} className="text-sm sm:text-base font-black text-white hover:underline">
              {SITE_PHONE}
            </a>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
            <span className="text-[11px] font-bold text-neutral-400 uppercase block">Konum & Ülke</span>
            <span className="text-sm sm:text-base font-black text-white">
              {SITE_LOCATION}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sol Sütun: Konular ve İlkeler */}
        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <SectionTitle title="HANGİ KONUDA YAZABİLİRSİNİZ?" color="#0284c7" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOPICS.map((t) => (
              <div
                key={t.t}
                className="flex flex-col gap-1.5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs"
              >
                <h3 className="text-[15px] font-black text-neutral-900">{t.t}</h3>
                <p className="text-[13px] leading-relaxed text-neutral-600">{t.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2">
              <IconBolt className="h-5 w-5 text-sky-600" />
              <h3 className="text-[15px] font-black text-neutral-900">
                Haberde veya teknik veride düzeltme mi var?
              </h3>
            </div>
            <p className="text-[13px] leading-relaxed text-neutral-600">
              {SITE_NAME} içerikleri bağımsız ve titiz editoryal süzgeçten geçerek yayınlanır. Olası bir hata, teknik değer güncellemesi veya marka düzeltmesi için lütfen bağlantı adresiyle birlikte formu doldurunuz; ekibimiz derhal inceleyecektir.
            </p>
            <div className="mt-2 flex items-center gap-4 text-xs font-bold">
              <Link
                href="/hakkinda"
                className="flex items-center gap-1 text-sky-600 hover:underline"
              >
                Veri ilkelerimizi okuyun <IconChevronRight className="h-3 w-3" />
              </Link>
              <Link
                href="/veri-gizlilik"
                className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 hover:underline"
              >
                Gizlilik politikamız <IconChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* Sağ Sütun: Mesaj Gönderim Formu */}
        <aside className="w-full shrink-0 lg:w-[420px]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-base font-black text-neutral-900">Doğrudan Mesaj Gönderin</h2>
            <p className="text-xs text-neutral-500 mb-4">
              Talebiniz incelenerek en kısa sürede e-posta adresinize dönüş yapılacaktır.
            </p>
            <LeadForm topic="iletisim" />
          </div>
        </aside>
      </div>
    </div>
  );
}
