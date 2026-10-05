import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "evos_admin";
export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "alperx").trim();
export const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "ytung011").trim();

function getSecretKey() {
  const secret =
    process.env.AUTH_SECRET ||
    "7c10b4f8a42f55cbcf43db0e08f51ab3520141f238ad9b92209bbbb969cb452f";
  return new TextEncoder().encode(secret);
}

/** Varsayılan yönetici parolası */
export function adminPassword(): string {
  return ADMIN_PASSWORD;
}

/**
 * Yönetici kullanıcı adı ve parola doğrulama.
 * Yalnızca 'alperx' ve 'ytung011' kabul edilir.
 */
export function isValidAdminCredentials(
  username: string | undefined | null,
  password: string | undefined | null
): boolean {
  if (!username || !password) return false;
  const u = username.trim().toLowerCase();
  const p = password.trim();

  // Sabit veya env üzerinden tanımlı alperx & ytung011
  const matchesEnv = u === ADMIN_USERNAME.toLowerCase() && p === ADMIN_PASSWORD;
  const matchesDefault = u === "alperx" && p === "ytung011";

  return matchesEnv || matchesDefault;
}

/**
 * Tek şifre kontrolü için (geriye dönük uyumluluk)
 */
export function isValidAdminPassword(input: string | undefined | null): boolean {
  if (!input) return false;
  const p = input.trim();
  return p === ADMIN_PASSWORD || p === "ytung011";
}

/**
 * Kriptografik olarak imzalanmış 30 günlük güvenli yönetici JWT token'ı
 */
export async function adminToken(username: string = ADMIN_USERNAME): Promise<string> {
  return new SignJWT({ role: "admin", username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(username)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

/**
 * Çerezdeki JWT token'ın kriptografik imza ve yetki kontrolü
 */
export async function isAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const v = value.trim();

  try {
    const { payload } = await jwtVerify(v, getSecretKey());
    return payload.role === "admin" && String(payload.username).toLowerCase() === ADMIN_USERNAME.toLowerCase();
  } catch {
    return false;
  }
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
}
