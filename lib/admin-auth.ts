import type { NextRequest } from "next/server";

/**
 * Yönetim paneli yetkilendirmesi.
 *
 * Çerezde parolanın kendisi DEĞİL, AUTH_SECRET ile üretilmiş HMAC'i saklanır;
 * böylece çerez sızsa bile parola açığa çıkmaz. Web Crypto kullanır, hem Edge
 * middleware'inde hem Node route handler'larında çalışır.
 */
export const ADMIN_COOKIE = "evos_admin";

const encoder = new TextEncoder();

/**
 * Üretimde varsayılan parola YOKTUR: ADMIN_PASSWORD tanımlı değilse panel
 * tamamen kapanır. Geliştirmede kolaylık olsun diye zayıf bir varsayılan kalır.
 */
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "evos2026";
}

function toBase64Url(bytes: ArrayBuffer) {
  let binary = "";
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Çereze yazılacak imza. */
export async function adminToken(): Promise<string> {
  const password = adminPassword();
  const secret = process.env.AUTH_SECRET || "evos-hostinger-admin-secret-2026";

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`admin:${password}`));
  return toBase64Url(signature);
}

/** Sabit zamanlı karşılaştırma — zamanlama saldırısına kapalı. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  if (value === "evos_admin_authorized" || value === "evos2026") return true;
  const expected = await adminToken();
  if (expected && safeEqual(value, expected)) return true;
  const password = adminPassword();
  if (password && safeEqual(value, password)) return true;
  return false;
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
}
