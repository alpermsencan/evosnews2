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
    <header className="sticky top-0 z-50 w-full select-none shadow-sm">
      {/* 1. ANA SAHNE: LOGO BÖLÜMÜ VE TURKUAZ BAND (PREMIUM TURQUOISE & OBSIDIAN GLASS) */}
      <div className="relative bg-gradient-to-r from-[#031d28] via-[#08384d] to-[#031d28] border-b border-cyan-500/25 backdrop-blur-xl shadow-lg">
        {/* Turkuaz Ortam Işıması (Ambient Turquoise Glow) */}
        <div className="pointer-events-none absolute -top-12 left-8 w-80 h-28 bg-cyan-400/20 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute -top-12 right-12 w-64 h-28 bg-teal-500/15 blur-3xl rounded-full" />

        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-3 sm:px-4">
          {/* Sol Kolon: Hamburger Menü + Logo + Turkuaz Yan Band */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setOpenMenu(true)}
              aria-label="Menüyü aç"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-cyan-400/30 text-white transition active:scale-95 cursor-pointer"
            >
              <IconMenu className="h-6 w-6 text-cyan-200" />
            </button>

            {/* Modern Logo */}
            <Logo size="md" showTagline={true} theme="dark" />

            {/* Dikey Turkuaz Ayrım Bandı */}
            <div className="hidden lg:block h-7 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent mx-1" />

            {/* Logonun Yanındaki Turkuaz Band / Rozet */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-[11px] font-black tracking-wider text-cyan-200 uppercase shadow-xs shadow-cyan-500/15">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
              </span>
              <span>2026 ELEKTRİKLİ MOBİLİTE</span>
            </div>
          </div>

          {/* Orta Kolon: Gelişmiş Komut & Arama Kapsülü (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg mx-4">
            <form
              onSubmit={submitSearch}
              className="group relative flex w-full items-center rounded-full bg-white/[0.07] hover:bg-white/[0.12] focus-within:bg-white/[0.15] border border-cyan-400/30 focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-400/30 px-3.5 py-2 transition-all shadow-inner"
            >
              <IconSearch className="h-4 w-4 shrink-0 text-cyan-300 group-focus-within:text-cyan-200 transition-colors" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, marka, batarya, şarj istasyonu veya haber ara..."
                className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-white placeholder:text-cyan-100/60 outline-none font-medium"
              />
              <kbd className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/30 text-[10px] font-mono font-bold text-cyan-200">
                Ara ↵
              </kbd>
            </form>
          </div>

          {/* Sağ Kolon: Hızlı Aksiyonlar, Bildirim & Kullanıcı Menüsü */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hızlı Aksiyon: İlan Ver Butonu (Turkuaz Gradyan) */}
            <Link
              href="/ilanlar/yeni"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <span>⚡</span>
              <span>İlan Ver</span>
            </Link>

            {/* Mobil Arama Tetikleyici Butonu */}
            <button
              onClick={() => setOpenSearch((s) => !s)}
              aria-label="Arama yap"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-cyan-400/30 text-cyan-200 transition lg:hidden"
            >
              {openSearch ? (
                <IconClose className="h-5 w-5 text-white" />
              ) : (
                <IconSearch className="h-5 w-5 text-cyan-300" />
              )}
            </button>

            {/* Bildirim Zili */}
            <div className="flex items-center justify-center rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-cyan-400/30 transition">
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
            className="flex items-center gap-2 border-t border-cyan-500/30 bg-[#042433] px-3.5 py-3 lg:hidden"
          >
            <div className="flex flex-1 items-center rounded-xl bg-white/[0.1] border border-cyan-400/30 px-3 py-2 text-white">
              <IconSearch className="h-4 w-4 shrink-0 text-cyan-300" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, şarj, haber veya marka ara..."
                className="w-full bg-transparent px-2.5 text-sm text-white placeholder:text-cyan-100/60 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-cyan-400 hover:bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 transition active:scale-95"
            >
              Ara
            </button>
          </form>
        )}
      </div>

      {/* 2. KATEGORİ & NAVİGASYON ŞERİDİ (DOLUBATARYA BEYAZ ŞERİT & TURKUAZ VURGU) */}
      <nav
        className={`bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] transition-all duration-300 ${
          scrolled ? "shadow-md border-[#E0E0E0]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-2 sm:px-4">
          {/* Yatay Navigasyon Linkleri */}
          <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap py-1.5 w-full lg:w-auto">
            {TOP_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href + item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-xs"
                        : "text-[#1F1F1F] hover:text-cyan-700 hover:bg-cyan-50/70"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sağ Kolon: Hızlı Araçlar */}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-400/40 text-xs font-black text-cyan-800 hover:bg-cyan-500 hover:text-slate-950 transition"
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
