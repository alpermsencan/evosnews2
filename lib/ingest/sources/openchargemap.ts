import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/api";
import { fetchJson } from "../http";
import { emptyStats, type IngestContext, type IngestResult, type SourceJob } from "../types";
import { PROVINCE_BY_POSTCODE, findProvinceInText, normalizeProvince } from "../tr-provinces";

const OCM_ENDPOINT = "https://api.openchargemap.io/v3/poi";
const OCM_REFERENCE = "https://api.openchargemap.io/v3/referencedata";

/**
 * OCM yanıtından yalnızca kullandığımız alanlar.
 *
 * NOT: API, `OperatorInfo` / `ConnectionType` / `StatusType` nesnelerini bu
 * uçta null döndürüyor; yalnızca kimlikler geliyor. Bu yüzden başlıklar
 * /referencedata sözlüğünden çözülür.
 */
type OcmPoi = {
  ID: number;
  OperatorID?: number | null;
  StatusTypeID?: number | null;
  AddressInfo?: {
    Title?: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
    Postcode?: string;
    Latitude?: number;
    Longitude?: number;
  } | null;
  Connections?: {
    Quantity?: number | null;
    PowerKW?: number | null;
    ConnectionTypeID?: number | null;
  }[];
};

type OcmReference = {
  Operators?: { ID: number; Title?: string }[];
  ConnectionTypes?: { ID: number; Title?: string }[];
  StatusTypes?: { ID: number; Title?: string; IsOperational?: boolean | null }[];
};

const clean = (s?: string | null) => (s ?? "").replace(/\s+/g, " ").trim();

type Lookups = {
  operators: Map<number, string>;
  connections: Map<number, string>;
  operational: Map<number, boolean | null>;
};

/** Kimlik → başlık sözlüklerini bir kez indirir. */
async function loadLookups(key: string): Promise<Lookups> {
  const ref = await fetchJson<OcmReference>(
    `${OCM_REFERENCE}?key=${encodeURIComponent(key)}`,
    { timeoutMs: 25_000 },
  );

  const toMap = (rows: { ID: number; Title?: string }[] | undefined) =>
    new Map((rows ?? []).map((r) => [r.ID, clean(r.Title)] as const));

  return {
    operators: toMap(ref.Operators),
    connections: toMap(ref.ConnectionTypes),
    operational: new Map(
      (ref.StatusTypes ?? []).map((s) => [s.ID, s.IsOperational ?? null] as const),
    ),
  };
}

/** İl bilinmiyorken yazılan değer. */
const UNKNOWN_CITY = "Belirtilmemiş";

/**
 * İl adı çözümü — ücretsiz ve kesin olandan pahalıya doğru.
 *
 * 1. Posta kodu: ilk iki hane Türkiye'de plaka koduyla aynıdır, ili kesin verir.
 * 2. Adresteki açık il alanı (OCM'de kayıtların küçük bir kısmında dolu).
 * 3. İstasyon adı/adres metninde geçen il adı (ör. "ZES - Çanakkale Kepez").
 *
 * Hiçbiri tutmazsa ters geokodlama devreye girer (bkz. geocodeProvince);
 * o da başarısız olursa "Belirtilmemiş" yazılır — tahmin üretilmez.
 */
function resolveCityOffline(info: NonNullable<OcmPoi["AddressInfo"]>) {
  const byPostcode = PROVINCE_BY_POSTCODE[clean(info.Postcode).slice(0, 2)];
  if (byPostcode) return byPostcode;

  const stated = normalizeProvince(clean(info.StateOrProvince));
  if (stated) return stated;

  const town = normalizeProvince(clean(info.Town));
  if (town) return town;

  return findProvinceInText(`${clean(info.Title)} ${clean(info.AddressLine1)}`);
}

const ORS_REVERSE = "https://api.openrouteservice.org/geocode/reverse";

/** Ters geokodlama çağrıları arasındaki bekleme (ORS ücretsiz kotası ~100/dk). */
const GEOCODE_DELAY_MS = 700;

type OrsReverse = {
  features?: { properties?: { region?: string; county?: string; locality?: string } }[];
};

