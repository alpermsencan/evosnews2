import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";
import { ADMIN_COOKIE, adminToken, isValidAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

/** POST /api/auth -> { password } : admin girişi */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = body.password;

    if (!isValidAdminPassword(password)) {
      return fail("Şifre hatalı. Lütfen 'evos2026' giriniz.", 401);
    }

    const token = await adminToken();
    const res = NextResponse.json({ success: true, redirect: "/admin" });

    // Hostinger ve HTTP/HTTPS ortamlarının tümünde çalışması için secure: false
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 gün
    });

    return res;
  } catch {
    return fail("Giriş yapılamadı", 500);
  }
}

/** GET /api/auth?key=evos2026 -> Tek tıkla doğrudan giriş ve yönlendirme */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const devam = req.nextUrl.searchParams.get("devam") || "/admin";

  if (isValidAdminPassword(key)) {
    const token = await adminToken();
    const url = req.nextUrl.clone();
    url.pathname = devam;
    url.search = "";

    const res = NextResponse.redirect(url);
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  return NextResponse.redirect(new URL("/admin/giris", req.url));
}

/** DELETE /api/auth : çıkış */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
