"use client";

import { IconBattery, IconBolt, IconShield, IconChart, IconClock } from "@/components/ui/Icons";

export default function EvosIntelligence() {
  // Günlük öne çıkarılan canlı araç verisi (mock verisi)
  const featuredEv = {
    brand: "Togg",
    model: "T10X V2 Uzun Menzil",
    year: 2024,
    km: 24500,
    voltScore: 92,
    batteryHealth: 96,
    realRangeKm: 420,
    dcChargeKw: 150,
    warrantyMonthsLeft: 36,
    serviceHistory: "Yetkili Servis Bakımlı (Sıkıntısız)",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80"
  };

  return (
    <section className="px-3 sm:px-0">
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 text-white shadow-lg">
        {/* Başlık Alanı */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-volt text-black animate-pulse">
              <IconChart className="h-4 w-4" />
            </span>
            <h2 className="text-sm font-black tracking-wider text-neutral-200">
              EVOS INTELLIGENCE
            </h2>
          </div>
          <span className="rounded bg-volt/10 px-2 py-0.5 text-[10px] font-black text-volt">
            GÜNLÜK CANLI ARAÇ VERİSİ
          </span>
        </div>

        {/* İçerik */}
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-3">
          {/* Sol: Araç Başlığı & VoltScore Daire Göstergesi */}
          <div className="flex flex-col items-center justify-center border-b border-neutral-800 pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-5">
            <div className="relative w-full aspect-[16/10] mb-3 overflow-hidden rounded bg-neutral-950 border border-neutral-800">
              <img
                src={featuredEv.image}
                alt={`${featuredEv.brand} ${featuredEv.model}`}
                className="object-cover w-full h-full opacity-85 hover:opacity-100 transition duration-300"
              />
            </div>
            <h3 className="text-center text-base font-black text-white">
              {featuredEv.brand} {featuredEv.model}
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">{featuredEv.year} · {featuredEv.km.toLocaleString("tr-TR")} km</p>
            
            <div className="relative mt-3 flex items-center justify-center">
              {/* Daire Grafik */}
              <svg className="h-28 w-28 transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-neutral-800" strokeWidth="8" fill="transparent" />
                <circle cx="56" cy="56" r="48" className="stroke-volt" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - featuredEv.voltScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{featuredEv.voltScore}</span>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">VoltScore</span>
              </div>
            </div>
          </div>

          {/* Orta & Sağ: Canlı Metrik Kartları */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            {/* Batarya Sağlığı */}
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400">
                <IconBattery className="h-4 w-4 text-volt" />
                <span className="text-[10px] font-black uppercase tracking-wider">BATARYA SAĞLIĞI</span>
              </div>
              <p className="text-xl font-black text-white mt-1">%{featuredEv.batteryHealth}</p>
              <span className="text-[9px] text-neutral-500 block mt-0.5">SOH Ölçümü Doğrulanmış</span>
            </div>

            {/* Gerçek Menzil */}
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400">
                <IconBolt className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">GERÇEK MENZİL</span>
              </div>
              <p className="text-xl font-black text-white mt-1">{featuredEv.realRangeKm} km</p>
              <span className="text-[9px] text-neutral-500 block mt-0.5">Mevsimsel Yol Testi Uyumlu</span>
            </div>

            {/* DC Şarj Hızı */}
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400">
                <IconBolt className="h-4 w-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-wider">DC ŞARJ HIZI</span>
              </div>
              <p className="text-xl font-black text-white mt-1">{featuredEv.dcChargeKw} kW</p>
              <span className="text-[9px] text-neutral-500 block mt-0.5">10-80% Dolum: 28 dk</span>
            </div>

            {/* Garanti */}
            <div className="rounded-lg bg-neutral-950 p-3.5 border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400">
                <IconShield className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-wider">KALAN GARANTİ</span>
              </div>
              <p className="text-xl font-black text-white mt-1">{featuredEv.warrantyMonthsLeft} Ay</p>
              <span className="text-[9px] text-neutral-500 block mt-0.5">Üretici Batarya Garantisi</span>
            </div>

            {/* Servis Geçmişi */}
            <div className="col-span-2 rounded-lg bg-neutral-950 p-3 border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconClock className="h-4 w-4 text-neutral-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">SERVİS GEÇMİŞİ:</span>
                <span className="text-xs font-bold text-neutral-200">{featuredEv.serviceHistory}</span>
              </div>
              <span className="rounded bg-emerald-950 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                GÜVENLİ
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
