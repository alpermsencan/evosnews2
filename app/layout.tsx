import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};
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
    default: "e-aracim.com · Elektrikli Araç Rehberi",
    template: "%s · e-aracim.com",
  },
  description:
    "Türkiye'nin lider elektrikli araç rehberi e-aracim.com: Güncel elektrikli otomobil modelleri, şarj istasyonları ve tarifeleri, menzil hesaplama, 2.el ilanlar ve rehber içerikler.",
  keywords: [
    "elektrikli araç",
    "e-aracım",
    "e-aracim.com",
    "elektrikli araç fiyatları",
    "şarj istasyonu haritası",
    "şarj fiyatları",
    "2026 ÖTV rehberi",
    "Togg T10F",
    "Togg T10X",
    "Tesla Model Y Juniper",
    "BYD",
    "ikinci el elektrikli araç",
    "ikinci el elektrikli otomobil",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
        <head>
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
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
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#070c18" />
      </head>
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
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-0 pb-16 sm:px-4 lg:pb-8 overflow-x-hidden sm:overflow-x-visible">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
        </SessionProvider>
      </body>
    </html>
  );
}
