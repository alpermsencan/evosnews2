import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import {
  ADMIN_COOKIE,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  adminToken,
  isValidAdminCredentials,
  isValidAdminPassword,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/** POST /api/auth -> { username, password } : admin girişi */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const username = String(body.username || ADMIN_USERNAME).trim();
    const password = String(body.password || "").trim();

    if (!password) {
      return fail("Şifre boş olamaz.", 400);
    }

    let isAuthorized = false;

    // 1. Env / doğrudan kimlik kontrolü (alperx & ytung011)
    if (
      isValidAdminCredentials(username, password) ||
      isValidAdminPassword(password) ||
      (username.toLowerCase() === "alperx" && password === "ytung011") ||
      (username.toLowerCase() === ADMIN_USERNAME.toLowerCase() && password === ADMIN_PASSWORD)
    ) {
      isAuthorized = true;
    }

    // 2. Veritabanındaki admin kullanıcısı kontrolü (varsa bcrypt ile doğrula)
    if (!isAuthorized) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            role: "admin",
            OR: [
              { username: { equals: username, mode: "insensitive" } },
              { email: { equals: username, mode: "insensitive" } },
            ],
          },
        });

        if (dbUser && dbUser.passwordHash) {
          const match = await bcrypt.compare(password, dbUser.passwordHash);
          if (match && !dbUser.isBanned) {
            isAuthorized = true;
          }
        }
      } catch (dbErr) {
        console.error("Admin DB auth check error:", dbErr);
      }
    }

    if (!isAuthorized) {
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
