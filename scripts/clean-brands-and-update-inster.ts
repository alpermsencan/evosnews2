import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const allowedBrands = [
  "togg", "tesla", "audi", "vw", "volkswagen", "citroen", "citroën", "kia",
  "hyundai", "renault", "ford", "peugeot", "opel", "mg", "bmw", "byd",
  "cupra", "kgm", "leapmotor", "mercedes-benz", "mercedes", "porsche",
  "porcshe", "bentley", "ferrari", "skoda", "škoda", "jaguar", "volvo",
  "mini", "maserati", "alfa romeo", "toyota", "dacia", "fiat", "seres",
  "skywell", "subaru", "jeep", "lexus", "maxus"
];

function isBrandAllowed(brand: string): boolean {
  const norm = brand.toLowerCase().trim();
  return allowedBrands.some(
    (a) => norm === a || norm.startsWith(a) || a.startsWith(norm)
  );
}

async function main() {
  console.log("=== 1. Marka Filtreleme ve Temizleme Başlıyor ===");

  const allVehicles = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, slug: true },
  });

  const toDelete = allVehicles.filter((v) => !isBrandAllowed(v.brand));
  console.log(`Silinecek araç sayısı: ${toDelete.length} (İzinli olmayan markalar)`);

  for (const v of toDelete) {
    // Delete syncImages
    await prisma.vehicleImage.deleteMany({ where: { vehicleId: v.id } });
    // Delete variants
    await prisma.vehicleVariant.deleteMany({ where: { vehicleId: v.id } });
    // Delete vehicle
    await prisma.vehicle.delete({ where: { id: v.id } });
    console.log(`  ✕ Silindi: ${v.brand} ${v.model} (${v.slug})`);
  }

  // Normalize "Togg" to "TOGG"
  await prisma.vehicle.updateMany({
    where: { brand: "Togg" },
    data: { brand: "TOGG" },
  });

  console.log("\n=== 2. Hyundai Inster Güncellemesi Başlıyor ===");
  const insterImages = [
    "https://dolubatarya.com/uploads/2024/12/hyundai-inster-6192.jpg",
    "https://dolubatarya.com/uploads/2024/12/hyundai-inster-507144-1920.jpg.webp",
    "https://dolubatarya.com/uploads/2024/12/hyundai-inster-760248-1920.webp",
    "https://dolubatarya.com/uploads/2024/12/hyundai-inster-760248-1920.jpg.webp",
    "https://dolubatarya.com/uploads/2024/12/hyundai-inster-760248-1920_1.jpg.webp",
  ];

  const insterData = {
    brand: "Hyundai",
    model: "Inster",
    slug: "hyundai-inster",
    year: 2024,
    segment: "A-SUV",
    bodyType: "SUV",
    image: insterImages[0],
    images: insterImages,
    marketStatus: "TR_YAYINDA",
    price: 1527623,
    otvRate: 10,
    rangeKm: 360,
    batteryKwh: 49,
    batteryUsableKwh: 46.5,
    motorPowerKw: 72,
    motorPowerHp: 97,
    torqueNm: 147,
    acceleration: 10.6,
    topSpeed: 150,
    consumption: 15.1,
    driveType: "FWD",
    motorCount: "Tek Motor",
    motorType: "Permanent Magnet Synchronous Motor",
    dcChargeKw: 73,
    chargeMin: 30,
    acChargeKw: 10.5,
    acChargeHour: 4.5,
    weightKg: 1305,
    lengthMm: 3825,
    widthMm: 1610,
    heightMm: 1610,
    trunkLiter: 238,
    originCountry: "Güney Kore",
    heatPump: "Var",
    v2l: "Yok",
    warranty: "8 yıl / 160.000 km",
    rating: 9.2,
    isFeatured: true,
    pros: [
      "Kompakt boyutlar ve şehir içi çeviklik",
      "Geniş baş mesafesi ve modüler koltuklar",
      "Segmentinde ısı pompası standardı",
      "Hızlı şarj (%10-80 30 dakika)",
    ],
    cons: [
      "Otoyol hızlarında sınırlı azami hız",
      "Kompakt bagaj hacmi",
    ],
    description:
      "Hyundai Inster, kompakt A-SUV boyutları, 360 km WLTP menzili, 73 kW DC hızlı şarjı ve standart ısı pompasıyla şehir içi elektrikli mobilitenin yeni temsilcisi.",
    priceSource: "DoluBatarya (1.527.623 ₺)",
    priceUpdatedAt: new Date(),
  };

  const existingInster = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { slug: "hyundai-inster" },
        { slug: "hyundai-inster-ev-2026" },
        { model: { contains: "Inster" } },
      ],
    },
  });

  let insterId: string;
  if (existingInster) {
    const updated = await prisma.vehicle.update({
      where: { id: existingInster.id },
      data: insterData,
    });
    insterId = updated.id;
    console.log("  ✓ Mevcut Inster kaydı güncellendi:", updated.brand, updated.model, updated.slug);
  } else {
    const created = await prisma.vehicle.create({
      data: insterData,
    });
    insterId = created.id;
    console.log("  ✓ Yeni Inster kaydı oluşturuldu:", created.brand, created.model, created.slug);
  }

  // Update syncImages for Inster
  await prisma.vehicleImage.deleteMany({ where: { vehicleId: insterId } });
  for (let i = 0; i < insterImages.length; i++) {
    await prisma.vehicleImage.create({
      data: {
        vehicleId: insterId,
        url: insterImages[i],
        cloudinaryPublicId: `inster-img-${i}`,
        type: i === 0 ? "exterior" : "gallery",
        source: "dolubatarya",
        sourceUrl: insterImages[i],
        externalId: `inster-img-db-${i}`,
        isPrimary: i === 0,
      },
    });
  }
  console.log(`  ✓ Inster için ${insterImages.length} adet görsel başarıyla bağlandı.`);

  // Final count
  const remainingCount = await prisma.vehicle.count();
  const distinctRemainingBrands = await prisma.vehicle.findMany({
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  console.log("\n=== İŞLEM TAMAMLANDI ===");
  console.log(`Veritabanında Kalan Araç Sayısı: ${remainingCount}`);
  console.log(`Kalan Markalar (${distinctRemainingBrands.length}):`, distinctRemainingBrands.map((b) => b.brand));
}

main()
  .catch((e) => console.error("Hata:", e))
  .finally(() => prisma.$disconnect());
