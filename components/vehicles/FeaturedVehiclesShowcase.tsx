import React from "react";
import { prisma } from "@/lib/prisma";
import FeaturedVehiclesSlider, {
  ShowcaseVehicle,
} from "@/components/vehicles/FeaturedVehiclesSlider";

// Öne çıkan vitrin modellerinin hedef slug ve özellikleri
const SHOWCASE_CONFIGS = [
  {
    brand: "TOGG",
    model: "T10X V2 Uzun Menzil",
    slug: "togg-t10x-v2-2026",
    tag: "Yerli Gurur & %0 Faiz",
    tagColor: "bg-emerald-600 text-white",
    fallbackPrice: 1823000,
    range: 523,
    power: "218 HP",
    dcSpeed: "180 kW",
    body: "C-SUV",
    acceleration: "7.4 sn",
    image: "https://dolubatarya.com/uploads/2021/12/2023-togg-t10x-ozellikler-teknik.jpg",
  },
  {
    brand: "TOGG",
    model: "T10F Fastback",
    slug: "togg-t10f-fastback-2026",
    tag: "Yakında Yollarda",
    tagColor: "bg-sky-600 text-white",
    fallbackPrice: 1750000,
    range: 600,
    power: "218 HP",
    dcSpeed: "180 kW",
    body: "Fastback Sedan",
    acceleration: "7.2 sn",
    image: "https://www.togg.com.tr/assets/img/68cd40855cc5b3b63d149fb2_t10f-version-features-section.webp",
  },
  {
    brand: "Tesla",
    model: "Model Y 'Juniper' RWD",
    slug: "tesla-model-y-juniper-2026",
    tag: "%25 ÖTV Diliminde",
    tagColor: "bg-rose-600 text-white",
    fallbackPrice: 1865000,
    range: 455,
    power: "299 HP",
    dcSpeed: "250 kW",
    body: "D-SUV",
    acceleration: "6.9 sn",
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200",
  },
  {
    brand: "Kia",
    model: "EV3 Long Range",
    slug: "kia-ev3-long-range-2026",
    tag: "Yılın Elektrikli Aracı",
    tagColor: "bg-amber-500 text-neutral-950",
    fallbackPrice: 1780000,
    range: 605,
    power: "204 HP",
    dcSpeed: "128 kW",
    body: "B-SUV",
    acceleration: "7.5 sn",
    image: "https://www.kia.com/content/dam/kwcms/tr/tr/images/showroom/ev3/ozellikler/360/abp-gtl/kia-ev3-my25-gtl-abp-aurorablackpearl-19_0000.png",
  },
  {
    brand: "Hyundai",
    model: "Inster",
    slug: "hyundai-inster",
    tag: "En Erişilebilir EV",
    tagColor: "bg-emerald-600 text-white",
    fallbackPrice: 1527623,
    range: 360,
    power: "97 HP",
    dcSpeed: "73 kW",
    body: "Kompakt SUV",
    acceleration: "10.6 sn",
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
    acceleration: "7.3 sn",
    image: "https://dmassets.hyundai.com/is/image/hyundaiautoever/01_IONIQ5N_Exterior_Driving_Circuit_Front_01_crop",
  },
];

export default async function FeaturedVehiclesShowcase() {
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
      acceleration: true,
      image: true,
      bodyType: true,
    },
  });

  const dbMap = new Map(dbVehicles.map((v) => [v.slug, v]));

  const vehicles: ShowcaseVehicle[] = SHOWCASE_CONFIGS.map((conf) => {
    const dbItem = dbMap.get(conf.slug);
    return {
      brand: conf.brand,
      model: conf.model,
      slug: conf.slug,
      tag: conf.tag,
      tagColor: conf.tagColor,
      price: dbItem?.price || conf.fallbackPrice,
      range: dbItem?.rangeKm || conf.range,
      power: dbItem?.motorPowerHp ? `${dbItem.motorPowerHp} HP` : conf.power,
      dcSpeed: dbItem?.dcChargeKw ? `${dbItem.dcChargeKw} kW` : conf.dcSpeed,
      body: dbItem?.bodyType || conf.body,
      acceleration: dbItem?.acceleration ? `${dbItem.acceleration} sn` : conf.acceleration,
      image: dbItem?.image || conf.image,
    };
  });

  return <FeaturedVehiclesSlider vehicles={vehicles} />;
}
