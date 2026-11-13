import { fetchJson } from "../http";
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

const REGISTERED_CPOS: CpoConfig[] = [
  { key: "zes", name: "ZES", countryCode: "TR", partyId: "ZES", endpoint: process.env.OCPI_ZES_URL || "", token: process.env.OCPI_ZES_TOKEN || "" },
  { key: "esarj", name: "Eşarj", countryCode: "TR", partyId: "ESA", endpoint: process.env.OCPI_ESARJ_URL || "", token: process.env.OCPI_ESARJ_TOKEN || "" },
  { key: "trugo", name: "Trugo", countryCode: "TR", partyId: "TRU", endpoint: process.env.OCPI_TRUGO_URL || "", token: process.env.OCPI_TRUGO_TOKEN || "" },
];
type PullLocation = {
  id: string; country_code: string; party_id: string; name: string; address: string;
  city: string; postal_code?: string; latitude: number; longitude: number;
  evses: { uid: string; status: string; evse_id?: string; connectors: {
    id: string; standard: string; format: string; power_type: string;
    voltage: number; amperage: number; max_electric_power?: number;
  }[] }[];
};

/**
 * Belirli bir CPO'dan OCPI Locations verilerini çeker (pull) ve veritabanını günceller.
 */
export async function syncCpoLocations(cpoKey: string) {
  const cpo = REGISTERED_CPOS.find((c) => c.key === cpoKey);
  if (!cpo) throw new Error(`CPO bulunamadı: ${cpoKey}`);

  if (!cpo.endpoint || !cpo.token) throw new Error("OCPI bağlantısı yapılandırılmadı");
  if (new URL(cpo.endpoint).protocol !== "https:") throw new Error("OCPI için HTTPS gerekli");
  const response = await fetchJson<{ status_code: number; data: PullLocation[] }>(cpo.endpoint, {
    headers: { authorization: `Token ${cpo.token}` }, timeoutMs: 20_000, retries: 1,
  });
  if (response.status_code !== 1000 || !Array.isArray(response.data) || response.data.length > 1000) throw new Error("Geçersiz OCPI yanıtı");
  const locations = response.data;
  // Validate the entire batch before any write. Never generate demo stations.
  for (const loc of locations) {
    if (loc.country_code !== cpo.countryCode || loc.party_id !== cpo.partyId || !loc.id || !loc.name || !loc.address ||
      !Number.isFinite(Number(loc.latitude)) || Math.abs(Number(loc.latitude)) > 90 ||
      !Number.isFinite(Number(loc.longitude)) || Math.abs(Number(loc.longitude)) > 180 ||
      !Array.isArray(loc.evses) || loc.evses.length > 100 || loc.evses.some(evse => !Array.isArray(evse.connectors) || evse.connectors.length > 20)) throw new Error("OCPI konumu operatör veya veri kapsamı dışında");
  }

  let updatedCount = 0;

  for (const loc of locations) {
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
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
      },
      create: {
        countryCode: loc.country_code,
        partyId: loc.party_id,
        locationId: loc.id,
        name: loc.name,
        address: loc.address,
        city: loc.city,
        postalCode: loc.postal_code,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
      },
    });

    let totalSockets = 0;
    const socketTypesSet = new Set<string>();
    let maxPower = 0;

    // EVSE'leri kaydet
    for (const evse of loc.evses) {
      const ocpiEvse = await prisma.ocpiEvse.upsert({
        where: { uid: `${cpo.countryCode}:${cpo.partyId}:${loc.id}:${evse.uid}` },
        update: {
          status: evse.status,
          evseId: evse.evse_id,
        },
        create: {
          uid: `${cpo.countryCode}:${cpo.partyId}:${loc.id}:${evse.uid}`,
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
            maxPowerKw: Number(conn.max_electric_power || 0) / 1000,
            evseId: ocpiEvse.id,
          },
        });

        totalSockets++;
        socketTypesSet.add(conn.standard);
        maxPower = Math.max(maxPower, Number(conn.max_electric_power || 0) / 1000);
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
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
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
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
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
    if (!cpo.endpoint || !cpo.token) { results.push({ cpo: cpo.name, skipped: true, reason: "Bağlantı yapılandırılmadı" }); continue; }
    try {
      const res = await syncCpoLocations(cpo.key);
      results.push(res);
    } catch (e) {
      results.push({ cpo: cpo.name, error: e instanceof Error ? e.message : "Sync failed" });
    }
  }
  return results;
}
