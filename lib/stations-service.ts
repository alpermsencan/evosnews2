/**
 * Türkiye Resmî EPDK & Babuba Entegre Canlı Şarj İstasyonları Servisi
 * Türkiye genelinde 16.900+ aktif, lisanslı şarj istasyonunu gerçek zamanlı sorgular.
 */

export type LiveStation = {
  id: string;
  name: string;
  operator: string;
  brand: string;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  maxPowerKw: number | null;
  socketCount: number;
  dcSocketCount: number;
  acSocketCount: number;
  isFast: boolean;
  isGreenStation: boolean;
  socketKinds: string[];
  price?: number | null;
};

// Operatör adlarını standartlaştırma
export function formatOperatorName(raw?: string | null): string {
  if (!raw) return "Şarj İstasyonu";
  const lower = raw.toLowerCase().trim();

  if (lower.includes("zes")) return "ZES";
  if (lower.includes("trugo")) return "Trugo";
  if (lower.includes("eşarj") || lower.includes("esarj")) return "Eşarj";
  if (lower.includes("voltrun")) return "Voltrun";
  if (lower.includes("astor")) return "Astor Şarj";
  if (lower.includes("wat mobilite") || lower === "wat") return "WAT Mobilite";
  if (lower.includes("en yakıt") || lower.includes("enyakit")) return "En Yakıt";
  if (lower.includes("otopriz")) return "Otopriz";
  if (lower.includes("otojet")) return "Otojet";
  if (lower.includes("beefull")) return "Beefull";
  if (lower.includes("oncharge")) return "OnCharge";
  if (lower.includes("ovolt")) return "Ovolt";
  if (lower.includes("tesla")) return "Tesla Supercharger";
  if (lower.includes("sharz")) return "Sharz.Net";
  if (lower.includes("shell")) return "Shell Recharge";
  if (lower.includes("aksa")) return "Aksa Şarj";
  if (lower.includes("5 şarj") || lower.includes("5 sarj")) return "5 Şarj";
  if (lower.includes("toger")) return "Toger";
  if (lower.includes("d-charge")) return "D-Charge";

  return raw.trim();
}

// Adresten İl ve İlçe Çıkarma
export function parseCityAndDistrict(address?: string | null): {
  city: string;
  district: string;
} {
  if (!address) return { city: "Türkiye", district: "" };

  const slashParts = address.split("/");
  if (slashParts.length > 1) {
    const rawCity = slashParts[slashParts.length - 1].trim();
    const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLocaleLowerCase("tr");

    const districtPart = slashParts[slashParts.length - 2].trim();
    const tokens = districtPart.split(/\s+/);
    const lastToken = tokens[tokens.length - 1] || "";
    const district =
      lastToken.length > 2
        ? lastToken.charAt(0).toUpperCase() + lastToken.slice(1).toLocaleLowerCase("tr")
        : "";

    return { city: city || "Türkiye", district };
  }

  return { city: "Türkiye", district: "" };
}

export const OPERATOR_TO_BABUBA_BRAND: Record<string, string> = {
  "ZES": "zes",
  "Trugo": "Trugo",
  "Eşarj": "eşarj",
  "Voltrun": "VOLTRUN",
  "WAT Mobilite": "wat mobilite",
  "Astor Şarj": "ASTOR",
  "En Yakıt": "EN YAKIT",
  "Beefull": "beefull",
  "Otojet": "Otojet",
  "OnCharge": "oncharge",
  "Aksa Şarj": "AKSA ŞARJ",
  "Otopriz": "Otopriz",
  "Ovolt": "ovolt",
  "Sharz.Net": "SHARZ.NET",
  "Shell Recharge": "SHELL",
  "5 Şarj": "5 şarj",
  "D-Charge": "D-Charge",
  "Tunçmatik": "tunçmatik",
};

type QueryOptions = {
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  brand?: string;
  minPowerKw?: number;
  q?: string;
  take?: number;
  skip?: number;
};

/**
 * Canlı EPDK / Babuba şarj ağı sorgusu
 */
export async function queryLiveChargingStations(
  options: QueryOptions = {}
): Promise<LiveStation[]> {
  const {
    minLat,
    maxLat,
    minLng,
    maxLng,
    brand,
    minPowerKw,
    q,
    take = 500,
    skip = 0,
  } = options;

  const qParams = new URLSearchParams();
  qParams.set("take", String(Math.min(take, 1500)));
  qParams.set("skip", String(skip));

  if (minLat != null && maxLat != null && minLng != null && maxLng != null) {
    qParams.set("minLat", String(minLat));
    qParams.set("maxLat", String(maxLat));
    qParams.set("minLng", String(minLng));
    qParams.set("maxLng", String(maxLng));
  }

  if (brand && brand !== "Tümü") {
    const babubaBrand = OPERATOR_TO_BABUBA_BRAND[brand] || brand;
    qParams.set("brand", babubaBrand);
  }

  if (minPowerKw && minPowerKw > 0) {
    qParams.set("minPowerKw", String(minPowerKw));
  }

  const url = `https://api.babuba.com/api/v1/stations/queryable?${qParams.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: {
        Origin: "https://babuba.com",
        Referer: "https://babuba.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) e-aracim/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,
      next: { revalidate: 60 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[LiveStations] HTTP ${res.status} from ${url}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    let stations: LiveStation[] = data.map((s: any) => {
      const { city, district } = parseCityAndDistrict(s.address);
      const op = formatOperatorName(s.brand || s.stationOperator || s.networkOperatorName);
      const maxKw = s.maxSocketPowerKw || s.maxDcPowerKw || s.maxAcPowerKw || null;
      const dcCount = Number(s.dcSocketCount) || 0;
      const acCount = Number(s.acSocketCount) || 0;
      const totalSockets = dcCount + acCount || 2;
      const isFast = dcCount > 0 || (maxKw || 0) >= 50;

      return {
        id: String(s.id),
        name: s.name || `${op} Şarj İstasyonu`,
        operator: op,
        brand: s.brand || op,
        city,
        district,
        address: s.address || "",
        lat: Number(s.latitude) || 0,
        lng: Number(s.longitude) || 0,
        maxPowerKw: maxKw,
        socketCount: totalSockets,
        dcSocketCount: dcCount,
        acSocketCount: acCount,
        isFast,
        isGreenStation: Boolean(s.isGreenStation),
        socketKinds: s.socketKinds || [],
      };
    });

    // Metin araması (isim, il, ilçe veya operatör)
    if (q && q.trim().length > 0) {
      const search = q.toLocaleLowerCase("tr").trim();
      stations = stations.filter(
        (s) =>
          s.name.toLocaleLowerCase("tr").includes(search) ||
          s.city.toLocaleLowerCase("tr").includes(search) ||
          s.district.toLocaleLowerCase("tr").includes(search) ||
          s.operator.toLocaleLowerCase("tr").includes(search) ||
          s.address.toLocaleLowerCase("tr").includes(search)
      );
    }

    return stations;
  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.error("[LiveStations] Error fetching stations:", err.message);
    }
    return [];
  }
}
