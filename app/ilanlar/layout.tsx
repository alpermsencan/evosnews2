import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin-auth";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import ComingSoonListings from "@/components/listings/ComingSoonListings";

export const dynamic = "force-dynamic";

export default async function ListingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(ADMIN_COOKIE)?.value;
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;

  const isDirectAdmin = await isAdminCookie(adminCookie);
  const session = await verifySession(sessionCookie);
  const isUserAdmin = Boolean(
    session &&
      (session.role === "admin" || session.username.toLowerCase() === "alperx")
  );

  const isAdmin = isDirectAdmin || isUserAdmin;

  // Yönetici değilse "Yakında Yayına Hazırlanıyor" ekranını göster
  if (!isAdmin) {
    return <ComingSoonListings />;
  }

  // Yönetici ise sayfayı ve yönetici bilgilendirme rozetini göster
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-neutral-950 shadow-sm border border-amber-600/40">
        <div className="flex items-center gap-2 text-xs font-bold leading-tight">
          <span className="text-base">👁️</span>
          <span>
            <strong className="font-black text-black">YÖNETİCİ ÖNİZLEMESİ:</strong> 2. El İlanlar
            sayfası şu anda yalnızca size (<strong>alperx</strong>) açıktır. Normal ziyaretçilere
            &quot;Yakında Yayına Hazırlanıyor&quot; ekranı sunulmaktadır.
          </span>
        </div>
        <span className="shrink-0 rounded-lg bg-neutral-950 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400 shadow-2xs">
          Admin Aktif
        </span>
      </div>
      {children}
    </div>
  );
}
