import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import {
  PUBLIC_USER_SELECT,
  getRequestUser,
  hashPassword,
  isValidUsername,
  verifyPassword,
} from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PUT /api/account/profile — profil bilgileri (ve isteğe bağlı şifre değişimi) */
export async function PUT(req: NextRequest) {
  const current = await getRequestUser(req);
  if (!current) return fail("Önce giriş yapmalısınız", 401);

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2) return fail("Ad soyad en az 2 karakter olmalı");
      data.name = name.slice(0, 60);
    }

    if (body.username !== undefined) {
      const username = String(body.username).trim().toLowerCase();
      if (!isValidUsername(username))
        return fail(
          "Kullanıcı adı 3-20 karakter olmalı; sadece küçük harf, rakam ve _ kullanın"
        );
      if (username !== current.username) {
        const taken = await prisma.user.findUnique({ where: { username } });
        if (taken) return fail("Bu kullanıcı adı alınmış", 409);
        data.username = username;
      }
    }

    if (body.avatar !== undefined) data.avatar = String(body.avatar) || null;
    if (body.bio !== undefined) data.bio = String(body.bio).slice(0, 300) || null;
    if (body.city !== undefined) data.city = String(body.city).slice(0, 40) || null;
    if (body.website !== undefined)
      data.website = String(body.website).slice(0, 120) || null;
    if (body.twitter !== undefined)
      data.twitter = String(body.twitter).replace("@", "").slice(0, 40) || null;

    // Şifre değişimi ayrı doğrulama ister
    if (body.newPassword) {
      const newPassword = String(body.newPassword);
      if (newPassword.length < 6) return fail("Yeni şifre en az 6 karakter olmalı");

      const full = await prisma.user.findUnique({ where: { id: current.id } });
      if (!full) return fail("Kullanıcı bulunamadı", 404);
      if (!(await verifyPassword(String(body.currentPassword ?? ""), full.passwordHash)))
        return fail("Mevcut şifreniz hatalı", 403);

      data.passwordHash = await hashPassword(newPassword);
    }

    if (Object.keys(data).length === 0) return fail("Güncellenecek alan yok");

    const user = await prisma.user.update({
      where: { id: current.id },
      data,
      select: PUBLIC_USER_SELECT,
    });

    // Kullanıcı adı / ad değiştiyse jeton içeriği tazelenir
    const res = NextResponse.json({ user });
    const token = await signSession({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Profil güncellenemedi", 500);
  }
}

/** GET /api/account/profile — düzenleme formu için mevcut değerler */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return fail("Önce giriş yapmalısınız", 401);
  return ok({ user });
}
