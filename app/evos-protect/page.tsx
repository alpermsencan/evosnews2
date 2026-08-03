import Link from "next/link";
import SectionTitle from "@/components/news/SectionTitle";
import NewsCard from "@/components/news/NewsCard";
import LeadForm from "@/components/ui/LeadForm";
import { getByCategory } from "@/lib/queries";
import { IconCheck, IconShield } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Evos Protect",
  description:
    "Batarya garantisi, genişletilmiş sigorta paketleri, yol yardım ve mobil şarj hizmetleri.",
};

const PACKAGES = [
  {
    name: "PROTECT BASIC",
    price: "4.900",
    color: "border-neutral-200",
    badge: "",
    items: [
      "Batarya kapasite ölçümü (yılda 1)",
      "Şarj ünitesi arıza desteği",
      "7/24 yol yardım",
      "Çekici hizmeti (150 km)",
      "Şarj kablosu hasar teminatı",
    ],
  },
  {
    name: "PROTECT PLUS",
    price: "8.900",
    color: "border-blue-600",
    badge: "EN ÇOK TERCİH EDİLEN",
    items: [
      "Basic paketin tüm kapsamı",
      "10 yıl batarya kapasite garantisi (%70 eşik)",
      "Modül değişimi ücretsiz",
      "Mobil şarj hizmeti (yılda 2 kez)",
      "Ücretsiz ikame araç (5 gün)",
      "Yazılım arıza desteği",
    ],
  },
  {
    name: "PROTECT PREMIUM",
    price: "14.500",
    color: "border-neutral-200",
    badge: "",
    items: [
      "Plus paketin tüm kapsamı",
      "Sınırsız mobil şarj",
      "Ücretsiz ikame araç (15 gün)",
      "Kapıdan servis alma-teslim",
      "Yurt dışı yol yardım",
      "Değer kaybı koruma teminatı",
    ],
  },
];

const FAQ = [
  {
    q: "Batarya garantisi ne zaman devreye giriyor?",
    a: "Üretici garantisi sona erdikten sonra, yıllık kapasite ölçümünün düzenli yapılmış olması şartıyla devreye girer.",
  },
  {
    q: "Kapasite eşiği nasıl ölçülüyor?",
    a: "Anlaşmalı yetkili servislerde yaklaşık 45 dakika süren bir test yapılır. Sonuç dijital garajınıza otomatik işlenir.",
  },
  {
    q: "Mobil şarj hizmeti nasıl çalışıyor?",
    a: "Yolda şarjı biten araca gelen mobil ünite, ortalama 20 dakikada 30 kilometre menzil kazandıracak enerji aktarır.",
  },
  {
    q: "Poliçe araç satışında devrediliyor mu?",
    a: "Evet. Kalan süre, aracı satın alan yeni kullanıcıya ücretsiz devredilebilir; bu ikinci el değerini de olumlu etkiler.",
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
          bataryanızı 10 yıla kadar güvence altına alır; yol yardımdan mobil
          şarja kadar tüm süreçleri tek pakette toplar.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Garanti süresi" value="10 yıl" />
          <Stat label="Kapasite eşiği" value="%70" />
          <Stat label="Anlaşmalı servis" value="240+" />
          <Stat label="Mobil şarj ili" value="12 il" />
        </div>
      </header>

      <section>
        <SectionTitle title="PAKETLER" color="#1d4ed8" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col gap-4 rounded-lg border-2 bg-white p-6 ${p.color}`}
            >
              {p.badge && (
                <span className="w-fit rounded bg-blue-600 px-2 py-1 text-[10px] font-black text-white">
                  {p.badge}
                </span>
              )}
              <h3 className="text-lg font-black text-neutral-900">{p.name}</h3>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-blue-700">{p.price}</span>
                <span className="mb-1 text-sm font-bold text-neutral-500">₺ / yıl</span>
              </div>
              <ul className="flex flex-1 flex-col gap-2">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                href="#teklif"
                className="rounded-md bg-blue-700 px-5 py-3 text-center text-sm font-black text-white transition hover:bg-blue-800"
              >
                TEKLİF AL
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="SIKÇA SORULAN SORULAR" color="#1d4ed8" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {FAQ.map((f) => (
            <div
              key={f.q}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <h3 className="text-[15px] font-black text-neutral-900">{f.q}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="teklif"
        className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Teklif alın</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Aracınızın marka, model ve yılını mesaj kısmında belirtin; size özel
            fiyatlandırmayı 1 iş günü içinde ilettelim. Fiyatlandırma araç
            değerine ve yıllık kilometreye göre yapılır.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="evos-protect" />
        </div>
      </section>

      <section>
        <SectionTitle title="PROTECT HABERLERİ" href="/kategori/evos-protect" color="#1d4ed8" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {news.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </section>
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