/**
 * Koordinattan il çözer (OpenRouteService · Pelias).
 * Yalnızca metinden çözülemeyen kayıtlar için çağrılır; anahtar yoksa veya
 * servis yanıt vermezse null döner ve il "Belirtilmemiş" kalır.
 */
async function geocodeProvince(lat: number, lng: number) {
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) return null;

  const url = new URL(ORS_REVERSE);
  url.searchParams.set("api_key", key);
  url.searchParams.set("point.lat", String(lat));
  url.searchParams.set("point.lon", String(lng));
  url.searchParams.set("boundary.country", "TR");
  url.searchParams.set("size", "1");

  try {
    const data = await fetchJson<OrsReverse>(url.toString(), {
      timeoutMs: 12_000,
      retries: 0,
    });
    const props = data.features?.[0]?.properties;
    return {
      city: normalizeProvince(clean(props?.region)),
      district: clean(props?.county) || clean(props?.locality) || "",
    };
  } catch {
    return null;
  }
}

function mapPoi(poi: OcmPoi, lookups: Lookups) {
  const info = poi.AddressInfo;
  const name = clean(info?.Title);
  const lat = info?.Latitude;
  const lng = info?.Longitude;

  // Konumsuz veya isimsiz kayıt haritada işe yaramaz.
  if (!info || !name || typeof lat !== "number" || typeof lng !== "number") return null;

  const connections = poi.Connections ?? [];
  const socketCount = connections.reduce((sum, c) => sum + (c.Quantity ?? 1), 0) || 1;

  // Güç bilgisi kayıtların bir kısmında yok; 0 yazmak "0 kW istasyon" gibi
  // yanlış bir veri üretir, bu yüzden bilinmiyorsa null bırakılır.
  const powers = connections.map((c) => c.PowerKW ?? 0).filter((p) => p > 0);
  const maxPowerKw = powers.length ? Math.round(Math.max(...powers)) : null;

  const socketTypes = [
    ...new Set(
      connections
        .map((c) => (c.ConnectionTypeID ? lookups.connections.get(c.ConnectionTypeID) : ""))
        .filter((t): t is string => Boolean(t) && t !== "Unknown"),
    ),
  ];

  const city = resolveCityOffline(info) ?? UNKNOWN_CITY;
  const district = clean(info.Town) || (city === UNKNOWN_CITY ? "" : city);
  const operator = (poi.OperatorID && lookups.operators.get(poi.OperatorID)) || "Bilinmiyor";
  const isOperational = poi.StatusTypeID != null ? lookups.operational.get(poi.StatusTypeID) : null;

  return {
    externalId: String(poi.ID),
    name,
    slug: `${slugify(name) || "istasyon"}-${poi.ID}`,
    operator,
    city,
    district,
    address: clean(info.AddressLine1) || name,
    lat,
    lng,
    socketCount,
    maxPowerKw,
    socketTypes,
    isFast: maxPowerKw != null && maxPowerKw >= 50,
    status: isOperational === false ? "pasif" : "aktif",
    source: "openchargemap",
    fetchedAt: new Date(),
  };
}

/**
 * Open Charge Map — Türkiye şarj istasyonları.
 *
 * Ücretsiz API anahtarı gerekir (openchargemap.org/site/develop). Veri ODbL
 * lisanslıdır; sayfada kaynak atfı zorunludur (DataSource.attribution).
 *
 * Fiyat ve 7/24 bilgisi OCM'de HİÇ tutulmaz; bu alanlar ingest tarafından
 * yazılmaz ve boş kalır. Operatör panelden doğrulanmış tarife girebilir,
 * girdiği değer sonraki çalışmalarda korunur.
 */
