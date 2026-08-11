import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TickerBar from "@/components/layout/TickerBar";
import BreakingBar from "@/components/layout/BreakingBar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import SessionProvider from "@/components/user/SessionProvider";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getBreakingBar, getTickers } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  // Göreli OG/twitter görsellerinin mutlak URL'e çevrilmesi için gerekli.
  metadataBase: new URL(siteUrl()),
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": `${siteUrl()}/feed.xml` },
  },
  title: {
    default: "Evos Gazete · Elektrikli Araç Haber Merkezi",
    template: "%s · Evos Gazete",
  },
  description:
    "Elektrikli araç haberleri, şarj ağı, ÖTV rehberi, fiyat analizi, ikinci el pazarı ve yapay zekâ destekli araç danışmanlığı.",
  keywords: [
    "elektrikli araç",
    "EV haber",
    "şarj istasyonu",
    "ÖTV",
    "Togg",
    "elektrikli araç fiyatları",
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

  // Şerit verileri her istekte okunduğu için önbellekli sorgulardan gelir;
  // içerik değişince revalidateTag anında tazeler (bkz. lib/revalidate.ts).
  const [tickers, breaking, currentUser] = await Promise.all([
    getTickers(),
    getBreakingBar(8),
    getCurrentUser(),
  ]);

  const unread = currentUser
    ? await prisma.notification.count({
        where: { userId: currentUser.id, isRead: false },
      })
    : 0;

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
          <BreakingBar items={breaking} />
          <TickerBar items={tickers} />
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
