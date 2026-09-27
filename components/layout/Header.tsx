"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";
import NotificationBell from "@/components/user/NotificationBell";
import UserMenu from "@/components/user/UserMenu";
import { TOP_NAV } from "@/lib/nav";
import {
  IconClose,
  IconSearch,
} from "@/components/ui/Icons";

export default function Header() {
  const [openSearch, setOpenSearch] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (openSearch) inputRef.current?.focus();
  }, [openSearch]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpenSearch(false);
    router.push(`/ara?q=${encodeURIComponent(q.trim())}`);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full select-none bg-white">
      {/* 1. ANA BAŞLIK: LOGO & ARAMA (SADE, MODERN & PROFESYONEL) */}
      <div className="border-b border-neutral-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-3 sm:px-4">
          {/* Sol Kolon: Doğrudan Logo */}
          <div className="flex items-center shrink-0">
            <Logo size="md" theme="light" />
          </div>

          {/* Orta Kolon: Sade & Şık Arama Çubuğu (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg mx-2">
            <form
              onSubmit={submitSearch}
              className="group relative flex w-full items-center rounded-lg bg-neutral-100/80 hover:bg-neutral-100 focus-within:bg-white border border-neutral-200/90 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-100 px-3 py-1.5 transition-all"
            >
              <IconSearch className="h-4 w-4 shrink-0 text-neutral-400 group-focus-within:text-red-600 transition-colors" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, marka, batarya veya haber ara..."
                className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none font-medium"
              />
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded bg-neutral-200/70 text-[10px] font-mono font-semibold text-neutral-600">
                ⌘K
              </kbd>
            </form>
          </div>

          {/* Sağ Kolon: Aksiyonlar, Bildirim & Profil */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* İlan Ver Butonu: Lüks Siyah & Kırmızı Detay */}
            <Link
              href="/ilanlar/yeni"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-black hover:bg-neutral-900 text-white font-bold text-xs transition active:scale-95 shadow-xs border border-neutral-900 group"
            >
              <span className="text-red-500 font-black">+</span>
              <span>İlan Ver</span>
            </Link>

            {/* Mobil Arama Tetikleyici Butonu */}
            <button
              onClick={() => setOpenSearch((s) => !s)}
              aria-label="Arama yap"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100 transition lg:hidden"
            >
              {openSearch ? (
                <IconClose className="h-5 w-5" />
              ) : (
                <IconSearch className="h-5 w-5" />
              )}
            </button>

            {/* Bildirim Zili */}
            <NotificationBell />

            {/* Kullanıcı Menüsü */}
            <UserMenu />
          </div>
        </div>

        {/* Mobil Arama Açılır Paneli */}
        {openSearch && (
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-2 border-t border-neutral-200 bg-neutral-50 px-3.5 py-2.5 lg:hidden"
          >
            <div className="flex flex-1 items-center rounded-lg bg-white border border-neutral-200 focus-within:border-red-600 px-3 py-1.5 text-neutral-900">
              <IconSearch className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, şarj, haber veya marka ara..."
                className="w-full bg-transparent px-2 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-black hover:bg-neutral-900 px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95"
            >
              Ara
            </button>
          </form>
        )}
      </div>

      {/* 2. KATEGORİ & NAVİGASYON ŞERİDİ (LÜKS SİYAH & KIRMIZI DETAYLI) */}
      <nav
        className={`border-b border-neutral-200/80 bg-white transition-shadow duration-200 ${
          scrolled ? "shadow-xs" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-2 sm:px-4">
          {/* Yatay Navigasyon Linkleri */}
          <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap py-1 w-full lg:w-auto">
            {TOP_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href + item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`relative flex items-center px-3 py-2 rounded-md text-xs tracking-wider uppercase transition-colors ${
                      active
                        ? "text-neutral-950 font-black bg-neutral-100/70"
                        : "text-neutral-600 hover:text-red-600 font-bold hover:bg-neutral-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="absolute bottom-0 inset-x-2.5 h-[2px] bg-red-600 rounded-full" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sağ Kolon: Hızlı Araçlar */}
          <div className="hidden lg:flex items-center gap-2 py-1">
            <Link
              href="/karsilastirma/araba"
              className="px-2.5 py-1.5 rounded-md text-xs font-bold text-neutral-600 hover:text-red-600 hover:bg-neutral-100 transition"
            >
              Karşılaştır
            </Link>

            <Link
              href="/ai-danisman"
              className="px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 hover:text-red-600 border border-neutral-200/80 text-xs font-bold text-neutral-800 transition"
            >
              AI Danışman
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
