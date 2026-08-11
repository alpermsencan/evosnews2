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
export function adminPassword(): string | null {
  const configured = process.env.ADMIN_PASSWORD;
  if (configured) return configured;
  return process.env.NODE_ENV === "production" ? null : "evos2026";
}

function toBase64Url(bytes: ArrayBuffer) {
  let binary = "";
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Çereze yazılacak imza. Gerekli ayar eksikse null döner (= giriş kapalı). */
export async function adminToken(): Promise<string | null> {
  const password = adminPassword();
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) return null;

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
  const expected = await adminToken();
  return !!expected && safeEqual(value, expected);
}
