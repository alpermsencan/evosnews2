import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { ADMIN_COOKIE, adminPassword, adminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** POST /api/auth -> { password } : admin girişi */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expected = adminPassword();

    // Üretimde ADMIN_PASSWORD tanımlı değilse panel kapalıdır.
    if (!expected) return fail("Yönetim girişi yapılandırılmamış", 503);
    if (!password || password !== expected) return fail("Şifre hatalı", 401);

    const token = await adminToken();
    if (!token) return fail("Yönetim girişi yapılandırılmamış", 503);

    const res = NextResponse.json({ success: true });
    // Çerezde parola değil, AUTH_SECRET ile üretilmiş imza taşınır.
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return fail("Giriş yapılamadı", 500);
  }
}

/** DELETE /api/auth : çıkış */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
