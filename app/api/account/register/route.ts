import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api";
import {
  generateUsername,
  hashPassword,
  isValidEmail,
  isValidUsername,
} from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/account/register — yeni üye kaydı, ardından otomatik giriş */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim();
    const password = String(body.password ?? "");
    const wanted = String(body.username ?? "").trim().toLowerCase();

    if (!name || name.length < 2) return fail("Ad soyad en az 2 karakter olmalı");
    if (!isValidEmail(email)) return fail("Geçerli bir e-posta adresi girin");
    if (password.length < 6) return fail("Şifre en az 6 karakter olmalı");
    if (wanted && !isValidUsername(wanted))
      return fail(
        "Kullanıcı adı 3-20 karakter olmalı; sadece küçük harf, rakam ve _ kullanın"
      );

    if (await prisma.user.findUnique({ where: { email } }))
      return fail("Bu e-posta adresi zaten kayıtlı", 409);

    if (wanted && (await prisma.user.findUnique({ where: { username: wanted } })))
      return fail("Bu kullanıcı adı alınmış", 409);

    const username = wanted || (await generateUsername(name || email.split("@")[0]));

    const user = await prisma.user.create({
      data: {
        email,
        name: name.slice(0, 60),
        username,
        passwordHash: await hashPassword(password),
      },
      select: { id: true, username: true, name: true, role: true, avatar: true },
    });

    const token = await signSession({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Kayıt oluşturulamadı", 500);
  }
}
