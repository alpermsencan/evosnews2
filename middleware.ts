import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin-auth";

/** Giriş yapmış üye gerektiren alanlar */
const MEMBER_PATHS = [
  "/hesabim",
  "/bildirimler",
  "/akis",
  "/arkadaslar",
  "/reels/yeni",
  "/ilanlarim",
  "/ilanlar/yeni",
];

/**
 * Yalnızca yöneticinin yazabileceği API yolları.
 * Sayfa korumasının yanı sıra API'nin de korunması şart: aksi halde panel
 * arkasındaki içerik uçları doğrudan istekle dışarıdan değiştirilebilir.
 */
const ADMIN_API = [
  /^\/api\/articles(\/|$)/,
  /^\/api\/categories(\/|$)/,
  /^\/api\/authors(\/|$)/,
  /^\/api\/vehicles(\/|$)/,
  /^\/api\/stations(\/|$)/,
  /^\/api\/tariffs(\/|$)/,
  /^\/api\/listings(\/|$)/,
  /^\/api\/community(\/|$)/,
  /^\/api\/ticker(\/|$)/,
  /^\/api\/prices(\/|$)/,
  /^\/api\/otv(\/|$)/,
  /^\/api\/admin(\/|$)/,
  /^\/api\/moderation(\/|$)/,
  /^\/api\/sources(\/|$)/,
];

/** Üyelere/ziyaretçilere açık kalması gereken yazma uçları (istisnalar). */
const PUBLIC_WRITES = [
  /^\/api\/articles\/[^/]+\/(like|bookmark)$/, // üye beğeni/kaydetme
  /^\/api\/community\/[^/]+$/, // topluluk gönderisi beğenisi (POST)
  // Üye ilan verir; ilan PENDING düşer ve moderasyondan geçmeden yayına
  // çıkmaz (bkz. app/api/listings/route.ts). Favorileme de üyeye açıktır.
  /^\/api\/listings$/,
  /^\/api\/listings\/[^/]+\/favorite$/,
];

/**
 * Sahibinin de yazabildiği uçlar: yetki kontrolü kaydın sahipliğine bağlı
 * olduğu için middleware'de değil, route handler'ın içinde yapılır.
 * (İlan sahibi kendi ilanını düzenler/siler; moderasyon alanlarına dokunamaz.)
 */
const OWNER_WRITES = [/^\/api\/listings\/[^/]+$/];

function needsAdmin(pathname: string, method: string) {
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return false;
  if (PUBLIC_WRITES.some((re) => re.test(pathname)) && method === "POST") return false;
  // PUT/DELETE dahil: sahiplik kontrolü handler'ın içinde yapılır.
  if (OWNER_WRITES.some((re) => re.test(pathname))) return false;
  return ADMIN_API.some((re) => re.test(pathname));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;

  // Admin API koruması
  if (needsAdmin(pathname, req.method) && !(await isAdminCookie(adminCookie))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  // Admin sayfa koruması
  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    if (!(await isAdminCookie(adminCookie))) {
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
