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
    <header className="sticky top-0 z-50 w-full select-none">
      {/* 1. ÜST MİKRO TELEMETRİ & VERİ ŞERİDİ (PREMIUM STATUS BAR) */}
      <div className="hidden md:block bg-[#040711] border-b border-white/[0.06] text-[11px] text-slate-400 py-1.5 px-4">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          {/* Canlı Veri & Piyasa İndikatörü */}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              2026 CANLI VERİ
            </span>
            <span className="text-white/20">|</span>
            <span className="font-medium text-slate-300">
              <strong className="text-white font-bold">130+</strong> Model Kataloğu
            </span>
            <span className="text-white/20">·</span>
            <span className="font-medium text-slate-300">
              <strong className="text-white font-bold">8.420+</strong> Şarj Noktası
            </span>
            <span className="text-white/20">·</span>
            <span className="font-medium text-slate-300">
              Ort. WLTP Menzil: <strong className="text-cyan-400 font-bold">512 km</strong>
            </span>
          </div>

          {/* Hızlı Servis Linkleri */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link
              href="/otv-rehberi"
              className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
            >
              <span>📊</span>
              <span>ÖTV Rehberi</span>
            </Link>
            <Link
              href="/sarj-agi/rota"
              className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1"
            >
              <span>⚡</span>
              <span>Rota Planlayıcı</span>
            </Link>
            <Link
              href="/ai-danisman"
              className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-bold"
            >
              <span>✨</span>
              <span>AI Danışman</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ANA SAHNE: LOGO & KONTROL MERKEZİ (PREMIUM OBSIDIAN GLASS) */}
      <div className="relative bg-gradient-to-r from-[#060b17] via-[#0a1329] to-[#060b17] border-b border-white/[0.08] backdrop-blur-xl shadow-lg">
        {/* Ortam Işıması (Ambient Glow) */}
        <div className="pointer-events-none absolute -top-12 left-8 w-80 h-28 bg-cyan-500/15 blur-3xl rounded-full" />
        <div className="pointer-events-none absolute -top-12 right-12 w-64 h-28 bg-blue-600/10 blur-3xl rounded-full" />

        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-3 sm:px-4">
          {/* Sol Kolon: Hamburger Menü + Modern Logo + Sürüm Rozeti */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => setOpenMenu(true)}
              aria-label="Menüyü aç"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white transition active:scale-95 cursor-pointer"
            >
              <IconMenu className="h-6 w-6 text-slate-200" />
            </button>

            {/* Yeni Modern Logo */}
            <Logo size="md" showTagline={true} />

            {/* Platform Rozeti */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[10px] font-black tracking-widest text-cyan-300 uppercase shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>2026 EDITION</span>
            </div>
          </div>

          {/* Orta Kolon: Gelişmiş Komut & Arama Kapsülü (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md xl:max-w-lg mx-4">
            <form
              onSubmit={submitSearch}
              className="group relative flex w-full items-center rounded-full bg-white/[0.05] hover:bg-white/[0.08] focus-within:bg-white/[0.1] border border-white/[0.1] focus-within:border-cyan-400/70 focus-within:ring-2 focus-within:ring-cyan-500/20 px-3.5 py-2 transition-all shadow-inner"
            >
              <IconSearch className="h-4 w-4 shrink-0 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, marka, batarya, şarj istasyonu veya haber ara..."
                className="w-full bg-transparent px-2.5 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none font-medium"
              />
              <kbd className="hidden xl:inline-flex items-center px-2 py-0.5 rounded bg-white/[0.08] border border-white/[0.1] text-[10px] font-mono font-bold text-slate-400">
                Ara ↵
              </kbd>
            </form>
          </div>

          {/* Sağ Kolon: Hızlı Aksiyonlar, Bildirim & Kullanıcı Menüsü */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hızlı Aksiyon: İlan Ver Butonu */}
            <Link
              href="/ilanlar/yeni"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <span>⚡</span>
              <span>İlan Ver</span>
            </Link>

            {/* Mobil Arama Tetikleyici Butonu */}
            <button
              onClick={() => setOpenSearch((s) => !s)}
              aria-label="Arama yap"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white transition lg:hidden"
            >
              {openSearch ? (
                <IconClose className="h-5 w-5 text-slate-200" />
              ) : (
                <IconSearch className="h-5 w-5 text-cyan-400" />
              )}
            </button>

            {/* Bildirim Zili (Cam Daire İçinde) */}
            <div className="flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition">
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
            className="flex items-center gap-2 border-t border-white/[0.1] bg-[#070e1e] px-3.5 py-3 lg:hidden"
          >
            <div className="flex flex-1 items-center rounded-xl bg-white/[0.08] border border-white/[0.15] px-3 py-2 text-white">
              <IconSearch className="h-4 w-4 shrink-0 text-cyan-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Araç, şarj, haber veya marka ara..."
                className="w-full bg-transparent px-2.5 text-sm text-white placeholder:text-slate-400 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-400 active:scale-95"
            >
              Ara
            </button>
          </form>
        )}
      </div>

      {/* 3. MODERN NAVİGASYON ŞERİDİ (PREMIUM SLATE GLASS BAR) */}
      <nav
        className={`bg-[#080f22]/95 backdrop-blur-md border-b border-white/[0.08] transition-all duration-300 ${
          scrolled ? "shadow-xl shadow-black/40 border-cyan-500/20" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-2 sm:px-4">
          {/* Yatay Navigasyon Linkleri */}
          <ul className="no-scrollbar flex items-center gap-1.5 overflow-x-auto whitespace-nowrap py-1.5 w-full lg:w-auto">
            {TOP_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href + item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-200 ${
                      active
                        ? "text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-xs shadow-cyan-500/20"
                        : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Sağ Kolon: Hızlı Araçlar (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 py-1.5">
            <Link
              href="/karsilastirma/araba"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <span>⚖</span>
              <span>Karşılaştır</span>
            </Link>

            <Link
              href="/ai-danisman"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-[11px] font-black text-emerald-400 hover:text-emerald-300 transition"
            >
              <span className="animate-spin text-xs">✨</span>
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
