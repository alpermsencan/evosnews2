import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api";
import { verifyPassword } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/account/login — e-posta veya kullanıcı adı + şifre */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = String(body.email ?? body.identifier ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (!identifier || !password)
      return fail("E-posta ve şifre zorunludur");

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    // Kullanıcı yoksa da aynı mesaj: hesap varlığı sızdırılmaz
    if (!user || !(await verifyPassword(password, user.passwordHash)))
      return fail("E-posta veya şifre hatalı", 401);

    if (user.isBanned) return fail("Bu hesap askıya alınmış", 403);

    const token = await signSession({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Giriş yapılamadı", 500);
  }
}
