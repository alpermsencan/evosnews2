import type { Metadata } from "next";
import FuelSavingsCalculator from "@/components/tools/FuelSavingsCalculator";
import RealRangeSimulator from "@/components/tools/RealRangeSimulator";
import Link from "next/link";
import { IconBolt, IconCheck, IconChevronRight } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Elektrikli Araç Tasarruf Hesaplama & TCO",
  description:
    "Benzinli ve dizel aracınızın tüketim değerlerini girin, 2026 güncel akaryakıt ve elektrik tarifeleriyle elektrikli araca geçişteki yıllık net tasarrufunuzu ve 5 yıllık amortismanı hesaplayın.",
  keywords: [
    "elektrikli araç tasarruf hesaplama",
    "benzin vs elektrik maliyeti",
    "EV yakıt tasarrufu",
    "şarj maliyeti hesaplama",
    "elektrikli araç amortisman süresi",
  ],
};

export default function TasarrufHesaplaPage() {
  return (
    <div className="flex flex-col gap-8 px-3 sm:px-0 sm:pt-4">
      {/* Hero Banner */}
      <header className="rounded-2xl bg-gradient-to-br from-[#0B1E3F] via-[#112d5e] to-emerald-900 p-6 sm:p-10 text-white shadow-lg">
        <div className="flex flex-col gap-3 max-w-3xl">
          <span className="w-fit rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/30">
            2026 GÜNCEL TARİFELERLE TASARRUF ANALİZİ
          </span>
          <h1 className="text-2xl font-black sm:text-4xl tracking-tight">
            Benzinli Aracınızı Elektrikliye Dönüştürünce Ne Kadar Tasarruf Edersiniz?
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Türkiye genelindeki güncel akaryakıt pompa fiyatları, ev tipi elektrik tarifeleri ve DC hızlı şarj istasyonu ücretleriyle anlık net kazancınızı hesaplayın.
          </p>
        </div>
      </header>

      {/* Ana Hesaplayıcı Bileşeni */}
      <FuelSavingsCalculator />

      {/* Gerçek Menzil Simülatörü Blok */}
      <div className="mt-2">
        <RealRangeSimulator />
      </div>

      {/* Sıkça Sorulan Sorular / Bilgilendirme */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-black text-neutral-900 mb-6">
          Elektrikli Araç Tasarrufu Hakkında Bilinmesi Gerekenler
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2 rounded-xl bg-neutral-50 p-5 border border-neutral-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-black text-sm">
              1
            </span>
            <h3 className="text-base font-black text-neutral-900">Evde Şarj En Büyük Tasarruf</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Aracınızı evde standart prizden veya Wallbox ile şarj ettiğinizde 100 km maliyeti yaklaşık 40-45 TL&apos;ye denk gelir. Aynı mesafe benzinli bir araçta 380-420 TL tutmaktadır.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-neutral-50 p-5 border border-neutral-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700 font-black text-sm">
              2
            </span>
            <h3 className="text-base font-black text-neutral-900">Periyodik Bakım Avantajı</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Elektrikli motorlarda motor yağı, yağ filtresi, buji, triger kayışı, baskı balata ve egzoz sistemi bulunmaz. Yıllık periyodik bakım maliyeti içten yanmalı araçlara göre %60 daha düşüktür.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl bg-neutral-50 p-5 border border-neutral-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-black text-sm">
              3
            </span>
            <h3 className="text-base font-black text-neutral-900">MTV ve ÖTV Avantajı</h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Elektrikli otomobiller benzer motor gücündeki fosil yakıtlı araçlara göre %10 ÖTV diliminde yer alarak başlangıç satın alma maliyetinde büyük vergi avantajı sunar.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-6">
          <p className="text-xs text-neutral-500">
            Bütçenize en uygun elektrikli modeli seçmek için yapay zekâ danışmanımızı kullanabilirsiniz.
          </p>
          <Link
            href="/ai-danisman"
            className="flex items-center gap-1.5 rounded-xl bg-[#0B1E3F] px-5 py-2.5 text-xs font-black text-white transition hover:bg-sky-950"
          >
            AI DANIŞMANA SOR <IconChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
