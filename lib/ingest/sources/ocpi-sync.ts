import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/api";

interface CpoConfig {
  key: string;
  name: string;
  countryCode: string;
  partyId: string;
  endpoint: string;
  token: string;
}

// Türkiye'deki entegrasyonu yapılacak CPO'lar için örnek adaptör tanımları
const REGISTERED_CPOS: CpoConfig[] = [
  {
    key: "zes",
    name: "ZES (Zorlu Energy Solutions)",
    countryCode: "TR",
    partyId: "ZES",
    endpoint: "https://api.zes.net/ocpi/2.2.1/locations",
    token: "default_zes_test_token_12345",
  },
  {
    key: "esarj",
    name: "Eşarj",
    countryCode: "TR",
    partyId: "ESA",
    endpoint: "https://api.esarj.com/ocpi/2.2.1/locations",
    token: "default_esarj_test_token_67890",
  },
  {
    key: "trugo",
    name: "Trugo",
    countryCode: "TR",
    partyId: "TRU",
    endpoint: "https://api.trugo.com.tr/ocpi/2.2.1/locations",
    token: "default_trugo_test_token_abcde",
  }
];

/**
 * Belirli bir CPO'dan OCPI Locations verilerini çeker (pull) ve veritabanını günceller.
 */
export async function syncCpoLocations(cpoKey: string) {
  const cpo = REGISTERED_CPOS.find((c) => c.key === cpoKey);
  if (!cpo) throw new Error(`CPO bulunamadı: ${cpoKey}`);

  // Canlı entegrasyonda burada CPO'nun OCPI endpoint'ine istek atılacak:
  // const res = await fetch(cpo.endpoint, { headers: { Authorization: `Token ${cpo.token}` } });
  // const locations = await res.json();
  
  // Şimdilik test ve demonstrasyon amaçlı örnek OCPI mock verisi üretiyoruz:
  const mockLocations = generateMockOcpiLocations(cpo);

  let updatedCount = 0;

  for (const loc of mockLocations) {
    // OcpiLocation kaydet
    const ocpiLocation = await prisma.ocpiLocation.upsert({
      where: {
        countryCode_partyId_locationId: {
          countryCode: loc.country_code,
          partyId: loc.party_id,
          locationId: loc.id,
        },
      },
      update: {
        name: loc.name,
        address: loc.address,
        city: loc.city,
        postalCode: loc.postal_code,
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
      create: {
        countryCode: loc.country_code,
        partyId: loc.party_id,
        locationId: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        postalCode: loc.postal_code,
        latitude: loc.latitude,
        longitude: loc.longitude,
      },
    });

    let totalSockets = 0;
    const socketTypesSet = new Set<string>();
    let maxPower = 0;

    // EVSE'leri kaydet
    for (const evse of loc.evses) {
      const ocpiEvse = await prisma.ocpiEvse.upsert({
        where: { uid: evse.uid },
        update: {
          status: evse.status,
          evseId: evse.evse_id,
        },
        create: {
          uid: evse.uid,
          evseId: evse.evse_id,
          status: evse.status,
          locationId: ocpiLocation.id,
        },
      });

      // Konnektörleri sil/yeniden ekle
      await prisma.ocpiConnector.deleteMany({ where: { evseId: ocpiEvse.id } });

      for (const conn of evse.connectors) {
        await prisma.ocpiConnector.create({
          data: {
            connectorId: conn.id,
            standard: conn.standard,
            format: conn.format,
            powerType: conn.power_type,
            voltage: conn.voltage,
            amperage: conn.amperage,
            maxPowerKw: conn.max_power,
            evseId: ocpiEvse.id,
          },
        });

        totalSockets++;
        socketTypesSet.add(conn.standard);
        maxPower = Math.max(maxPower, conn.max_power);
      }
    }

    // Geriye dönük harita uyumluluğu için ChargeStation tablosunu güncelle
    await prisma.chargeStation.upsert({
      where: { slug: slugify(`${cpo.partyId}-${loc.name}-${loc.id}`) },
      update: {
        name: loc.name,
        operator: cpo.name,
        city: loc.city,
        district: loc.city,
        address: loc.address,
        lat: loc.latitude,
        lng: loc.longitude,
        socketCount: totalSockets || 2,
        socketTypes: Array.from(socketTypesSet),
        isFast: maxPower >= 50,
        maxPowerKw: maxPower,
        source: "ocpi",
        externalId: loc.id,
        fetchedAt: new Date(),
      },
      create: {
        name: loc.name,
        slug: slugify(`${cpo.partyId}-${loc.name}-${loc.id}`),
        operator: cpo.name,
        city: loc.city,
        district: loc.city,
        address: loc.address,
        lat: loc.latitude,
        lng: loc.longitude,
        socketCount: totalSockets || 2,
        socketTypes: Array.from(socketTypesSet),
        isFast: maxPower >= 50,
        maxPowerKw: maxPower,
        source: "ocpi",
        externalId: loc.id,
        fetchedAt: new Date(),
      },
    });

    updatedCount++;
  }

  return { cpo: cpo.name, updatedLocations: updatedCount };
}

/** All registered CPOs sync wrapper */
export async function syncAllCpos() {
  const results = [];
  for (const cpo of REGISTERED_CPOS) {
    try {
      const res = await syncCpoLocations(cpo.key);
      results.push(res);
    } catch (e) {
      results.push({ cpo: cpo.name, error: e instanceof Error ? e.message : "Sync failed" });
    }
  }
  return results;
}

// MOCK DATA GENERATOR FOR TURKISH CPO LOCATIONS
function generateMockOcpiLocations(cpo: CpoConfig) {
  // Türkiye genelindeki gerçek otoyol ve şehir merkezi koordinatları
  const citiesData = [
    { city: "Istanbul", lat: 41.1122, lng: 29.0224, name: "Maslak Plazalar DC" },
    { city: "Istanbul", lat: 40.9902, lng: 29.0204, name: "Kadıköy Tepe Nautilus AVM" },
    { city: "Istanbul", lat: 41.0742, lng: 28.2467, name: "Silivri Otoyol Dinlenme Tesisi" },
    { city: "Bolu", lat: 40.7325, lng: 31.5204, name: "Bolu Dağı Highway Outlet DC" },
    { city: "Ankara", lat: 39.9074, lng: 32.8057, name: "Çankaya Kentpark AVM" },
    { city: "Ankara", lat: 39.9208, lng: 32.8541, name: "Kızılay Otopark Şarj" },
    { city: "Kocaeli", lat: 40.7652, lng: 29.9407, name: "İzmit Tem Otoyolu Şarj Noktası" },
    { city: "Bursa", lat: 40.2312, lng: 29.0124, name: "Nilüfer Carrefour AVM DC" },
    { city: "Bursa", lat: 40.1824, lng: 29.0664, name: "Osmangazi Köprüsü Çıkışı ZES" },
    { city: "Balıkesir", lat: 39.6484, lng: 27.8826, name: "Susurluk Otoyol Dinlenme Tesisi" },
    { city: "Izmir", lat: 38.4192, lng: 27.1287, name: "Konak İskele Şarj İstasyonu" },
    { city: "Izmir", lat: 38.4594, lng: 27.2091, name: "Bornova Forum AVM Trugo" },
    { city: "Eskişehir", lat: 39.7824, lng: 30.5126, name: "Odunpazarı Espark AVM" },
    { city: "Afyon", lat: 38.7564, lng: 30.5381, name: "Afyon Kolaylı Dinlenme Tesisi DC" },
    { city: "Antalya", lat: 36.8524, lng: 30.7567, name: "Lara TerraCity AVM" },
    { city: "Muğla", lat: 37.0341, lng: 27.4305, name: "Bodrum Marina Şarj İstasyonu" }
  ];

  return citiesData.map((d, index) => {
    const locId = `LOC-${cpo.partyId}-${index + 1}`;
    const maxPower = cpo.key === "trugo" ? 180 : 120; // Trugo 180 kW, ZES/Eşarj 120 kW
    
    return {
      id: locId,
      country_code: cpo.countryCode,
      party_id: cpo.partyId,
      name: `${cpo.name} - ${d.name}`,
      address: `${d.city} Otoyol/Şehir Şarj Alanı No: ${index + 1}`,
      city: d.city,
      postal_code: "34000",
      latitude: d.lat + (Math.random() - 0.5) * 0.005, // Daha yakın tutalım sapmayı
      longitude: d.lng + (Math.random() - 0.5) * 0.005,
      evses: [
        {
          uid: `${cpo.countryCode}*${cpo.partyId}*E${index}1`,
          evse_id: `EVSE-${cpo.partyId}-${index}-1`,
          status: Math.random() > 0.3 ? "AVAILABLE" : "CHARGING",
          connectors: [
            {
              id: "1",
              standard: "IEC_62196_T2_COMBO", // CCS2
              format: "CABLE",
              power_type: "DC",
              voltage: 400,
              amperage: 250,
              max_power: maxPower,
            }
          ]
        },
        {
          uid: `${cpo.countryCode}*${cpo.partyId}*E${index}2`,
          evse_id: `EVSE-${cpo.partyId}-${index}-2`,
          status: "AVAILABLE",
          connectors: [
            {
              id: "1",
              standard: "IEC_62196_T2", // Type 2
              format: "SOCKET",
              power_type: "AC_3_PHASE",
              voltage: 400,
              amperage: 32,
              max_power: 22,
            }
          ]
        }
      ]
    };
  });
}
