import Link from "next/link";
import SectionTitle from "@/components/news/SectionTitle";
import LeadForm from "@/components/ui/LeadForm";
import { IconChart, IconCheck, IconShield, IconUsers } from "@/components/ui/Icons";

export const metadata = {
  title: "Evos Pro — Galeri ve Kurumsal Çözümler",
  description:
    "Galeriler, yetkili bayiler, şarj operatörleri ve servisler için Evos Pro: vitrin, toplu ilan, batarya raporu ağı ve veri erişimi.",
};

/**
 * Ticari katman tanıtımı.
 *
 * FİYAT YAZILMAZ. Paket ücretleri belirlenmediği için buraya bir rakam koymak,
 * bağlayıcı olmayan bir taahhüt üretmek olurdu — sitedeki diğer sayısal
 * iddialar gibi bu da doğrulanabilir olmadan yayımlanmaz. Talep formundan
 * gelen her başvuruya teklif ayrıca iletilir.
 */

const PLANS = [
  {
    key: "galeri",
    title: "Galeri & Bayi",
    lead: "Aracını satan kurumsal satıcılar için",
    icon: IconUsers,
    tone: "border-neutral-200",
    items: [
      "Toplu ilan yönetimi ve kurum profili",
      "Vitrin (sponsorlu) ilan hakkı",
      "Batarya raporu ekleme ve doğrulama akışı",
      "İlan performans raporu: görüntülenme, favori, karşılaştırmaya eklenme",
      "VoltScore ile öne çıkma — puanı yüksek ilan listede üste taşınır",
    ],
  },
  {
    key: "operator",
    title: "Şarj Operatörü",
    lead: "İstasyon ağı işleten kurumlar için",
    icon: IconChart,
    tone: "border-volt",
    items: [
      "Operatör tarifesini doğrudan yönetme (AC / DC / ultra)",
      "İstasyon envanterinde doğrulanmış tarife rozeti",
      "Şarj fiyatları sayfasında kurum sayfası ve bağlantı",
      "İl bazlı soket dağılımı ve kapsama raporu",
      "Yeni istasyon duyurularının haber akışına düşmesi",
    ],
  },
  {
    key: "servis",
    title: "Servis & Ekspertiz",
    lead: "Batarya ölçümü yapan kurumlar için",
    icon: IconShield,
    tone: "border-neutral-200",
    items: [
      "Batarya raporu ağına katılım",
      "Ölçümlerin kurum adıyla yayımlanması",
      "Rapor doğrulama akışı ve geçmiş kayıtlar",
      "İlanlarda 'Evos doğrulamalı' rozetiyle görünürlük",
      "Bölgenizdeki rapor talebi yönlendirmesi",
    ],
  },
];

const MODEL = [
  { t: "Premium vitrin", d: "İlanın liste başında sponsorlu olarak görünmesi." },
  { t: "Galeri aboneliği", d: "Kurumsal satıcılar için aylık ilan kotası ve profil." },
  { t: "Batarya raporu", d: "Ölçüm ağı üzerinden üretilen doğrulanmış rapor." },
  { t: "Pazaryeri", d: "Alıcı ve satıcıyı buluşturan ilan altyapısı." },
  { t: "Servis yönlendirme", d: "Bakım ve ekspertiz taleplerinin servislere iletilmesi." },
  { t: "Veri erişimi", d: "Şarj ağı, tarife ve katalog verisinin kurumsal kullanımı." },
];

export default function ProPage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-evos-ink via-slate-800 to-evos-dark p-6 text-white">
        <span className="text-[11px] font-black tracking-[0.2em] text-white/60">
          EVOS PRO
        </span>
        <h1 className="text-2xl font-black sm:text-4xl">
          Kurumsal çözümler
        </h1>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Galeriler, yetkili bayiler, şarj operatörleri ve ekspertiz firmaları
          için Evos&apos;un veri altyapısı üzerine kurulu araçlar. Aynı ilkeler
          burada da geçerli: doğrulanmamış veri yayımlanmaz, her rakamın kaynağı
          saklanır.
        </p>
      </header>

      <section>
        <SectionTitle title="PAKETLER" color="#0f172a" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {PLANS.map(({ key, title, lead, icon: Icon, tone, items }) => (
            <div
              key={key}
              className={`flex flex-col gap-3 rounded-lg border-2 bg-white p-5 ${tone}`}
            >
              <Icon className="h-7 w-7 text-evos" />
              <div>
                <h2 className="text-lg font-black text-neutral-900">{title}</h2>
                <p className="text-[12px] text-neutral-500">{lead}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-volt-dark" />
                    <span className="text-[13px] leading-relaxed text-neutral-600">{i}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="#basvuru"
                className="mt-auto rounded-md bg-evos-ink px-4 py-2.5 text-center text-[13px] font-black text-white transition hover:bg-slate-700"
              >
                TEKLİF İSTE
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-neutral-500">
          Paket ücretleri kurumun ilan hacmine ve kapsamına göre belirlenir; bu
          sayfada sabit bir fiyat yayımlanmaz. Başvurunuza teklif ayrıca
          iletilir.
        </p>
      </section>

      <section>
        <SectionTitle title="EVOS NASIL SÜRDÜRÜLEBİLİR?" color="#0f172a" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MODEL.map((m) => (
            <div
              key={m.t}
              className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4"
            >
              <h3 className="text-[13px] font-black text-neutral-900">{m.t}</h3>
              <p className="text-[11px] leading-relaxed text-neutral-500">{m.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-neutral-500">
          Gelir modeli okuyucudan değil kurumdan gelir: haber okumak, ilan
          görmek, tarife karşılaştırmak ve araç karşılaştırmak ücretsizdir ve
          ücretli kalmayacaktır. Ücretli katman yalnızca kurumların görünürlük
          ve veri ihtiyacını karşılar.
        </p>
      </section>

      <section
        id="basvuru"
        className="flex scroll-mt-24 flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Başvuru</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Kurum adınızı, faaliyet alanınızı ve ilgilendiğiniz paketi mesaj
            kısmına yazın. İlan hacminiz veya istasyon sayınız varsa belirtin —
            teklifi buna göre hazırlıyoruz.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="pro" />
        </div>
      </section>
    </div>
  );
}
