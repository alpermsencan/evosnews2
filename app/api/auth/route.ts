import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { ADMIN_COOKIE, ADMIN_USERNAME, adminToken, isAuthConfigured, isValidAdminCredentials } from "@/lib/admin-auth";
import { rateLimit, sameOrigin } from "@/lib/request-security";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail("İzin verilmeyen kaynak", 403);
  if (!isAuthConfigured()) return fail("Yönetim girişi yapılandırılmamış", 503);
  try {
    const body = await req.json();
    const username = String(body.username || ADMIN_USERNAME).trim();
    const password = String(body.password || "");
    if (!username || username.length > 120 || !password || password.length > 1024) return fail("Geçerli kullanıcı adı ve şifre gerekli", 400);
    const limited = rateLimit(`admin:${username.toLowerCase()}`);
    if (limited) return limited;
    if (password.length < 12) return fail("Geçersiz yönetici kullanıcı adı veya şifre.", 401);
    let authorized = isValidAdminCredentials(username, password);
    let canonicalUsername = ADMIN_USERNAME;
    if (!authorized) {
      const user = await prisma.user.findFirst({ where: {
        role: "admin", isBanned: false,
        OR: [{ username: { equals: username, mode: "insensitive" } }, { email: { equals: username, mode: "insensitive" } }],
      } });
      if (user && await bcrypt.compare(password, user.passwordHash)) {
        authorized = true;
        canonicalUsername = user.username;
      }
    }
    if (!authorized) return fail("Geçersiz yönetici kullanıcı adı veya şifre.", 401);
    const res = NextResponse.json({ success: true, redirect: "/admin" });
    res.cookies.set(ADMIN_COOKIE, await adminToken(canonicalUsername), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60,
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch { return fail("Giriş işlemi gerçekleştirilemedi.", 500); }
}
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return fail("İzin verilmeyen kaynak", 403);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
