import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SectionTitle from "@/components/news/SectionTitle";
import FinanceCalculator from "@/components/tools/FinanceCalculator";
import { tierSummary } from "@/lib/tariffs";
import { IconChart, IconChevronRight } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Finansman — Vergi, Kredi ve Enerji Maliyeti",
  description:
    "Elektrikli araçta ÖTV ve KDV yükü, kredi taksiti ve şarj enerjisi maliyetini tek ekranda hesaplayın.",
};

export default async function FinancePage() {
  const [vehicles, tariffs] = await Promise.all([
    prisma.vehicle.findMany({
      select: { slug: true, brand: true, model: true, price: true, otvRate: true, consumption: true },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    }),
    prisma.operatorTariff.findMany({ where: { isActive: true } }),
  ]);

  // Tarife ortancası: enerji hesabına makul bir başlangıç verir. Tarife
  // girilmemişse alan boş açılır — uydurma bir fiyat konmaz.
  const ac = tierSummary(tariffs, "ac")?.median ?? null;
  const dc = tierSummary(tariffs, "dc")?.median ?? null;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-violet-700 to-indigo-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconChart className="h-7 w-7" />
          <h1 className="text-2xl font-black sm:text-4xl">FİNANSMAN</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Etiket fiyatı hikâyenin yarısı. Bu ekranda üç kalem birlikte
          hesaplanır: verginin ne kadarını ödediğiniz, kredinin aylık yükü ve
          şarj enerjisinin gerçek maliyeti.
        </p>
      </header>

      <FinanceCalculator
        vehicles={vehicles.map((v) => ({
          slug: v.slug,
          label: `${v.brand} ${v.model}`,
          price: v.price,
          otvRate: v.otvRate,
          consumption: v.consumption,
        }))}
        medianAcPrice={ac}
        medianDcPrice={dc}
      />

      <section>
        <SectionTitle title="HESAP NASIL YAPILIYOR?" color="#7c3aed" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <Card
            t="Vergi sırası önemli"
            d="ÖTV vergisiz satış bedelinden (matrah) alınır; KDV ise ÖTV DÂHİL tutar üzerinden hesaplanır. Yani vergi üstüne vergi ödenir — bu yüzden matrahtaki küçük fark etiket fiyatına büyütülerek yansır."
          />
          <Card
            t="Kredi eşit taksitli"
            d="Annüite yöntemiyle hesaplanır: taksit sabittir, başlangıçta faiz ağırlıklıdır. Faiz oranı bankaya göre değiştiği için varsayılan bir oran uydurulmaz, girdi olarak alınır."
          />
          <Card
            t="Enerji gerçek tarifeden"
            d="Ev ve halka açık şarj oranınıza göre karışık bir ₺/kWh hesaplanır. Başlangıç değerleri operatörlerin ilan ettiği tarifelerin ortancasıdır; ortalama değil ortanca, çünkü tek bir yüksek sabit tarife ortalamayı yanıltır."
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="text-xl font-black text-neutral-900">Hesaba dâhil olmayanlar</h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            Sigorta/kasko, periyodik bakım, MTV ve lastik giderleri bu ekranda
            yer almaz — bunlar araca ve kullanıcıya göre çok değiştiği için
            varsayılan bir rakam vermek yanıltıcı olurdu. Batarya güvencesi için{" "}
            <Link href="/evos-protect" className="font-bold text-evos hover:underline">
              Evos Protect
            </Link>{" "}
            paketlerine bakabilirsiniz.
          </p>
        </div>
        <Link
          href="/otv-rehberi"
          className="flex shrink-0 items-center justify-center gap-1 rounded-md bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
        >
          ÖTV REHBERİ <IconChevronRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}

function Card({ t, d }: { t: string; d: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
      <h3 className="text-[15px] font-black text-neutral-900">{t}</h3>
      <p className="text-[13px] leading-relaxed text-neutral-600">{d}</p>
    </div>
  );
}
