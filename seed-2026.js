const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting 2026 data update...");

  // 1. Clean existing tables to avoid duplicates/stale data
  await prisma.article.deleteMany({});
  await prisma.author.deleteMany({});
  await prisma.vehicle.deleteMany({});
  console.log("Cleared old articles, authors, and vehicles.");

  // 2. Create Categories if missing (or query existing ones)
  const categories = await prisma.category.findMany();
  const getCatId = (slug) => {
    const c = categories.find((x) => x.slug === slug);
    return c ? c.id : categories[0]?.id;
  };

  const catHaberId = getCatId("haber-merkezi");
  const catTeknolojiId = getCatId("teknoloji");
  const catOtvId = getCatId("otv-rehberi");

  // 3. Create Authors
  const editor = await prisma.author.create({
    data: {
      name: "Mert Sencan",
      slug: "mert-sencan",
      title: "Mert Sencan • Baş Editör",
      bio: "Elektrikli araç teknolojileri ve mobilite analisti.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
  });

  const author = await prisma.author.create({
    data: {
      name: "Alperen Özdemir",
      slug: "alperen-ozdemir",
      title: "Alperen Özdemir • Araştırmacı Yazar",
      bio: "Yeni nesil batarya kimyaları ve şarj altyapısı uzmanı.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
  });
  console.log("Created authors.");

  // 4. Create 2026 News Articles (All with high-quality Unsplash EV images!)
  const articlesData = [
    {
      title: "Togg T10F Fastback 2026 Model Yılıyla Türkiye Yollarına Çıkıyor",
      slug: "togg-t10f-fastback-2026-turkiye-yollarinda-829d10",
      spot: "Togg'un merakla beklenen yeni sedan modeli T10F, 600 km'ye varan menzili ve gelişmiş otonom sürüş asistanlarıyla 2026 ilk çeyreğinde satışa çıkıyor.",
      content: "<p>Yerli otomobil üreticisi Togg'un C segmenti yeni sedan/fastback modeli T10F, 2026 model yılı güncellemeleriyle resmen tanıtıldı. 88.5 kWh kapasiteli batarya paketi sayesinde WLTP normlarına göre 600 km menzil sunan araç, 160 kW motor gücü ve arkadan itişli versiyonuyla yollarda olacak.</p><p>Ayrıca çift motorlu AWD seçeneği de 2026'nın ikinci yarısında ürün gamına eklenecek.</p>",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60",
      categoryId: catHaberId,
      authorId: editor.id,
      isFeatured: true,
      publishedAt: new Date("2026-08-25T10:00:00Z"),
      status: "PUBLISHED",
    },
    {
      title: "Tesla Model Y 2026 'Juniper' Makyajı Sonrası Türkiye'de Satışta",
      slug: "tesla-model-y-2026-juniper-turkiyede-931a29",
      spot: "Tesla'nın popüler SUV modeli Model Y, kapsamlı dış ve iç tasarım yenilikleri içeren Juniper makyajlı versiyonuyla teslimatlara başladı.",
      content: "<p>Tesla'nın en çok satan elektrikli SUV modeli Model Y, uzun süredir beklenen 'Juniper' kod adlı makyajlı kasa güncellemelerini aldı. 2026 model yılı kapsamında yenilenen ön LED farlar, ambiyans aydınlatmalı iç kabin ve daha sessiz sürüş sağlayan akustik camlar dikkat çekiyor. Aracın WLTP menzili aerodinamik iyileştirmeler sayesinde 565 km seviyesine yükseltildi.</p>",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=60",
      categoryId: catHaberId,
      authorId: editor.id,
      isFeatured: false,
      publishedAt: new Date("2026-08-24T12:00:00Z"),
      status: "PUBLISHED",
    },
    {
      title: "Renault 5 E-Tech 2026: Retro Tasarım ve LFP Batarya ile Şehir İçi Lideri",
      slug: "renault-5-e-tech-2026-retro-lfp-sehir-ici-839210",
      spot: "Renault'nun efsanevi modeli retro-fütüristik tasarımı ve uygun fiyatıyla 2026 yılı şehir içi elektrikli araç pazarını domine etmeye geliyor.",
      content: "<p>Renault 5 E-Tech, 2026 model yılıyla birlikte LFP (Lityum Demir Fosfat) batarya teknolojisine geçerek hem maliyetleri düşürdü hem de şarj ömrünü uzattı. 52 kWh bataryasıyla 400 km menzil sunan kompakt model, retro esintili tasarımı ve Google destekli OpenR Link multimedya sistemiyle genç kullanıcıların gözdesi haline geldi.</p>",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60",
      categoryId: catTeknolojiId,
      authorId: author.id,
      isFeatured: false,
      publishedAt: new Date("2026-08-23T14:30:00Z"),
      status: "PUBLISHED",
    },
    {
      title: "BYD Türkiye Yatırımı Sonrası Seal ve Atto 3 2026 Modellerini Duyurdu",
      slug: "byd-turkiye-yatirimi-seal-atto3-2026-839120",
      spot: "BYD'nin Türkiye fabrikası temellerinin atılmasının ardından, marka 2026 yılı modellerinde yerel pazar için özel donanım ve yazılım güncellemeleri sundu.",
      content: "<p>Dünyanın en büyük elektrikli araç üreticisi BYD, Türkiye'deki üretim hamlesinin bir parçası olarak 2026 model Seal ve Atto 3 modellerinde Türkçe sesli asistan ve yerel navigasyon entegrasyonu sunacağını duyurdu. Blade Batarya teknolojisine sahip Seal, 230 kW motor gücü ve 570 km menziliyle premium sınıfta rekabet ediyor.</p>",
      image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=60",
      categoryId: catTeknolojiId,
      authorId: author.id,
      isFeatured: false,
      publishedAt: new Date("2026-08-22T16:00:00Z"),
      status: "PUBLISHED",
    },
    {
      title: "2026 Elektrikli Araç ÖTV Matrah Güncellemesi Fiyatları Nasıl Etkileyecek?",
      slug: "2026-elektrikli-arac-otv-matrah-guncellemesi-fiyat-etkisi-839d91",
      spot: "Maliye Bakanlığı'nın 2026 yılı için güncellediği ÖTV matrah limitleri, 160 kW altı elektrikli otomobillerde önemli fiyat avantajları sunuyor.",
      content: "<p>2026 yılı itibarıyla yürürlüğe giren yeni ÖTV tebliğine göre, motor gücü 160 kW'ı geçmeyen elektrikli araçlarda 10% ÖTV oranı için uygulanan matrah limiti 1.450.000 TL'ye sabitlendi. Bu durum, Togg T10X ve Renault 5 E-Tech gibi modellerin en üst donanım paketlerinde de 10%'luk düşük ÖTV diliminde kalmasını sağlayarak tüketicilerin yüzünü güldürdü.</p>",
      image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60",
      categoryId: catOtvId,
      authorId: editor.id,
      isFeatured: false,
      publishedAt: new Date("2026-08-21T09:00:00Z"),
      status: "PUBLISHED",
    },
    {
      title: "Katı Hal Bataryalı İlk Elektrikli Araçlar 2026 Sonunda Yollarda Olacak",
      slug: "kati-hal-bataryali-ilk-elektrikli-araclar-2026-sonu-yollarda-829f01",
      spot: "Sıvı elektrolit yerine katı hal kimyası kullanan yeni bataryalar, elektrikli araçların menzilini ikiye katlarken şarj süresini 10 dakikanın altına indiriyor.",
      content: "<p>Batarya teknolojilerinde devrim niteliğindeki katı hal (solid-state) batarya paketleri, 2026 yılı son çeyreği itibarıyla seri üretim otomobillerde kullanılmaya başlanıyor. Lityum-iyon bataryalara göre %50 daha yüksek enerji yoğunluğu sunan bu sistemler, hem patlama riskini sıfıra indiriyor hem de 1000 km üzeri menzilleri standart hale getiriyor.</p>",
      image: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800&auto=format&fit=crop&q=60",
      categoryId: catTeknolojiId,
      authorId: author.id,
      isFeatured: false,
      publishedAt: new Date("2026-08-20T11:00:00Z"),
      status: "PUBLISHED",
    },
  ];

  for (const art of articlesData) {
    await prisma.article.create({ data: art });
  }
  console.log("Created 2026 news articles.");

  // 5. Create 2026 Vehicle Models (All with images arrays and updated 2026 specs!)
  const vehiclesData = [
    {
      brand: "Togg",
      model: "T10X V2 Uzun Menzil",
      slug: "togg-t10x-v2-uzun-menzil-2026",
      price: 1890000,
      rangeKm: 523,
      batteryKwh: 88.5,
      motorPowerKw: 160,
      consumption: 16.9,
      dcChargeKw: 180,
      segment: "C-SUV",
      bodyType: "SUV",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 10,
    },
    {
      brand: "Tesla",
      model: "Model Y Long Range",
      slug: "tesla-model-y-long-range-2026",
      price: 2750000,
      rangeKm: 565,
      batteryKwh: 78.1,
      motorPowerKw: 378,
      consumption: 15.2,
      dcChargeKw: 250,
      segment: "D-SUV",
      bodyType: "SUV",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 60,
    },
    {
      brand: "Renault",
      model: "5 E-Tech",
      slug: "renault-5-e-tech-2026",
      price: 1350000,
      rangeKm: 400,
      batteryKwh: 52,
      motorPowerKw: 110,
      consumption: 14.5,
      dcChargeKw: 100,
      segment: "B-Hatchback",
      bodyType: "Hatchback",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 10,
    },
    {
      brand: "BYD",
      model: "Seal Excellence AWD",
      slug: "byd-seal-excellence-2026",
      price: 2350000,
      rangeKm: 570,
      batteryKwh: 82.5,
      motorPowerKw: 230,
      consumption: 15.0,
      dcChargeKw: 150,
      segment: "D-Sedan",
      bodyType: "Sedan",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 50,
    },
    {
      brand: "Porsche",
      model: "Taycan 4S",
      slug: "porsche-taycan-4s-2026",
      price: 6200000,
      rangeKm: 642,
      batteryKwh: 93.4,
      motorPowerKw: 400,
      consumption: 16.7,
      dcChargeKw: 320,
      segment: "E-Sport",
      bodyType: "Sedan",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1614200187524-dc5b8ec2229a?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1614200187524-dc5b8ec2229a?w=800&auto=format&fit=crop&q=60",
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 60,
    },
    {
      brand: "Togg",
      model: "T10F Fastback",
      slug: "togg-t10f-fastback-2026",
      price: 2100000,
      rangeKm: 600,
      batteryKwh: 88.5,
      motorPowerKw: 160,
      consumption: 16.0,
      dcChargeKw: 180,
      segment: "C-Sedan",
      bodyType: "Sedan",
      marketStatus: "TR_YAKINDA",
      image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 10,
    },
    {
      brand: "Kia",
      model: "EV3 Long Range",
      slug: "kia-ev3-long-range-2026",
      price: 1780000,
      rangeKm: 605,
      batteryKwh: 81.4,
      motorPowerKw: 150,
      consumption: 14.9,
      dcChargeKw: 128,
      segment: "C-SUV",
      bodyType: "SUV",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 10,
    },
    {
      brand: "Hyundai",
      model: "Inster Ev",
      slug: "hyundai-inster-ev-2026",
      price: 1190000,
      rangeKm: 355,
      batteryKwh: 49.0,
      motorPowerKw: 84,
      consumption: 15.3,
      dcChargeKw: 85,
      segment: "A-SUV",
      bodyType: "SUV",
      marketStatus: "TR_YAYINDA",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 10,
    },
    {
      brand: "Xiaomi",
      model: "SU7",
      slug: "xiaomi-su7-2026",
      price: 2900000,
      rangeKm: 800,
      batteryKwh: 73.6,
      motorPowerKw: 220,
      consumption: 13.8,
      dcChargeKw: 220,
      segment: "C-Sport",
      bodyType: "Sedan",
      marketStatus: "TR_YOK",
      image: "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800&auto=format&fit=crop&q=60",
      images: [
        "https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=800&auto=format&fit=crop&q=60"
      ],
      otvRate: 60,
    },
  ];

  for (const veh of vehiclesData) {
    await prisma.vehicle.create({
      data: {
        ...veh,
        year: 2026,
        motorPowerHp: Math.round(veh.motorPowerKw * 1.36),
        acceleration: veh.brand === "Porsche" ? 3.7 : veh.brand === "Tesla" ? 5.0 : 7.2,
        topSpeed: veh.brand === "Porsche" ? 250 : veh.brand === "Tesla" ? 217 : 185,
        driveType: veh.brand === "Porsche" || veh.brand === "Tesla" ? "AWD" : "RWD",
        isFeatured: veh.brand === "Togg" && veh.marketStatus === "TR_YAYINDA",
        description: `${veh.brand} ${veh.model} 2026 model yılı güncel teknik verileri ve donanım özellikleri.`,
      },
    });
  }
  console.log("Created 2026 vehicle models.");

  console.log("2026 seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
