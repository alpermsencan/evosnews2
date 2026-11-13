import type { NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "evos_admin";
export const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "admin").trim();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ISSUER = "evos";
const AUDIENCE = "evos-admin-v2";

export function isAuthConfigured(): boolean {
  return (process.env.AUTH_SECRET?.length ?? 0) >= 32;
}
function getSecretKey() {
  if (!isAuthConfigured()) throw new Error("Oturum güvenliği yapılandırılmamış");
  return new TextEncoder().encode(process.env.AUTH_SECRET!);
}
function equal(a: string, b: string) {
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return difference === 0;
}
export function isValidAdminCredentials(username: string | null | undefined, password: string | null | undefined): boolean {
  if (!isAuthConfigured() || ADMIN_PASSWORD.length < 12 || !username || !password || password.length < 12 || password.length > 1024) return false;
  return equal(username.trim().toLowerCase(), ADMIN_USERNAME.toLowerCase()) && equal(password, ADMIN_PASSWORD);
}
export async function adminToken(username: string = ADMIN_USERNAME): Promise<string> {
  return new SignJWT({ role: "admin", username, version: 2 })
    .setProtectedHeader({ alg: "HS256" }).setIssuer(ISSUER).setAudience(AUDIENCE)
    .setSubject(username).setIssuedAt().setExpirationTime("8h").sign(getSecretKey());
}
export async function isAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value || !isAuthConfigured()) return false;
  try {
    const { payload } = await jwtVerify(value, getSecretKey(), { algorithms: ["HS256"], issuer: ISSUER, audience: AUDIENCE });
    return payload.role === "admin" && payload.version === 2 && typeof payload.username === "string" && payload.username.length > 0 && payload.sub === payload.username;
  } catch { return false; }
}
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
}
