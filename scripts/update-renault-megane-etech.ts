import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Renault Megane E-Tech with official Renault data...");

  const vehicleId = "6aad1a1135ead5fd4795e9c1";

  const images = [
    {
      url: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/new-editorial/megane-bcb-overview-001-desktop.jpg.ximg.large.webp/faac0803d5.webp",
      alt: "Renault Megane E-Tech Elektrikli Ön ve Yan Dış Tasarım",
      cloudinaryPublicId: "renault_megane_exterior_hero",
      type: "exterior",
      isPrimary: true,
      source: "renault.com.tr",
      sourceUrl: "https://www.renault.com.tr/elektrikli-araclar/megane-e-tech-elektrikli.html",
      externalId: "renault-megane-img-1",
    },
    {
      url: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/megane-bcb-my24-overview-002-desktop.jpg.ximg.large.webp/4208fc1548.webp",
      alt: "Renault Megane E-Tech Sürüş Dinamiği ve Yan Profil",
      cloudinaryPublicId: "renault_megane_exterior_drive",
      type: "exterior",
      isPrimary: false,
      source: "renault.com.tr",
      sourceUrl: "https://www.renault.com.tr/elektrikli-araclar/megane-e-tech-elektrikli.html",
      externalId: "renault-megane-img-2",
    },
    {
      url: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/megane-bcb-my24-overview-003-desktop.jpg.ximg.largex2.webp/552d5de20e.webp",
      alt: "Renault Megane E-Tech OpenR Link 12 inç Dijital Kokpit ve İç Mekan",
      cloudinaryPublicId: "renault_megane_interior_openr",
      type: "interior",
      isPrimary: false,
      source: "renault.com.tr",
      sourceUrl: "https://www.renault.com.tr/elektrikli-araclar/megane-e-tech-elektrikli.html",
      externalId: "renault-megane-img-3",
    },
    {
      url: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/megane-bcb-my24-overview-004-desktop.jpg.ximg.largex2.webp/a0bf2358bc.webp",
      alt: "Renault Megane E-Tech Arka Tasarım ve Dinamik LED Işık İmzası",
      cloudinaryPublicId: "renault_megane_rear_design",
      type: "exterior",
      isPrimary: false,
      source: "renault.com.tr",
      sourceUrl: "https://www.renault.com.tr/elektrikli-araclar/megane-e-tech-elektrikli.html",
      externalId: "renault-megane-img-4",
    },
    {
      url: "https://cdn.group.renault.com/ren/master/renault-new-cars/product-plans/megane-e-tech-electrique/megane-bcb-my24/megane-bcb-my24-overview-005-desktop.jpg.ximg.largex2.webp/317230b7fb.webp",
      alt: "Renault Megane E-Tech 130 kW DC Hızlı Şarj ve 22 kW AC Şarj Girişi",
      cloudinaryPublicId: "renault_megane_charging_port",
      type: "gallery",
      isPrimary: false,
      source: "renault.com.tr",
      sourceUrl: "https://www.renault.com.tr/elektrikli-araclar/megane-e-tech-elektrikli.html",
      externalId: "renault-megane-img-5",
    },
  ];

  const extraSpecs = {
    "Güç ve Hız": {
      "Motor Gücü": "220 HP (160 kW)",
      "Maksimum Tork": "300 Nm",
      "Azami Hız": "160 km/s",
      "0-100 km/s Hızlanma": "7,4 saniye",
      "Motor Mimarisi": "Elektrikli Sabit Mıknatıslı Senkron Motor",
      "Çekiş Tipi": "Önden Çekiş (FWD)",
      "Sürüş Modları": "Multi-Sense (Eco, Comfort, Sport, Perso)",
    },
    "Batarya ve Şarj": {
      "Batarya Kapasitesi": "60 kWh (Ultra İnce Batarya Mimarisi)",
      "Kullanılabilir Net Batarya": "60 kWh",
      "Menzil (WLTP Karma)": "468 km",
      "Menzil (Şehir İçi)": "545 km",
      "DC Hızlı Şarj Gücü": "130 kW",
      "DC Şarj Süresi (%15 - %80)": "30 dakika (300 km menzil kazanımı)",
      "AC Şarj Gücü": "22 kW (Sınıfında Standart Çift Yönlü Şarj)",
      "AC Şarj Süresi (22 kW)": "2 saat 15 dakika (%0 - %100)",
      "AC Şarj Süresi (7.4 kW Wallbox)": "9 saat 15 dakika (%0 - %100)",
      "Ortalama Enerji Tüketimi": "15,8 kWh / 100 km",
      "Rejeneratif Frenleme": "4 Kademeli Direksiyon Arkası Kulakçıklar (Paddle Shift)",
    },
    "Gelişmiş Sürüş Destek Sistemleri (26 ADAS)": {
      "Aktif Sürüş Yardımcısı": "Seviye 2 Otonom Sürüş (Şerit Ortalama & Akıllı Stop&Go ACC)",
      "Kör Nokta Müdahale Sistemi": "Manevra Müdahaleli Aktif Kör Nokta Önleme",
      "Güvenli Çıkış Asistanı": "Yolcu & Bisikletli Yaklaşımında Kapı Açma Uyarısı",
      "Otomatik Acil Fren Desteği": "Kavşak, Yaya ve Bisiklet Algılamalı Acil Frenleme",
      "Park ve Görüş Desteği": "360° Kuşbakışı 3D Kamera ve Eller Serbest Otomatik Park",
      "Trafik İşareti Tanıma": "Hız Sınırı Uyarısı ve Otomatik Hız Uyarlama",
    },
    "Multimedya ve Akıllı Yaşam": {
      "OpenR Link Ekranı": "12 inç Dikey Yüksek Çözünürlüklü Dokunmatik Ekran",
      "Sürücü Göstergesi": "12,3 inç Özelleştirilebilir TFT Dijital Gösterge Paneli",
      "Dahili Google Hizmetleri": "Google Haritalar (Elektrikli Araç Rota & Şarj Planlama), Google Asistan, Google Play",
      "Akıllı Telefon Bağlantısı": "Kablosuz Apple CarPlay ve Kablosuz Android Auto",
      "Ses Sistemi": "Harman Kardon 410W Premium Ses Sistemi (9 Hoparlör)",
      "My Renault Uygulaması": "Uzaktan İklimlendirme (Ön Isıtma/Soğutma), Şarj Durumu ve Kilitleme Kontrolü",
    },
    "Ölçüler ve Konfor Donanımı": {
      "Uzunluk x Genişlik x Yükseklik": "4.200 x 1.768 x 1.505 mm",
      "Aks Mesafesi": "2.685 mm",
      "Boş Ağırlık": "1.640 kg",
      "Bagaj Kapasitesi (VDA)": "440 Litre (Koltuklar Katlandığında 1.332 Litre)",
      "Kabin Saklama Gözleri": "32 Litre Fonksiyonel İç Saklama Hacmi",
      "Isı Pompası": "Standart Akıllı Isı Pompası (Menzil Koruyucu Termal Yönetim)",
      "Aydınlatma Grubu": "Full LED Adaptive Vision ve Karşılama Işık Animasyonları",
    },
  };

  const updatedVehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      brand: "Renault",
      model: "Megane E-Tech",
      slug: "renault-megane-e-tech",
      year: 2026,
      segment: "C-Hatchback",
      bodyType: "Hatchback",
      marketStatus: "TR_YAYINDA",
      price: 2386000,
      otvRate: 10,
      rangeKm: 468,
      rangeSummerKm: 490,
      rangeWinterKm: 365,
      rangeSource: "Renault Resmi WLTP (Karma 468 km / Şehir İçi 545 km)",
      batteryKwh: 60.0,
      batteryUsableKwh: 60.0,
      motorPowerKw: 160,
      motorPowerHp: 220,
      torqueNm: 300,
      acceleration: 7.4,
      topSpeed: 160,
      consumption: 15.8,
      driveType: "FWD",
      motorCount: "Tek Motor",
      motorType: "Sabit Mıknatıslı Senkron Motor",
      isFeatured: true,
      dcChargeKw: 130,
      chargeMin: 30,
      acChargeKw: 22.0,
      acChargeHour: 2.25,
      trunkLiter: 440,
      lengthMm: 4200,
      widthMm: 1768,
      heightMm: 1505,
      weightKg: 1640,
      originCountry: "Fransa",
      heatPump: "Var (Standart Akıllı Isı Pompası)",
      v2l: "Var",
      warranty: "8 yıl / 160.000 km (%70 kapasite garantisi)",
      description:
        "Renault Megane E-Tech Elektrikli, dinamik crossover silueti, 220 HP güç ve 300 Nm tork üreten elektrikli motoru, 468 km WLTP menzili, 22 kW standart AC şarjı ve Google dahili servislerine sahip 12 inç OpenR Link multimedya sistemiyle sınıfının en iddialı elektrikli modellerindendir.",
      pros: [
        "468 km WLTP menzil ve güçlü 220 HP / 300 Nm performans",
        "Sınıfında benzersiz 22 kW AC çift yönlü şarj (2 saat 15 dk tam şarj)",
        "Google dahili servisleri (Haritalar & Asistan) ile OpenR Link 12 inç ekran",
        "Standart akıllı ısı pompası ve kış koşullarında batarya optimizasyonu",
        "26 gelişmiş sürüş destek sistemi ve Seviye 2 otonom sürüş",
      ],
      cons: [
        "Kompakt arka cam nedeniyle kısıtlı geri görüş (dijital dikiz aynası önerilir)",
        "Yüksek yükleme eşiğine sahip bagaj girişi",
      ],
      image: images[0].url,
      images: images.map((i) => i.url),
      externalId: "renault:megane-e-tech-elektrikli",
      priceSource: "https://www.renault.com.tr/elektrikli-araclar/megane-e-tech-elektrikli.html",
      priceUpdatedAt: new Date(),
      extraSpecs: extraSpecs,
    },
  });

  console.log(`Updated vehicle: ${updatedVehicle.brand} ${updatedVehicle.model} (${updatedVehicle.slug})`);

  // Delete previous VehicleImage records for this vehicle
  await prisma.vehicleImage.deleteMany({
    where: { vehicleId },
  });

  // Insert 5 high-res verified official images
  for (const img of images) {
    await prisma.vehicleImage.create({
      data: {
        vehicleId,
        url: img.url,
        cloudinaryPublicId: img.cloudinaryPublicId,
        type: img.type,
        alt: img.alt,
        source: img.source,
        sourceUrl: img.sourceUrl,
        externalId: img.externalId,
        isPrimary: img.isPrimary,
      },
    });
  }

  console.log("Successfully inserted 5 official Renault Megane E-Tech images.");
}

main()
  .catch((err) => {
    console.error("Error updating Renault Megane E-Tech:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
