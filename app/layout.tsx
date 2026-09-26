import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import SessionProvider from "@/components/user/SessionProvider";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  // Göreli OG/twitter görsellerinin mutlak URL'e çevrilmesi için gerekli.
  metadataBase: new URL(siteUrl()),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteUrl()}/feed.xml` },
  },
  title: {
    default: "EVOtoPilot · Elektrikli Araç & Akıllı Mobilite Platformu",
    template: "%s · EVOtoPilot",
  },
  description:
    "Türkiye'nin akıllı elektrikli araç platformu EVOtoPilot: 2026 güncel model kataloğu, gerçek menzil simülatörü, akaryakıt tasarruf hesabı, canlı şarj ağı haritası, ÖTV rehberi, VoltScore batarya analizi ve AI danışman.",
  keywords: [
    "elektrikli araç",
    "EVOtoPilot",
    "gerçek menzil simülatörü",
    "yakıt tasarruf hesaplama",
    "şarj istasyonu haritası",
    "2026 ÖTV rehberi",
    "Togg T10F",
    "Togg T10X",
    "Tesla Model Y Juniper",
    "BYD Seal",
    "elektrikli araç fiyatları",
    "VoltScore",
    "ikinci el elektrikli araç batarya sağlığı",
  ],
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";

  // Yönetim paneli kendi kabuğunu kullanır
  if (pathname.startsWith("/admin")) {
    return (
      <html lang="tr">
        <body className="min-h-screen bg-neutral-100 antialiased">{children}</body>
      </html>
    );
  }

  let currentUser = null;
  let unread = 0;
  try {
    currentUser = await getCurrentUser();
    if (currentUser) {
      unread = await prisma.notification.count({
        where: { userId: currentUser.id, isRead: false },
      });
    }
  } catch (e) {
    console.error("Layout session read error:", e);
  }

  return (
    <html lang="tr">
      <body className="flex min-h-screen flex-col antialiased">
        <SessionProvider
          initialUser={
            currentUser && {
              id: currentUser.id,
              username: currentUser.username,
              name: currentUser.name,
              avatar: currentUser.avatar,
              role: currentUser.role,
            }
          }
          initialUnread={unread}
        >
          <Header />
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-0 pb-16 sm:px-4 lg:pb-8">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
