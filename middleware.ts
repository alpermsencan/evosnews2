import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const ADMIN_COOKIE = "evos_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";

/** Giriş yapmış üye gerektiren alanlar */
const MEMBER_PATHS = [
  "/hesabim",
  "/bildirimler",
  "/akis",
  "/arkadaslar",
  "/reels/yeni",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin koruması
  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (token !== ADMIN_PASSWORD) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/giris";
      url.searchParams.set("devam", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Üye alanı koruması
  if (MEMBER_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/giris";
      url.searchParams.set("devam", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Giriş yapmış üye tekrar giriş/kayıt sayfasına düşmesin
  if (pathname === "/giris" || pathname === "/kayit") {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (session) {
      const url = req.nextUrl.clone();
      url.pathname = `/profil/${session.username}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Root layout'un admin/site kabuğunu ayırt edebilmesi için
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
