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
  // Örnek koordinatlar (Istanbul, Ankara, Izmir)
  const citiesData = [
    { city: "Istanbul", lat: 41.0082, lng: 28.9784, name: "Kadıköy AVM Şarj Noktası" },
    { city: "Ankara", lat: 39.9334, lng: 32.8597, name: "Çankaya Kent Park DC" },
    { city: "Izmir", lat: 38.4192, lng: 27.1287, name: "Konak Meydanı AC-DC" }
  ];

  return citiesData.map((d, index) => {
    const locId = `LOC-${cpo.partyId}-${index + 1}`;
    const maxPower = cpo.key === "trugo" ? 180 : 120; // Trugo 180 kW, ZES/Eşarj 120 kW varsayalım
    
    return {
      id: locId,
      country_code: cpo.countryCode,
      party_id: cpo.partyId,
      name: `${cpo.name} - ${d.name}`,
      address: `${d.city} Merkez Şarj Alanı No: ${index + 10}`,
      city: d.city,
      postal_code: "34000",
      latitude: d.lat + (Math.random() - 0.5) * 0.05,
      longitude: d.lng + (Math.random() - 0.5) * 0.05,
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
