import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import LeadForm from "@/components/ui/LeadForm";
import { IconBattery, IconCheck, IconShield } from "@/components/ui/Icons";
import { EOL_SOH } from "@/lib/battery-report";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Batarya Raporu Nedir?",
  description:
    "İkinci el elektrikli araçta bataryanın gerçek durumu: ölçülen SOH, tahmini kalan ömür ve risk seviyesi. Doğrulanmış batarya raporu nasıl üretilir?",
};

const STEPS = [
  {
    t: "Ölçüm yetkili serviste yapılır",
    d: "Yetkili servis veya ekspertiz firması aracın ölçülen SOH değerini, tam şarj çevrim sayısını ve DC hızlı şarj oranını kaydeder. Bunlar broşür verisi değil, araçtan okunan değerlerdir.",
  },
  {
    t: "Kalan ömür ve risk sunucuda hesaplanır",
    d: `Kapasite kaybı hızı aracın kendi geçmişinden çıkarılır ve %${EOL_SOH} değişim sınırına kalan süre hesaplanır. Bu iki alan forma ELLE GİRİLEMEZ — girilebilseydi her raporda "risk: düşük" yazardı.`,
  },
  {
    t: "Evos doğrular, rozet çıkar",
    d: "Rapor doğrulanana kadar ilanda rozet görünmez ve değerleri VoltScore hesabına katılmaz. Doğrulandığı anda ilan 'Evos doğrulamalı' rozetini alır ve güven puanı yeniden hesaplanır.",
  },
];

export default async function BatteryReportPage() {
  const [verified, total] = await Promise.all([
    prisma.listing.count({
      where: { status: "PUBLISHED", batteryReport: { is: { verifiedAt: { not: null } } } },
    }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-volt-dark to-green-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconBattery className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">BATARYA RAPORU</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          İkinci el elektrikli araçta en pahalı bileşen bataryadır ve gözle
          kontrol edilemez. &quot;Bataryası nasıl?&quot; sorusunu ölçülebilir bir
          cevaba çeviriyoruz: ölçülen kapasite, tahmini kalan ömür ve risk
          seviyesi.
        </p>
        <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Raporlu ilan" value={`${verified}`} />
          <Stat label="Yayındaki ilan" value={`${total}`} />
          <Stat label="Değişim sınırı" value={`%${EOL_SOH} SOH`} />
        </div>
      </header>

      <section>
        <SectionTitle title="RAPOR NASIL ÜRETİLİR?" color="#15803d" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.t}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-volt text-sm font-black text-white">
                {i + 1}
              </span>
              <h3 className="text-[15px] font-black text-neutral-900">{s.t}</h3>
              <p className="text-[13px] leading-relaxed text-neutral-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle title="RAPORDA NE VAR?" color="#15803d" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Item
            t="Ölçülen SOH"
            d="Fabrika kapasitesine göre bataryada kalan yüzde. Broşür değeri değil, araçtan okunan değer."
          />
          <Item
            t="Tahmini kalan ömür"
            d="Ölçülen kapasite kaybı hızından hesaplanır. Doğrusal bozulma varsayar; tahmindir, garanti değildir."
          />
          <Item
            t="Risk seviyesi"
            d="SOH seviyesi, kalan ömür ve hızlı şarj alışkanlığı birlikte değerlendirilerek düşük / orta / yüksek olarak verilir."
          />
          <Item
            t="Kim, ne zaman ölçtü"
            d="Ölçümü yapan kurum ve tarih rapora yazılır. Ölçüm değişirse doğrulama düşer, rapor yeniden onaylanmalıdır."
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <IconCheck className="h-5 w-5 text-volt-dark" />
          <h2 className="text-xl font-black text-neutral-900">
            Rapor VoltScore&apos;u nasıl etkiler?
          </h2>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600">
          VoltScore&apos;un en ağır kriteri <strong>batarya sağlığıdır (%30)</strong>.
          Doğrulanmış rapor yoksa satıcının beyan ettiği değer kullanılır ve bu
          ilanda açıkça &quot;beyan&quot; olarak yazar. Rapor doğrulandığında
          ölçülen değer devreye girer ve puan yeniden hesaplanır. Beyan ile ölçüm
          arasındaki fark, alıcının görmesi gereken en önemli bilgidir; bu yüzden
          gizlenmez.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/ilanlar?rapor=1"
            className="rounded-md bg-volt px-5 py-2.5 text-sm font-black text-white transition hover:bg-volt-dark"
          >
            RAPORLU İLANLARI GÖR
          </Link>
          <Link
            href="/ilanlar"
            className="rounded-md border border-neutral-200 px-5 py-2.5 text-sm font-black text-neutral-700 transition hover:border-evos hover:text-evos"
          >
            TÜM İLANLAR
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <IconShield className="h-7 w-7 text-volt-dark" />
          <h2 className="text-xl font-black text-neutral-900">
            Servis veya ekspertiz firması mısınız?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Ölçüm yapan kurumlar Evos batarya raporu ağına katılabilir.
            Ölçümlerinizi panele girin, raporlarınız doğrulandıktan sonra
            ilanlarda kurum adınızla görünsün.
          </p>
        </div>
        <div className="w-full shrink-0 lg:w-[420px]">
          <LeadForm topic="batarya-raporu" />
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

function Item({ t, d }: { t: string; d: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
      <h3 className="text-[15px] font-black text-neutral-900">{t}</h3>
      <p className="text-[13px] leading-relaxed text-neutral-600">{d}</p>
    </div>
  );
}
