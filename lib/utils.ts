export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatTL(value: number, opts: { compact?: boolean } = {}) {
  if (opts.compact && value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 2,
    })} Mn ₺`;
  }
  return `${value.toLocaleString("tr-TR")} ₺`;
}

export function formatNumber(value: number, digits = 0) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

const MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

const DAYS = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
];

export function formatDate(date: Date | string, withTime = true) {
  const d = typeof date === "string" ? new Date(date) : date;
  const base = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return base;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${base}, ${hh}:${mm}`;
}

export function formatLongDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} ${
    DAYS[d.getDay()]
  }`;
}

export function timeAgo(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "az önce";
  if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
  return formatDate(d, false);
}

export function slugify(text: string) {
  const map: Record<string, string> = {
    ç: "c",
    Ç: "c",
    ğ: "g",
    Ğ: "g",
    ı: "i",
    İ: "i",
    ö: "o",
    Ö: "o",
    ş: "s",
    Ş: "s",
    ü: "u",
    Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Metin HTML mi, yoksa eski düz metin içerik mi? */
export function isHtml(text: string) {
  return /<(p|h[1-6]|ul|ol|li|br|img|blockquote|figure|div|iframe|strong|em|a)\b[^>]*>/i.test(
    text
  );
}

/**
 * Editör ve yayın tarafı için içeriği HTML'e çevirir.
 * Eski kayıtlar boş satırla ayrılmış düz metin olduğundan paragraflara bölünür.
 */
export function contentToHtml(text: string) {
  if (!text) return "";
  if (isHtml(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/** Basit ÖTV + KDV hesaplayıcı (elektrikli araçlar, motor gücü bazlı) */
export function calcOtv(basePrice: number, motorKw: number) {
  let rate = 10;
  if (motorKw <= 160) {
    rate = basePrice <= 1_450_000 ? 10 : 40;
  } else {
    rate = basePrice <= 2_200_000 ? 50 : 60;
  }
  const otv = Math.round((basePrice * rate) / 100);
  const kdvBase = basePrice + otv;
  const kdv = Math.round(kdvBase * 0.2);
  return { rate, otv, kdv, total: kdvBase + kdv, base: basePrice };
}
