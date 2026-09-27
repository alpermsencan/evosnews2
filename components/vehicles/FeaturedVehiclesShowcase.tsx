import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/utils";

// Öne çıkan vitrin modellerinin hedef slug ve özellikleri
const SHOWCASE_CONFIGS = [
  {
    brand: "TOGG",
    model: "T10X",
    slug: "togg-t10x-v2-2026",
    tag: "Yerli Gurur & %0 Faiz",
    tagColor: "bg-emerald-500 text-black",
    fallbackPrice: 1823000,
    range: 523,
    power: "218 HP",
    dcSpeed: "180 kW",
    body: "C-SUV",
    image: "/uploads/1790500663017-ldoyp-2023-togg-t10x-ozellikler-teknik.jpg",
  },
  {
    brand: "TOGG",
    model: "T10F Fastback",
    slug: "togg-t10f-fastback-2026",
    tag: "Yakında Yollarda",
    tagColor: "bg-sky-500 text-white",
    fallbackPrice: 1750000,
    range: 600,
    power: "218 HP",
    dcSpeed: "180 kW",
    body: "Fastback Sedan",
    image: "https://www.togg.com.tr/assets/img/68cd40855cc5b3b63d149fb2_t10f-version-features-section.webp",
  },
  {
    brand: "Tesla",
    model: "Model Y 'Juniper'",
    slug: "tesla-model-y-juniper-2026",
    tag: "%25 ÖTV Diliminde",
    tagColor: "bg-rose-500 text-white",
    fallbackPrice: 1865000,
    range: 455,
    power: "299 HP",
    dcSpeed: "250 kW",
    body: "D-SUV",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200",
  },
  {
    brand: "Kia",
    model: "EV3 Long Range",
    slug: "kia-ev3-long-range-2026",
    tag: "Yılın Elektrikli Aracı",
    tagColor: "bg-amber-500 text-black",
    fallbackPrice: 1780000,
    range: 605,
    power: "204 HP",
    dcSpeed: "128 kW",
    body: "B-SUV",
    image: "https://www.kia.com/content/dam/kwcms/tr/tr/images/showroom/ev3/ozellikler/360/abp-gtl/kia-ev3-my25-gtl-abp-aurorablackpearl-19_0000.png",
  },
  {
    brand: "Kia",
    model: "EV6 GT-Line",
    slug: "kia-ev6-gtline-2026",
    tag: "800V Ultra Hızlı Şarj",
    tagColor: "bg-purple-600 text-white",
    fallbackPrice: 3250000,
    range: 528,
    power: "229 HP",
    dcSpeed: "239 kW",
    body: "Crossover",
    image: "https://www.kia.com/content/dam/kwcms/tr/tr/images/showroom/YeniEV6/ev6-my25.png",
  },
  {
    brand: "Kia",
    model: "EV9 Earth (7 Koltuk)",
    slug: "kia-ev9-earth-2026",
    tag: "Lüks 7 Kişilik Amiral",
    tagColor: "bg-neutral-900 text-white",
    fallbackPrice: 4950000,
    range: 505,
    power: "384 HP",
    dcSpeed: "210 kW",
    body: "E-SUV",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
  },
  {
    brand: "Hyundai",
    model: "Inster",
    slug: "hyundai-inster",
    tag: "1.527.623 ₺ En Erişilebilir",
    tagColor: "bg-emerald-600 text-white",
    fallbackPrice: 1527623,
    range: 360,
    power: "97 HP",
    dcSpeed: "73 kW",
    body: "Kompakt SUV",
    image: "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
  },
  {
    brand: "Hyundai",
    model: "Ioniq 5 Advance",
    slug: "hyundai-ioniq-5-2026",
    tag: "Retro-Fütüristik 800V",
    tagColor: "bg-cyan-600 text-white",
    fallbackPrice: 2280000,
    range: 570,
    power: "229 HP",
    dcSpeed: "233 kW",
    body: "Crossover",
    image: "https://dmassets.hyundai.com/is/image/hyundaiautoever/01_IONIQ5N_Exterior_Driving_Circuit_Front_01_crop",
  },
  {
    brand: "Hyundai",
    model: "Ioniq 6 Progressive",
    slug: "hyundai-ioniq-6-2026",
    tag: "614 km Uzun Menzil",
    tagColor: "bg-indigo-600 text-white",
    fallbackPrice: 2450000,
    range: 614,
    power: "229 HP",
    dcSpeed: "233 kW",
    body: "Sedan Streamliner",
    image: "https://dmassets.hyundai.com/is/image/hyundaiautoever/Hyundai_IONIQ6_Exterior-Side_v006",
  },
];

