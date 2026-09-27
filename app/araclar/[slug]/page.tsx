import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import VehicleCard from "@/components/vehicles/VehicleCard";
import ModernVehicleHeader from "@/components/vehicles/ModernVehicleHeader";
import ModernVehicleGallery from "@/components/vehicles/ModernVehicleGallery";
import ModernVehicleSpecBadges from "@/components/vehicles/ModernVehicleSpecBadges";
import ModernVehicleSpecsGrid from "@/components/vehicles/ModernVehicleSpecsGrid";
import VehicleTypeExplorer from "@/components/vehicles/VehicleTypeExplorer";
import SectionTitle from "@/components/news/SectionTitle";
import { calcOtv, formatTL } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function findVehicleByParam(rawParam: string) {
  const clean = decodeURIComponent(rawParam).trim();
  const lower = clean.toLowerCase();

  // 1. Direct match by slug
  let v = await prisma.vehicle.findFirst({
    where: {
      OR: [{ slug: lower }, { slug: clean }],
    },
    include: {
      syncImages: {
        where: { NOT: { type: "ignored" } },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (v) return v;

  // 2. Direct match by ObjectId
  if (/^[a-f\d]{24}$/i.test(clean)) {
    v = await prisma.vehicle.findUnique({
      where: { id: clean },
      include: {
        syncImages: {
          where: { NOT: { type: "ignored" } },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
      },
    });
    if (v) return v;
  }

  // 3. Match by externalId or partial slug
  v = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { externalId: lower },
        { externalId: `dolubatarya-${lower}` },
        { externalId: { contains: lower, mode: "insensitive" } },
        { slug: { contains: lower, mode: "insensitive" } },
      ],
    },
    include: {
      syncImages: {
        where: { NOT: { type: "ignored" } },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (v) return v;

  // 4. Normalized variations (stripping common suffixes/prefixes)
  const stripped = lower
    .replace(/^dolubatarya-/, "")
    .replace(/-[a-f0-9]{8}$/, "")
    .replace(/-202[0-9]$/, "")
    .replace(/-v[0-9]/, "")
    .replace(/-fastback/, "")
    .replace(/-sedan/, "")
    .replace(/-ozellikler$/, "");

  if (stripped && stripped.length > 2) {
    v = await prisma.vehicle.findFirst({
      where: {
        OR: [
          { slug: { contains: stripped, mode: "insensitive" } },
          { externalId: { contains: stripped, mode: "insensitive" } },
          { model: { contains: stripped, mode: "insensitive" } },
        ],
      },
      include: {
        syncImages: {
          where: { NOT: { type: "ignored" } },
          orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
        },
      },
    });
    if (v) return v;
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await findVehicleByParam(slug);
  if (!v) return { title: "Araç bulunamadı" };
  return {
    title: `${v.brand} ${v.model} (${v.year}) · Teknik Özellikler, Menzil ve Fiyat`,
    description:
      v.description ||
      `${v.brand} ${v.model} özellikleri: ${v.rangeKm} km WLTP menzil, ${v.batteryKwh} kWh batarya, ${v.motorPowerHp} HP güç ve güncel fiyat bilgileri.`,
  };
}

export default async function VehicleDetail({ params }: Props) {
  const { slug } = await params;
  const vehicle = await findVehicleByParam(slug);

  if (!vehicle) notFound();

  const [similar, stations] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        OR: [{ segment: vehicle.segment }, { bodyType: vehicle.bodyType }],
        NOT: { id: vehicle.id },
      },
      take: 4,
      orderBy: { price: "asc" },
      include: { syncImages: true },
    }),
    prisma.chargeStation.findMany({
      where: vehicle.dcChargeKw != null ? { maxPowerKw: { gte: vehicle.dcChargeKw } } : {},
      take: 4,
      orderBy: { maxPowerKw: "desc" },
    }),
  ]);

  // ÖTV kırılımı
  const rate = vehicle.otvRate;
  const base = Math.round(vehicle.price / (1.2 * (1 + rate / 100)));
  const breakdown = calcOtv(base, vehicle.motorPowerKw);

  // Yakıt tasarrufu hesabı
  const yearlyKm = 20000;
  const energyCost = Math.round((yearlyKm / 100) * vehicle.consumption * 4.9);
  const iceCost = Math.round((yearlyKm / 100) * 400);
  const annualSavings = Math.max(0, iceCost - energyCost);

  // Görselleri hazırla
  const validSyncImages = vehicle.syncImages
    .map((img) => img.url)
    .filter((url) => Boolean(url) && !url.includes("togg-t10x-iaa-2025.jpg") && !url.startsWith("/media/"));

  const primarySync = vehicle.syncImages.find((img) => img.isPrimary && !img.url.startsWith("/media/"))?.url;
  const validVehicleImg = vehicle.image && !vehicle.image.startsWith("/media/") ? vehicle.image : null;
  const validVehicleImages = (vehicle.images || []).filter((u) => Boolean(u) && !u.startsWith("/media/"));

  const defaultImg =
    primarySync ||
    validVehicleImg ||
    validSyncImages[0] ||
    validVehicleImages[0] ||
    "/arac-placeholder.svg";

  const allGallery = Array.from(
    new Set([defaultImg, ...validSyncImages, ...validVehicleImages].filter(Boolean))
  ).filter((url) => !url.includes("togg-t10x-iaa-2025.jpg") && !url.startsWith("/media/"));

  const galleryImages = allGallery.length > 0 ? allGallery : [defaultImg];

  return (
    <div className="flex flex-col gap-8 px-3 sm:px-0 py-4 max-w-7xl mx-auto w-full">
      {/* 1. Üst Başlık & Ekmek Kırıntısı (Breadcrumbs) */}
      <ModernVehicleHeader
        brand={vehicle.brand}
        model={vehicle.model}
        slug={vehicle.slug}
      />

      {/* 2. Ana Vitrin Bölümü: Sol Galeri + Sağ Renkli Rozetler (Mercedes EQS Stili) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sol Kolon: Gelişmiş Galeri & Önizlemeler */}
        <div className="lg:col-span-7 w-full">
          <ModernVehicleGallery
            defaultImage={defaultImg}
            images={galleryImages.slice(1)}
            alt={`${vehicle.brand} ${vehicle.model}`}
          />
        </div>

        {/* Sağ Kolon: Öne Çıkan Renkli Rozetler & Aksiyonlar */}
        <div className="lg:col-span-5 w-full">
          <ModernVehicleSpecBadges
            vehicle={vehicle}
            otvBase={breakdown.base}
          />
        </div>
      </div>

      {/* 3. Yıllık Yakıt ve Enerji Tasarrufu Özeti */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-800 shadow-sm gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-black text-2xl font-black shrink-0">
            🌱
          </span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-400">
              YILLIK ENERJİ TASARRUFU TAHMİNİ (20.000 KM)
            </div>
            <div className="text-sm font-semibold text-emerald-100 mt-0.5">
              Benzinli eşdeğerine göre yılda yaklaşık{" "}
              <strong className="text-white font-black">{formatTL(annualSavings)}</strong> yakıt
              tasarrufu sağlar.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[11px] text-emerald-300 font-bold">EV Şarj: {formatTL(energyCost)}/yıl</span>
            <span className="text-[11px] text-emerald-400/80 font-bold">Benzin: {formatTL(iceCost)}/yıl</span>
          </div>
          <Link
            href="/otv-rehberi"
            className="px-4 py-2 rounded-xl bg-emerald-400 text-black font-black text-xs hover:bg-emerald-300 transition"
          >
            Hesaplayıcı
          </Link>
        </div>
      </div>

      {/* 4. 4 Sütunlu Kapsamlı Teknik Özellikler Tablosu (DoluBatarya Stili) */}
      <ModernVehicleSpecsGrid
        specs={{
          motorPowerHp: vehicle.motorPowerHp,
          motorPowerKw: vehicle.motorPowerKw,
          torqueNm: vehicle.torqueNm,
          topSpeed: vehicle.topSpeed,
          acceleration: vehicle.acceleration,
          motorCount: vehicle.motorCount,
          driveType: vehicle.driveType,
          motorType: vehicle.motorType,
          batteryKwh: vehicle.batteryKwh,
          batteryUsableKwh: vehicle.batteryUsableKwh,
          rangeKm: vehicle.rangeKm,
          dcChargeKw: vehicle.dcChargeKw,
          acChargeKw: vehicle.acChargeKw,
          chargeMin: vehicle.chargeMin,
          acChargeHour: vehicle.acChargeHour,
          consumption: vehicle.consumption,
          weightKg: vehicle.weightKg,
          lengthMm: vehicle.lengthMm,
          widthMm: vehicle.widthMm,
          heightMm: vehicle.heightMm,
          trunkLiter: vehicle.trunkLiter,
          bodyType: vehicle.bodyType,
          year: vehicle.year,
          originCountry: vehicle.originCountry,
          heatPump: vehicle.heatPump,
          v2l: vehicle.v2l,
          warranty: vehicle.warranty,
          segment: vehicle.segment,
          extraSpecs: vehicle.extraSpecs as Record<string, Record<string, string>> | null,
        }}
      />

      {/* 5. Araç Tipine Göre Keşfet Modülü */}
      <VehicleTypeExplorer currentType={vehicle.bodyType} />

      {/* 6. Benzer Elektrikli Araçlar */}
      {similar.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle
            title={`${vehicle.segment.toUpperCase()} SEGMENTİNDEKİ ALTERNATİFLER`}
            color="#059669"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map((car) => (
              <VehicleCard key={car.id} vehicle={car} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Uyumlu Şarj İstasyonları */}
      {stations.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle title="UYUMLU HIZLI ŞARJ İSTASYONLARI" color="#2563eb" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stations.map((st) => (
              <div
                key={st.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-neutral-200 bg-white hover:shadow-md transition"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {st.network}
                  </span>
                  <h4 className="text-sm font-black text-neutral-900 mt-2 truncate">
                    {st.name}
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    {st.city} · {st.district || "Merkez"}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 text-xs">
                  <span className="font-bold text-neutral-700">{st.maxPowerKw} kW DC</span>
                  <Link
                    href={`/sarj-agi?lat=${st.lat}&lng=${st.lng}`}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Rotada Gör →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
