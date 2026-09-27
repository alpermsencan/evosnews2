"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import Logo from "@/components/ui/Logo";
import NotificationBell from "@/components/user/NotificationBell";
import UserMenu from "@/components/user/UserMenu";
import { TOP_NAV } from "@/lib/nav";
import {
  IconClose,
  IconMenu,
  IconSearch,
} from "@/components/ui/Icons";

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
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
    <header className="sticky top-0 z-50 w-full select-none shadow-xs">
      {/* 1. ANA SAHNE: LOGO & KONTROL MERKEZİ (DOLUBATARYA BEYAZ & CAM STİLİ: #FFFFFF, #1F1F1F, #05C46C, #F4F4F4) */}
      <div className="relative bg-white/95 backdrop-blur-md border-b border-[#EAEAEA]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-3 sm:px-4">
          {/* Sol Kolon: Hamburger Menü + Modern Logo + Sürüm Rozeti */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setOpenMenu(true)}
              aria-label="Menüyü aç"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F4F4] hover:bg-[#EAEAEA] border border-[#EAEAEA] text-[#1F1F1F] transition active:scale-95 cursor-pointer"
            >
              <IconMenu className="h-6 w-6 text-[#1F1F1F]" />
            </button>

            {/* Modern Logo (DoluBatarya Teması) */}
            <Logo size="md" showTagline={true} theme="light" />

            {/* Platform Rozeti */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#DDFFF0] border border-[#05C46C]/30 text-[10px] font-black tracking-widest text-[#05C46C] uppercase shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#05C46C] animate-pulse"></span>
              <span>2026 EDITION</span>
            </div>
          </div>

          {/* Orta Kolon: Gelişmiş Komut & Arama Kapsülü (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg mx-4">
            <form
              onSubmit={submitSearch}
              className="group relative flex w-full items-center rounded-full bg-[#F4F4F4] hover:bg-[#EAEAEA] focus-within:bg-white border border-[#EAEAEA] focus-within:border-[#05C46C] focus-within:ring-2 focus-within:ring-[#05C46C]/20 px-3.5 py-2 transition-all shadow-xs"
            >
              <IconSearch className="h-4 w-4 shrink-0 text-[#888888] group-focus-within:text-[#05C46C] transition-colors" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, marka, batarya, şarj istasyonu veya haber ara..."
                className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-[#1F1F1F] placeholder:text-[#888888] outline-none font-medium"
              />
              <kbd className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-white border border-[#EAEAEA] text-[10px] font-mono font-bold text-[#656565]">
                Ara ↵
              </kbd>
            </form>
          </div>

          {/* Sağ Kolon: Hızlı Aksiyonlar, Bildirim & Kullanıcı Menüsü */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hızlı Aksiyon: İlan Ver Butonu (DoluBatarya Green #05C46C) */}
            <Link
              href="/ilanlar/yeni"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#05C46C] hover:bg-[#08B565] text-white font-black text-xs shadow-xs transition active:scale-95"
            >
              <span>⚡</span>
              <span>İlan Ver</span>
            </Link>

            {/* Mobil Arama Tetikleyici Butonu */}
            <button
              onClick={() => setOpenSearch((s) => !s)}
              aria-label="Arama yap"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F4F4] hover:bg-[#EAEAEA] border border-[#EAEAEA] text-[#1F1F1F] transition lg:hidden"
            >
              {openSearch ? (
                <IconClose className="h-5 w-5 text-[#1F1F1F]" />
              ) : (
                <IconSearch className="h-5 w-5 text-[#1F1F1F]" />
              )}
            </button>

            {/* Bildirim Zili */}
            <div className="flex items-center justify-center rounded-xl bg-[#F4F4F4] hover:bg-[#EAEAEA] border border-[#EAEAEA] transition">
              <NotificationBell />
            </div>

            {/* Kullanıcı Menüsü */}
            <UserMenu />
          </div>
        </div>

        {/* Mobil Arama Açılır Paneli */}
        {openSearch && (
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-2 border-t border-[#EAEAEA] bg-white px-3.5 py-3 lg:hidden"
          >
            <div className="flex flex-1 items-center rounded-xl bg-[#F4F4F4] border border-[#EAEAEA] px-3 py-2 text-[#1F1F1F]">
              <IconSearch className="h-4 w-4 shrink-0 text-[#888888]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, şarj, haber veya marka ara..."
                className="w-full bg-transparent px-2.5 text-sm text-[#1F1F1F] placeholder:text-[#888888] outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#05C46C] hover:bg-[#08B565] px-4 py-2 text-xs font-black text-white transition active:scale-95"
            >
              Ara
            </button>
          </form>
        )}
      </div>

      {/* 2. KATEGORİ & NAVİGASYON ŞERİDİ (DOLUBATARYA RENKLERİ VE STİLİ: #FFFFFF, #1F1F1F, #05C46C, #F4F4F4) */}
      <nav
        className={`bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] transition-all duration-300 ${
          scrolled ? "shadow-md border-[#E0E0E0]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-2 sm:px-4">
          {/* Yatay Navigasyon Linkleri (DoluBatarya Teması) */}
          <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap py-1.5 w-full lg:w-auto">
            {TOP_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href + item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 ${
                      active
                        ? "bg-[#05C46C] text-white hover:bg-[#08B565] shadow-xs"
                        : "text-[#1F1F1F] hover:text-[#05C46C] hover:bg-[#F4F4F4]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sağ Kolon: Hızlı Araçlar (DoluBatarya Renk Paleti) */}
          <div className="hidden lg:flex items-center gap-2 py-1.5">
            <Link
              href="/karsilastirma/araba"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-[#1F1F1F] bg-[#F4F4F4] hover:bg-[#EAEAEA] border border-[#EAEAEA] transition"
            >
              <span>⚖</span>
              <span>Karşılaştır</span>
            </Link>

            <Link
              href="/ai-danisman"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DDFFF0] border border-[#05C46C]/30 text-xs font-black text-[#05C46C] hover:bg-[#05C46C] hover:text-white transition"
            >
              <span className="text-xs">✨</span>
              <span>AI Danışman</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Yan Menü (Sidebar Drawer) */}
      <Sidebar open={openMenu} onClose={() => setOpenMenu(false)} />
    </header>
  );
}
