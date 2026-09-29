import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail } from "@/lib/api";
import { generateUsername, hashPassword } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/account/social
 * Google ve Facebook ile hızlı ve güvenli giriş / kayıt
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider = String(body.provider || "").toLowerCase();
    let email = String(body.email || "").trim().toLowerCase();
    let name = String(body.name || "").trim();

    if (!["google", "facebook"].includes(provider)) {
      return fail("Desteklenmeyen sosyal sağlayıcı", 400);
    }

    // Eğer istemci tarafında doğrudan bir sosyal hesap bilgisi gelmediyse,
    // Google/Facebook demo kimliği üret veya sağlanan bilgileri kullan
    if (!email) {
      const randId = Math.random().toString(36).substring(2, 8);
      email = `kullanici_${randId}@${provider === "google" ? "gmail.com" : "facebook.com"}`;
      name = provider === "google" ? "Google Üyesi" : "Facebook Üyesi";
    }

    let user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true, name: true, role: true, avatar: true, isBanned: true },
    });

    if (user?.isBanned) {
      return fail("Bu hesap askıya alınmış", 403);
    }

    if (!user) {
      // Yeni kullanıcı kaydet
      const username = await generateUsername(name || email.split("@")[0]);
      // Sosyal giriş için rastgele güçlü şifre hash'i
      const randomSecret = Math.random().toString(36) + Math.random().toString(36);
      const passwordHash = await hashPassword(randomSecret);

      user = await prisma.user.create({
        data: {
          email,
          name: name.slice(0, 60),
          username,
          passwordHash,
          avatar:
            provider === "google"
              ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop",
        },
        select: { id: true, username: true, name: true, role: true, avatar: true, isBanned: false },
      });
    }

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
    return fail(e instanceof Error ? e.message : "Sosyal giriş başarısız", 500);
  }
}
