import Link from "next/link";
import { IconBattery, IconShield, IconSparkles } from "@/components/ui/Icons";

export const metadata = {
  title: "Evos Intelligence Batarya Analizi — Batarya Raporu",
  description: "Elektrikli aracınıza özel sertifikalı batarya sağlık ve kalan ömür analiz raporu oluşturun.",
};

export default function BatteryAnalysisPage() {
  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      {/* Header */}
      <header className="flex flex-col gap-3 rounded-lg bg-gradient-to-br from-[#0B1E3F] to-slate-900 p-6 text-white">
        <div className="flex items-center gap-2">
          <IconBattery className="h-7 w-7 text-sky-400" />
          <h1 className="text-2xl font-black sm:text-4xl">Evos Intelligence Batarya Analizi</h1>
        </div>
        <p className="max-w-3xl text-sm text-white/85 sm:text-base">
          Batarya durumunuzu ve gerçek kapasitenizi yapay zekâ analiz motorumuzla raporlayın. Aracınıza özel sertifikalı batarya durum raporu (SOH) oluşturarak güvenle satın veya satın alın.
        </p>
      </header>

      {/* Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Side: Detail/Value Info */}
        <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-2">
            Neden Batarya Analizi Yaptırmalısınız?
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Elektrikli araçların değerinin en az %40'ını batarya paketi oluşturur. Yanlış şarj alışkanlıkları ve yüksek sıcaklıklar, batarya sağlığını (SOH) hızla yıpratabilir. 
          </p>

          <div className="flex flex-col gap-3 mt-1">
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600 text-xs font-bold">✓</span>
              <div>
                <h4 className="text-xs font-black text-neutral-800">Gerçek Kapasiteyi (SOH) Görün</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">Gösterge panelindeki yanıltıcı veriler yerine, BMS (Batarya Yönetim Sistemi) üzerinden çekilen net verilerle ölçüm yapılır.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600 text-xs font-bold">✓</span>
              <div>
                <h4 className="text-xs font-black text-neutral-800">Kalan Hücre Ömrünü Öğrenin</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">Bataryanın mevcut degradasyon hızına göre tahmini kalan ömrü bilimsel algoritmalarla hesaplanır.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600 text-xs font-bold">✓</span>
              <div>
                <h4 className="text-xs font-black text-neutral-800">Sertifikalı Güvence</h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">Evos onaylı batarya raporuna sahip ilanlar, pazaryerinde öne çıkar ve ortalama 14 gün daha hızlı satılır.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-neutral-50 rounded border border-neutral-150 text-[11px] text-neutral-500 leading-relaxed">
            * Batarya analiz raporu oluşturma hizmeti <strong>1.490 ₺</strong> olarak ücretlendirilir. Rapor oluşturulduğunda ilanınız otomatik olarak "Evos Doğrulamalı" statüsü kazanır.
          </div>
        </div>

        {/* Right Side: Interactive Report Card exactly as in media_1787852136685.jpg */}
        <div className="rounded-2xl bg-[#091526] p-6 text-white border border-neutral-800 shadow-xl w-full max-w-md mx-auto">
          <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase">
            BATARYA ANALİZİ
          </span>
          <h2 className="text-xl font-black tracking-tight sm:text-2xl mt-1 mb-5">
            Batarya Raporu
          </h2>

          <div className="flex flex-col gap-4">
            {/* Model Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase">MODEL SEÇ</label>
              <select
                className="rounded bg-neutral-900 border border-neutral-800 text-xs px-3 py-2.5 focus:border-sky-500 focus:outline-none text-white font-semibold"
                defaultValue="id4"
              >
                <option value="id4">2026 Volkswagen ID.4 • EVOS doğ</option>
                <option value="togg">2024 Togg T10X V2 • EVOS doğ</option>
                <option value="tesla">2023 Tesla Model Y • EVOS doğ</option>
              </select>
            </div>

            {/* Sub Model tags */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-neutral-300">Örnek: 2026 Volkswagen ID.4</span>
              <span className="rounded bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">
                EVOS doğrulamalı
              </span>
            </div>

            <div className="mt-1">
              <span className="inline-block rounded bg-sky-950/50 border border-sky-500/30 px-2.5 py-1 text-[11px] font-black text-sky-400">
                VoltScore 97/100
              </span>
            </div>

            {/* Metrics List */}
            <div className="mt-4 flex flex-col gap-3.5 border-t border-neutral-800 pt-4">
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5">
                  <span>[⚡]</span> SOH
                </span>
                <span className="text-sm font-black text-sky-400">%100</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5">
                  <span>[🕒]</span> Tahmini kalan ömür
                </span>
                <span className="text-sm font-black text-neutral-100">1 yıl</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-850 pb-2">
                <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5">
                  <span>[⚡]</span> Hızlı şarj oranı
                </span>
                <span className="text-sm font-black text-neutral-100">Düşük</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-neutral-400 font-bold flex items-center gap-1.5">
                  <span>[🛡️]</span> Batarya risk seviyesi
                </span>
                <span className="text-sm font-black text-red-400">Yüksek</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <button className="w-full rounded bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 py-3 text-xs font-black text-white transition">
                Bu aracın raporunu gör
              </button>
              
              <button className="w-full flex items-center justify-center gap-1.5 rounded bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 py-3 text-xs font-black text-white transition">
                <span>🔊</span> Raporu Dinle
              </button>

              <button className="w-full mt-2 rounded bg-sky-500 hover:bg-sky-600 active:bg-sky-700 py-3.5 text-xs font-black text-white transition shadow-lg">
                Aracınıza Özel Sertifikalı Rapor Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