export default async function FeaturedVehiclesShowcase() {
  // Veritabanından güncel verileri çekmeye çalışalım
  const slugs = SHOWCASE_CONFIGS.map((c) => c.slug);
  const dbVehicles = await prisma.vehicle.findMany({
    where: { slug: { in: slugs } },
    select: {
      id: true,
      brand: true,
      model: true,
      slug: true,
      price: true,
      rangeKm: true,
      motorPowerHp: true,
      dcChargeKw: true,
      image: true,
      bodyType: true,
    },
  });

  const dbMap = new Map(dbVehicles.map((v) => [v.slug, v]));

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
      {/* Vitrin Başlığı */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-black text-sm font-black shadow-xs">
            ⭐
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-neutral-900">
                ÖNE ÇIKAN VİTRİN MODELLERİ
              </h2>
              <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black">
                2026 Favorileri
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              TOGG, Tesla Model Y, KIA EV Serisi ve Hyundai Ioniq / Inster modelleri
            </p>
          </div>
        </div>

        <Link
          href="/araclar"
          className="text-xs font-bold text-neutral-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto transition"
        >
          Tüm 79 Modeli Gör →
        </Link>
      </div>

      {/* Vitrin Kartları Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOWCASE_CONFIGS.map((conf) => {
          const dbItem = dbMap.get(conf.slug);
          const price = dbItem?.price || conf.fallbackPrice;
          const range = dbItem?.rangeKm || conf.range;
          const power = dbItem?.motorPowerHp ? `${dbItem.motorPowerHp} HP` : conf.power;
          const dcSpeed = dbItem?.dcChargeKw ? `${dbItem.dcChargeKw} kW` : conf.dcSpeed;
          const displayImage = dbItem?.image || conf.image;

          return (
            <Link
              key={conf.slug}
              href={`/arac/${conf.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50/40 p-3.5 transition-all hover:-translate-y-1 hover:border-emerald-500/60 hover:bg-white hover:shadow-lg"
            >
              <div>
                {/* Rozet & Kasa */}
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span className="text-[11px] font-black uppercase text-neutral-800 tracking-wider">
                    {conf.brand}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-black tracking-wide ${conf.tagColor}`}
                  >
                    {conf.tag}
                  </span>
                </div>

                {/* Model Görseli */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-100 flex items-center justify-center">
                  <img
                    src={displayImage}
                    alt={`${conf.brand} ${conf.model}`}
                    className="h-full w-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-1.5 left-1.5 rounded bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {conf.body}
                  </div>
                </div>

                {/* Model İsmi */}
                <h3 className="mt-2.5 text-sm font-black text-neutral-900 group-hover:text-emerald-700 transition leading-snug">
                  {conf.brand} {conf.model}
                </h3>

                {/* Teknik Özellikler Rozetleri */}
                <div className="mt-2 grid grid-cols-3 gap-1 text-center">
                  <div className="rounded-md bg-white border border-neutral-200/80 p-1.5">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase">Menzil</span>
                    <span className="text-[11px] font-black text-neutral-900">{range} km</span>
                  </div>
                  <div className="rounded-md bg-white border border-neutral-200/80 p-1.5">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase">Güç</span>
                    <span className="text-[11px] font-black text-neutral-900">{power}</span>
                  </div>
                  <div className="rounded-md bg-white border border-neutral-200/80 p-1.5">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase">Hızlı DC</span>
                    <span className="text-[11px] font-black text-neutral-900">{dcSpeed}</span>
                  </div>
                </div>
              </div>

              {/* Fiyat & İncele */}
              <div className="mt-3 pt-2.5 border-t border-neutral-150 flex items-center justify-between">
                <div>
                  <span className="block text-[9px] font-bold text-neutral-600 uppercase">Başlangıç</span>
                  <span className="text-xs sm:text-sm font-black text-emerald-700 tracking-tight">
                    {formatTL(price)}
                  </span>
                </div>
                <span className="rounded-lg bg-neutral-900 group-hover:bg-emerald-600 text-white px-2.5 py-1 text-[11px] font-bold transition">
                  İncele →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
