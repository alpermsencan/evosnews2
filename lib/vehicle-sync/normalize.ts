import { slugify } from "@/lib/api";

export { slugify };

/**
 * Normalizes text by lowercasing, stripping special characters, and collapsing whitespace.
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Safely parses price strings (e.g., "2.490.000 TL") or numbers into integer.
 * Returns null if parsing fails.
 */
export function parsePrice(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  if (typeof val === "number") {
    return Number.isFinite(val) ? Math.round(val) : null;
  }
  
  let str = val.trim();
  // Strip out suffix currency symbols if present
  str = str.replace(/(TL|TRY|₺|\$|€)/gi, "").trim();
  
  // Handle decimals (e.g. 2.490.000,00 or 2490000.00)
  if (str.includes(",")) {
    const parts = str.split(",");
    // If last part is likely decimal/cents (length 1 or 2), drop it
    if (parts.length > 1 && parts[parts.length - 1].length <= 2) {
      str = parts.slice(0, -1).join("");
    }
  } else if (str.includes(".")) {
    const parts = str.split(".");
    // If only one dot and last part has length <= 2, it is probably decimal
    if (parts.length === 2 && parts[1].length <= 2) {
      str = parts[0];
    }
  }
  
  // Clean all non-digit characters
  const clean = str.replace(/[^0-9]/g, "");
  const parsed = parseInt(clean, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