async function run({ source, limit, deadline }: IngestContext): Promise<IngestResult> {
  const stats = emptyStats();
  const notes: string[] = [];

  const key = process.env.OPENCHARGEMAP_API_KEY!;
  const lookups = await loadLookups(key);

  const url = new URL(source.endpoint || OCM_ENDPOINT);
  url.searchParams.set("countrycode", "TR");
  url.searchParams.set("maxresults", String(Math.min(Math.max(limit, 50), 1000)));
  url.searchParams.set("compact", "true");
  url.searchParams.set("key", key);

  const pois = await fetchJson<OcmPoi[]>(url.toString(), { timeoutMs: 40_000 });
  if (!Array.isArray(pois)) throw new Error("OCM beklenmedik yanıt verdi (dizi değil)");

  // OCM aynı POI'yi birden çok kez döndürebiliyor; ilk kayıt geçerlidir.
  const unique = new Map<number, OcmPoi>();
  for (const poi of pois) if (!unique.has(poi.ID)) unique.set(poi.ID, poi);

  const duplicates = pois.length - unique.size;
  if (duplicates > 0) notes.push(`${duplicates} mükerrer kayıt elendi`);

  for (const poi of unique.values()) {
    stats.fetched++;
    const mapped = mapPoi(poi, lookups);
    if (!mapped) {
      stats.skipped++;
      continue;
    }

    try {
      const existing = await prisma.chargeStation.findFirst({
        where: { externalId: mapped.externalId, source: "openchargemap" },
        select: { id: true, slug: true, maxPowerKw: true, city: true, district: true },
      });

      if (existing) {
        // Kaynakta il hâlâ yoksa, daha önce ters geokodlama ya da operatör
        // tarafından çözülmüş değeri geri silme.
        const keepCity = mapped.city === UNKNOWN_CITY && existing.city !== UNKNOWN_CITY;

        await prisma.chargeStation.update({
          where: { id: existing.id },
          data: {
            ...mapped,
            // slug korunur: yayınlanmış bağlantılar kırılmasın.
            slug: existing.slug,
            // Kaynakta güç yoksa operatörün girdiği değeri silme.
            maxPowerKw: mapped.maxPowerKw ?? existing.maxPowerKw,
            isFast: (mapped.maxPowerKw ?? existing.maxPowerKw ?? 0) >= 50,
            ...(keepCity ? { city: existing.city, district: existing.district } : {}),
          },
        });
        stats.updated++;
      } else {
        await prisma.chargeStation.create({ data: mapped });
        stats.created++;
      }
    } catch (e) {
      stats.failed++;
      if (notes.length < 5) {
        notes.push(`${mapped.externalId}: ${e instanceof Error ? e.message : "hata"}`);
      }
    }
  }

  const geocoded = await backfillCities(deadline);
  if (geocoded > 0) notes.push(`${geocoded} istasyonun ili ters geokodlama ile çözüldü`);

  return { ...stats, notes };
}

/**
 * İli metinden çözülemeyen kayıtları koordinattan tamamlar.
 *
 * Ters geokodlama hız sınırlıdır, bu yüzden her çalışmada bir kısmı işlenir;
 * istasyon envanteri haftalık tazelendiği için kuyruk birkaç çalışmada erir.
 * Süre bütçesi dolduğunda kalanlar bir sonraki çalışmaya bırakılır.
 */
async function backfillCities(deadline?: number) {
  if (!process.env.OPENROUTESERVICE_API_KEY) return 0;

  const pending = await prisma.chargeStation.findMany({
    where: { source: "openchargemap", city: UNKNOWN_CITY },
    select: { id: true, lat: true, lng: true, district: true },
    take: 200,
  });

  let resolved = 0;
  for (const station of pending) {
    if (deadline && Date.now() > deadline - 10_000) break;

    const found = await geocodeProvince(station.lat, station.lng);
    if (found?.city) {
      await prisma.chargeStation.update({
        where: { id: station.id },
        data: {
          city: found.city,
          district: station.district || found.district || found.city,
        },
      });
      resolved++;
    }
    await new Promise((r) => setTimeout(r, GEOCODE_DELAY_MS));
  }

  return resolved;
}

export const openChargeMapSource: SourceJob = {
  key: "openchargemap",
  name: "Open Charge Map (Şarj İstasyonları)",
  kind: "stations",
  schedule: "0 4 * * 1",
  endpoint: OCM_ENDPOINT,
  attribution: "Kaynak: Open Charge Map katkıcıları (ODbL lisansı)",
  requiredEnv: ["OPENCHARGEMAP_API_KEY"],
  run,
};
