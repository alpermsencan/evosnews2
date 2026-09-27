import React from "react";
import Link from "next/link";

const TYPES = [
  {
    name: "Sedan & Fastback",
    slug: "Sedan",
    icon: "🏎️",
    desc: "Aerodinamik, uzun menzilli ve konforlu yolculuklar",
    color: "from-blue-600 to-indigo-700",
    border: "hover:border-blue-500",
  },
  {
    name: "SUV & Crossover",
    slug: "SUV",
    icon: "🚙",
    desc: "Geniş hacim, yüksek sürüş pozisyonu ve aile konforu",
    color: "from-emerald-600 to-teal-700",
    border: "hover:border-emerald-500",
  },
  {
    name: "Hatchback & Şehir",
    slug: "Hatchback",
    icon: "🚗",
    desc: "Pratik, ekonomik ve şehir içinde yüksek manevra",
    color: "from-amber-500 to-orange-600",
    border: "hover:border-amber-500",
  },
  {
    name: "Spor & Coupe",
    slug: "Coupe",
    icon: "⚡",
    desc: "Üstün ivmelenme, dinamik yol tutuşu ve saf güç",
    color: "from-purple-600 to-pink-600",
    border: "hover:border-purple-500",
  },
  {
    name: "Ticari & Minivan",
    slug: "Minivan",
    icon: "🚐",
    desc: "Geniş yük ve yolcu kapasitesi, sıfır emisyonlu iş ortağı",
    color: "from-neutral-700 to-neutral-900",
    border: "hover:border-neutral-500",
  },
];

export default function VehicleTypeExplorer({ currentType }: { currentType?: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-150 pb-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <span>🚗</span> ARAÇ TİPİNE GÖRE KEŞFET!
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            İhtiyacınıza en uygun elektrikli araç segmentini inceleyin
          </p>
        </div>
        <Link
          href="/araclar"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition self-start sm:self-auto"
        >
          Tüm Araçları Gör →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
        {TYPES.map((t) => {
          const isCurrent = currentType?.toLowerCase() === t.slug.toLowerCase();
          return (
            <Link
              key={t.slug}
              href={`/araclar?bodyType=${encodeURIComponent(t.slug)}`}
              className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                isCurrent
                  ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                  : `border-neutral-200 bg-neutral-50/60 hover:bg-white hover:shadow-md ${t.border}`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl transition group-hover:scale-110 duration-200">
                  {t.icon}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 group-hover:text-neutral-700">
                  Keşfet ›
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-neutral-900 group-hover:text-emerald-600 transition">
                  {t.name}
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                  {t.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
