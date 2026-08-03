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

export const metadata: Metadata = {
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

  const [tickers, breaking, currentUser] = await Promise.all([
    prisma.ticker.findMany({ orderBy: { order: "asc" } }),
    prisma.article.findMany({
      where: { OR: [{ isBreaking: true }, { isFeatured: true }] },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: { id: true, title: true, slug: true },
    }),
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
