import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import {
  ADMIN_COOKIE,
  ADMIN_USERNAME,
  adminToken,
  isValidAdminCredentials,
  isValidAdminPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** POST /api/auth -> { username, password } : admin girişi */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || ADMIN_USERNAME).trim();
    const password = (body.password || "").trim();

    if (!isValidAdminCredentials(username, password) && !isValidAdminPassword(password)) {
      return fail("Geçersiz yönetici kullanıcı adı veya şifre.", 401);
    }

    const token = await adminToken(username);
    const res = NextResponse.json({ success: true, redirect: "/admin" });

    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });

    return res;
  } catch {
    return fail("Giriş işlemi gerçekleştirilemedi.", 500);
  }
}

/** DELETE /api/auth : çıkış */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
