import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api";

export const dynamic = "force-dynamic";

const COOKIE = "evos_admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";

/** POST /api/auth -> { password } : admin girişi */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (!password || password !== PASSWORD)
      return fail("Şifre hatalı", 401);

    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE, PASSWORD, {
      httpOnly: true,
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
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
