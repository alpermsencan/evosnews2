import { NextRequest, NextResponse } from "next/server";

const COOKIE = "evos_admin";
const PASSWORD = process.env.ADMIN_PASSWORD || "evos2026";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin koruması
  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    const token = req.cookies.get(COOKIE)?.value;
    if (token !== PASSWORD) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/giris";
      url.searchParams.set("devam", pathname);
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
