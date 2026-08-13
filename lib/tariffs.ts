/**
 * ŞARJ TARİFESİ YARDIMCILARI
 *
 * Tarifeler operatör bazında tutulur (bkz. `OperatorTariff`), istasyon
 * envanteri ise Open Charge Map'ten gelir. İki tarafın operatör adları birebir
 * aynı değildir: OCM "ZES", "Eşarj (TR)", "Otopriz (Türkiye)" yazarken tarife
 * kaydı "ZES (Zorlu)", "Eşarj (Enerjisa)", "Otopriz" der. Buradaki
 * normalizasyon iki adı ortak bir anahtara indirger, böylece elle alias listesi
 * tutmak yalnızca gerçek istisnalar (ör. "Tesla Supercharger" ↔ "Tesla") için
 * gerekir.
 *
 * Hiçbir eşleşme bulunamazsa tarife GÖSTERİLMEZ — yanlış operatörün fiyatını
 * göstermektense "—" göstermek doğrudur.
 */

/** Fiyat kademeleri — operatörlerin ilan yapısıyla birebir aynı. */
export const TIERS = [
  { key: "ac", label: "AC ŞARJ", range: "≤ 22 kW" },
  { key: "dc", label: "DC HIZLI", range: "< 150 kW" },
  { key: "ultra", label: "DC ULTRA", range: "≥ 150 kW" },
] as const;

export type TierKey = (typeof TIERS)[number]["key"];

export type TariffLike = {
  operator: string;
  slug: string;
  aliases: string[];
  acPrice: number | null;
  acPriceMax: number | null;
  dcPrice: number | null;
  dcPriceMax: number | null;
  ultraPrice: number | null;
  ultraPriceMax: number | null;
  website: string | null;
  note: string | null;
  verifiedAt: Date | string | null;
};

/**
 * Karşılaştırma anahtarı: parantez içindeki ek ("(TR)", "(Zorlu)") atılır,
 * Türkçe büyük/küçük harf katlanır, harf ve rakam dışındaki her şey silinir.
 * "Astor Şarj (TR)" ve "Astor Şarj" → "astorsarj".
 */
export function normalizeOperator(name: string) {
  return name
    .replace(/\([^)]*\)/g, " ")
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

/** Operatör adı → tarife kaydı. Bulunamazsa null. */
export function buildTariffIndex<T extends { operator: string; aliases: string[] }>(
  tariffs: T[],
) {
  const index = new Map<string, T>();
  for (const t of tariffs) {
    for (const name of [t.operator, ...t.aliases]) {
      const key = normalizeOperator(name);
      // İlk kayıt kazanır: alias, başka bir operatörün asıl adını ezmesin.
      if (key && !index.has(key)) index.set(key, t);
    }
  }
  return index;
}

export function matchTariff<T extends { operator: string; aliases: string[] }>(
  index: Map<string, T>,
  operatorName: string,
) {
  return index.get(normalizeOperator(operatorName)) ?? null;
}

export function tierPrice(t: TariffLike, tier: TierKey) {
  const min = tier === "ac" ? t.acPrice : tier === "dc" ? t.dcPrice : t.ultraPrice;
  const max =
    tier === "ac" ? t.acPriceMax : tier === "dc" ? t.dcPriceMax : t.ultraPriceMax;
  return { min, max };
}

/** "9,99 ₺" veya aralık ilan edilmişse "8,20 – 8,63 ₺". Fiyat yoksa "—". */
export function formatTariff(min: number | null, max: number | null) {
  if (min == null) return "—";
  const f = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return max != null && max !== min ? `${f(min)} – ${f(max)} ₺` : `${f(min)} ₺`;
}

/**
 * Kademe özeti: en ucuz, en pahalı ve ortanca fiyat.
 *
 * Ortalama değil ORTANCA kullanılıyor: tek bir operatörün sabit yüksek tarifesi
 * (ör. 14,90 ₺) ortalamayı yukarı çekip "tipik fiyat" izlenimini bozuyor.
 * Aralık ilan eden operatörler alt sınırlarıyla girer — kullanıcının
 * karşılaşabileceği en düşük fiyat odur.
 */
export function tierSummary(tariffs: TariffLike[], tier: TierKey) {
  const values = tariffs
    .map((t) => tierPrice(t, tier).min)
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b);

  if (!values.length) return null;

  const mid = Math.floor(values.length / 2);
  return {
    min: values[0],
    max: values[values.length - 1],
    median:
      values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid],
    count: values.length,
    cheapest: tariffs.find((t) => tierPrice(t, tier).min === values[0]) ?? null,
  };
}
