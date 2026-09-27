import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EUR_TRY_RATE = 40; // Yaklaşık Euro/TL kuru

function cleanNumber(str?: string | null): number | null {
  if (!str) return null;
  // Virgülleri noktaya çevir
  const normalized = str.replace(",", ".");
  const match = normalized.match(/[\d.]+/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return Number.isFinite(num) ? num : null;
}

function cleanInt(str?: string | null): number | null {
  const n = cleanNumber(str);
  return n != null ? Math.round(n) : null;
}

function parsePrice(rawPrice?: string | null): number {
  if (!rawPrice) return 2500000;
  const clean = rawPrice.replace(/\./g, "").replace(",", ".");
  if (clean.includes("€") || clean.includes("EUR")) {
    const num = cleanNumber(clean);
    return num ? Math.round(num * EUR_TRY_RATE) : 3500000;
  }
  if (clean.includes("$") || clean.includes("USD")) {
    const num = cleanNumber(clean);
    return num ? Math.round(num * 37) : 3000000;
  }
  const num = cleanNumber(clean);
  if (num && num > 10000) return Math.round(num);
  return 2500000;
}

function determineSegment(lengthMm: number | null, rawTitle: string): string {
  if (rawTitle.toLowerCase().includes("eqs") || rawTitle.toLowerCase().includes("i7") || (lengthMm && lengthMm > 5100)) {
    return "F-Sedan";
  }
  if (rawTitle.toLowerCase().includes("eqe") || rawTitle.toLowerCase().includes("i5") || rawTitle.toLowerCase().includes("a6") || (lengthMm && lengthMm > 4900)) {
    return "E-Sedan";
  }
  if (rawTitle.toLowerCase().includes("model 3") || rawTitle.toLowerCase().includes("i4") || rawTitle.toLowerCase().includes("seal") || (lengthMm && lengthMm > 4650)) {
    return "D-Sedan";
  }
  return "C-Sedan";
}

async function fetchPageVehicles(page: number): Promise<{ href: string; title: string }[]> {
  const url = `https://dolubatarya.com/araba?vehicle_types=2&page=${page}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const carBoxes = [
      ...html.matchAll(/<div class=\"car-box\"[\s\S]*?<a href=\"([^\"]+)\" title=\"([^\"]+)\"/g),
    ];
    return carBoxes.map((c) => ({
      href: c[1].replace(/^\//, ""),
      title: c[2].trim(),
    }));
  } catch (e) {
    console.error(`Page ${page} error:`, e instanceof Error ? e.message : e);
    return [];
  }
}

async function scrapeVehicleDetail(slug: string) {
  const url = `https://dolubatarya.com/${slug}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Brand
    const brandMatch = html.match(/<div class=\"brand\"[\s\S]*?<span>(.*?)<\/span>/);
    const brand = brandMatch ? brandMatch[1].trim() : "Elektrikli";

    // Title / Model
    const titleMatch = html.match(/<div class=\"title\">[\s\S]*?<h1>(.*?)<\/h1>/);
    const rawTitle = titleMatch ? titleMatch[1].trim() : slug;
    let model = rawTitle;
    if (model.toLowerCase().startsWith(brand.toLowerCase())) {
      model = model.slice(brand.length).trim();
    }
    if (!model) model = rawTitle;

    // Top metadata (bodyType, year, origin, marketStatus)
    const topMetaMatches = [...html.matchAll(/<div class=\"top\">[\s\S]*?<ul>([\s\S]*?)<\/ul>/g)];
    let metaItems: string[] = [];
    if (topMetaMatches.length > 0) {
      metaItems = [
        ...topMetaMatches[0][1].matchAll(/<li>[\s\S]*?<span>(.*?)<\/span>[\s\S]*?<\/li>/g),
      ].map((m) => m[1].trim());
    }

    const bodyType = metaItems[0] || "Sedan";
    const year = cleanInt(metaItems[1]) || 2024;
    const originCountry = metaItems[2] || null;
    const statusText = metaItems[3] || "";
    let marketStatus = "TR_YAYINDA";
    if (statusText.includes("Yok")) marketStatus = "TR_YOK";
    else if (statusText.includes("Yakında")) marketStatus = "TR_YAKINDA";

    // Gallery images
    const galleryMatches = [
      ...html.matchAll(
        /<div class=\"item\">[\s\S]*?<a[^>]+href=\"([^\"]+)\"[^>]*>[\s\S]*?<img[^>]+src=\"([^\"]+)\"/g
      ),
    ];
    let images = galleryMatches.map((m) =>
      m[1].startsWith("http") ? m[1] : `https://dolubatarya.com/${m[1].replace(/^\//, "")}`
    );
    if (images.length === 0) {
      const fallbackImgs = [
        ...html.matchAll(/<img[^>]+src=\"(https:\/\/dolubatarya\.com\/uploads\/[^\"]+)\"/g),
      ].map((m) => m[1]);
      images = [...new Set(fallbackImgs)];
    }

    // Spec columns
    const footerIdx = html.indexOf('<div class=\"car-detail-footer\"');
    const footerHtml = footerIdx !== -1 ? html.slice(footerIdx) : "";
    const cols = footerHtml.split('<div class=\"column\">');
    const specs: Record<string, Record<string, string>> = {};

    for (let i = 1; i < cols.length; i++) {
      const c = cols[i];
      const titleM = c.match(/<div class=\"title\"[\s\S]*?<span>(.*?)<\/span>/);
      const colTitle = titleM ? titleM[1].trim() : `Col_${i}`;
      specs[colTitle] = {};

      const boxes = [
        ...c.matchAll(
          /<div class=\"box\">[\s\S]*?<div class=\"left\">([\s\S]*?)<\/div>[\s\S]*?<div class=\"right\">([\s\S]*?)<\/div>/g
        ),
      ];
      for (const b of boxes) {
        const k = b[1].replace(/<[^>]+>/g, "").trim();
        const v = b[2].replace(/<[^>]+>/g, "").trim();
        if (k) specs[colTitle][k] = v;
      }
    }

    // Price
    const bottomIdx = html.indexOf('<div class=\"bottom\">');
    let rawPrice = "";
    if (bottomIdx !== -1) {
      const lis = html.slice(bottomIdx, bottomIdx + 3000).split("<li>");
      for (const li of lis) {
        const t = li.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        if (t.includes("Fiyat")) rawPrice = t;
      }
    }
    const price = parsePrice(rawPrice);

    // Extract detailed technical specs
    const gucHiz = specs["Güç ve Hız"] || {};
    const bataryaSarj = specs["Batarya ve Şarj"] || {};
    const olculer = specs["Araç Ölçüleri"] || {};
    const ekstralar = specs["Ekstra Özellikler"] || {};

    const motorPowerHp = cleanInt(gucHiz["Motor Gücü"]) || 300;
    const motorPowerKw = Math.round(motorPowerHp / 1.341);
    const torqueNm = cleanInt(gucHiz["Tork"]);
    const topSpeed = cleanInt(gucHiz["Azami Hız"]) || 180;
    const acceleration = cleanNumber(gucHiz["0-100 km/s"]) || 5.5;
    const motorCount = gucHiz["Motor Sayısı"] || null;
    const driveType = (gucHiz["Sürüş Sistemi"] || "RWD").toUpperCase();
    const motorType = gucHiz["Motor Türü"] || null;

    const batteryKwh = cleanNumber(bataryaSarj["Batarya"]) || 75;
    const rangeKm = cleanInt(bataryaSarj["Menzil"]) || 450;
    const dcChargeKw = cleanInt(bataryaSarj["DC Şarj Hızı"]);
    const acChargeKw = cleanNumber(bataryaSarj["AC Şarj Hızı"]);
    const chargeMin = cleanInt(bataryaSarj["DC Şarj Süresi"]);
    const acChargeHour = cleanNumber(bataryaSarj["AC Şarj Süresi"]);
    const consumption = cleanNumber(bataryaSarj["Ortalama Tüketim"]) || 16.5;

    const weightKg = cleanInt(olculer["Ağırlık"]);
    const lengthMm = cleanInt(olculer["Uzunluk"]);
    const widthMm = cleanInt(olculer["Genişlik"]);
    const heightMm = cleanInt(olculer["Yükseklik"]);
    const trunkLiter = cleanInt(olculer["Bagaj Hacmi"]);

    const heatPump = ekstralar["Isı Pompası"] || null;
    const v2l = ekstralar["V2L"] || null;
    const segment = determineSegment(lengthMm, rawTitle);

    // ÖTV oranı hesabı
    let otvRate = 10;
    if (motorPowerKw > 160) {
      otvRate = 40;
    }

    return {
      brand,
      model,
      rawTitle,
      slug,
      year,
      segment,
      bodyType,
      marketStatus,
      price,
      otvRate,
      rangeKm,
      batteryKwh,
      motorPowerKw,
      motorPowerHp,
      acceleration,
      topSpeed,
      consumption,
      driveType,
      dcChargeKw,
      chargeMin,
      acChargeKw,
      acChargeHour,
      torqueNm,
      motorCount,
      motorType,
      lengthMm,
      widthMm,
      heightMm,
      weightKg,
      trunkLiter,
      originCountry,
      heatPump,
      v2l,
      images,
      rawPrice,
      extraSpecs: specs,
    };
  } catch (e) {
    console.error(`Detail error for ${slug}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function main() {
  console.log("=== DoluBatarya Elektrikli Sedan Araçları İçe Aktarımı Başlıyor ===");

  // 1. Tüm araç linklerini topla (Sayfa 1 - 5)
  const allVehiclesMap = new Map<string, string>();
  for (let page = 1; page <= 5; page++) {
    console.log(`Sayfa ${page} taranıyor...`);
    const cars = await fetchPageVehicles(page);
    for (const c of cars) {
      allVehiclesMap.set(c.href, c.title);
    }
  }

  const vehicleList = Array.from(allVehiclesMap.entries());
  console.log(`Toplam ${vehicleList.length} benzersiz araç bulundu!`);

  let successCount = 0;
  let updateCount = 0;
  let failCount = 0;

  for (let i = 0; i < vehicleList.length; i++) {
    const [slug, title] = vehicleList[i];
    console.log(`[${i + 1}/${vehicleList.length}] İşleniyor: ${title} (${slug})`);

    const data = await scrapeVehicleDetail(slug);
    if (!data) {
      console.warn(`  -> ${slug} verisi alınamadı, atlanıyor.`);
      failCount++;
      continue;
    }

    const coverImage = data.images[0] || "/arac-placeholder.svg";

    try {
      // Araç var mı kontrol et
      const existing = await prisma.vehicle.findFirst({
        where: { OR: [{ slug: data.slug }, { externalId: `dolubatarya-${data.slug}` }] },
      });

      const vehicleData = {
        brand: data.brand,
        model: data.model,
        slug: data.slug,
        year: data.year,
        segment: data.segment,
        bodyType: data.bodyType,
        marketStatus: data.marketStatus,
        price: data.price,
        otvRate: data.otvRate,
        rangeKm: data.rangeKm,
        batteryKwh: data.batteryKwh,
        motorPowerKw: data.motorPowerKw,
        motorPowerHp: data.motorPowerHp,
        acceleration: data.acceleration,
        topSpeed: data.topSpeed,
        consumption: data.consumption,
        driveType: data.driveType,
        dcChargeKw: data.dcChargeKw,
        chargeMin: data.chargeMin,
        acChargeKw: data.acChargeKw,
        acChargeHour: data.acChargeHour,
        torqueNm: data.torqueNm,
        motorCount: data.motorCount,
        motorType: data.motorType,
        lengthMm: data.lengthMm,
        widthMm: data.widthMm,
        heightMm: data.heightMm,
        weightKg: data.weightKg,
        trunkLiter: data.trunkLiter,
        originCountry: data.originCountry,
        heatPump: data.heatPump,
        v2l: data.v2l,
        image: coverImage,
        images: data.images,
        extraSpecs: data.extraSpecs,
        externalId: `dolubatarya-${data.slug}`,
        priceSource: data.rawPrice || "DoluBatarya",
        priceUpdatedAt: new Date(),
      };

      let savedVehicleId: string;

      if (existing) {
        const updated = await prisma.vehicle.update({
          where: { id: existing.id },
          data: vehicleData,
        });
        savedVehicleId = updated.id;
        updateCount++;
        console.log(`  ✓ Güncellendi: ${data.brand} ${data.model}`);
      } else {
        const created = await prisma.vehicle.create({
          data: vehicleData,
        });
        savedVehicleId = created.id;
        successCount++;
        console.log(`  ✓ Eklendi: ${data.brand} ${data.model}`);
      }

      // Sync images into VehicleImage
      if (data.images.length > 0) {
        // Mevcut syncImages'ı silip yeniden güncel ekle
        await prisma.vehicleImage.deleteMany({
          where: { vehicleId: savedVehicleId },
        });

        for (let imgIdx = 0; imgIdx < data.images.length; imgIdx++) {
          const imgUrl = data.images[imgIdx];
          await prisma.vehicleImage.create({
            data: {
              vehicleId: savedVehicleId,
              url: imgUrl,
              cloudinaryPublicId: `dolubatarya-${data.slug}-${imgIdx}`,
              type: imgIdx === 0 ? "exterior" : "gallery",
              source: "dolubatarya",
              sourceUrl: imgUrl,
              externalId: `dolubatarya-${data.slug}-img-${imgIdx}`,
              isPrimary: imgIdx === 0,
            },
          });
        }
      }
    } catch (dbErr) {
      console.error(`  ✕ DB Hatası (${data.slug}):`, dbErr instanceof Error ? dbErr.message : dbErr);
      failCount++;
    }

    // Kibar gecikme (DoluBatarya sunucusunu boğmamak için)
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log("\n=== İÇE AKTARIM TAMAMLANDI ===");
  console.log(`Yeni Eklenen: ${successCount}`);
  console.log(`Güncellenen: ${updateCount}`);
  console.log(`Başarısız: ${failCount}`);
}

main()
  .catch((e) => console.error("Kritik Hata:", e))
  .finally(() => prisma.$disconnect());
