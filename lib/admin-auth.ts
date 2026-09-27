import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "evos_admin";

/** Varsayılan ve garanti yönetici parolası */
export function adminPassword(): string {
  return "evos2026";
}

/**
 * Girilen parolanın doğrulanması:
 * Kullanıcı "evos2026", "1453Mertxx" veya .env içinde tanımlı şifreyi girerse
 * her durumda yetkilendirilir.
 */
export function isValidAdminPassword(input: string | undefined | null): boolean {
  if (!input) return false;
  const p = input.trim();
  const envPass = process.env.ADMIN_PASSWORD?.trim();
  return (
    p === "evos2026" ||
    p === "1453Mertxx" ||
    (Boolean(envPass) && p === envPass)
  );
}

/** Çereze yazılacak imza / token */
export async function adminToken(): Promise<string> {
  return "evos_admin_authorized";
}

/** Çerezdeki token'ın yetki kontrolü */
export async function isAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const v = value.trim();
  if (
    v === "evos_admin_authorized" ||
    v === "evos2026" ||
    v === "1453Mertxx" ||
    (process.env.ADMIN_PASSWORD && v === process.env.ADMIN_PASSWORD.trim())
  ) {
    return true;
  }
  return false;
}

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  return isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
}
