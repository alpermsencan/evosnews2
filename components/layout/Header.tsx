"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import NotificationBell from "@/components/user/NotificationBell";
import UserMenu from "@/components/user/UserMenu";
import { TOP_NAV } from "@/lib/nav";
import {
  IconBolt,
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
    <header className="sticky top-0 z-50 w-full">
      {/* Üst kırmızı bar */}
      <div className="bg-evos">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
          <button
            onClick={() => setOpenMenu(true)}
            aria-label="Menüyü aç"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white transition hover:bg-white/15"
          >
            <IconMenu className="h-7 w-7" />
          </button>

          <Link href="/" className="flex shrink-0 items-end gap-1.5 text-white">
            <IconBolt className="mb-1 h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-[26px] font-black leading-none tracking-tight sm:text-[32px]">
              Evos
            </span>
            <span className="hidden text-[26px] font-black leading-none tracking-tight text-white/75 sm:inline sm:text-[32px]">
              Gazete
            </span>
            <span className="mb-0.5 hidden text-[10px] font-semibold text-white/70 sm:inline">
              com.tr
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            {/* Masaüstü arama kutusu */}
            <form
              onSubmit={submitSearch}
              className="hidden items-center rounded-full bg-white/15 px-3 py-2 lg:flex lg:w-64 xl:w-80"
            >
              <IconSearch className="h-4 w-4 shrink-0 text-white/80" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Haber, araç veya istasyon ara..."
                className="w-full bg-transparent px-2 text-sm text-white outline-none placeholder:text-white/70"
              />
            </form>

            <button
              onClick={() => setOpenSearch((s) => !s)}
              aria-label="Ara"
              className="flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/15 lg:hidden"
            >
              {openSearch ? (
                <IconClose className="h-6 w-6" />
              ) : (
                <IconSearch className="h-6 w-6" />
              )}
            </button>

            <NotificationBell />
            <UserMenu />
          </div>
        </div>

        {/* Mobil arama açılır alanı */}
        {openSearch && (
          <form
            onSubmit={submitSearch}
            className="flex items-center gap-2 border-t border-white/20 px-3 py-2.5 lg:hidden"
          >
            <div className="flex flex-1 items-center rounded-full bg-white px-3 py-2">
              <IconSearch className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ne aramıştınız?"
                className="w-full bg-transparent px-2 text-sm text-neutral-800 outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-black/25 px-4 py-2 text-sm font-bold text-white"
            >
              Ara
            </button>
          </form>
        )}
      </div>

      {/* Beyaz kategori şeridi */}
      <nav
        className={`border-b border-neutral-200 bg-white transition-shadow ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-1 sm:px-4">
          <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto whitespace-nowrap py-0.5">
            {TOP_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href + item.label} className="shrink-0">
                  <Link
                    href={item.href}
                    className={`relative flex items-center px-3 py-3 text-[13px] font-extrabold tracking-tight transition sm:text-sm ${
                      active
                        ? "text-evos"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {item.label}
                    {active && (
                      <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t bg-evos" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <Sidebar open={openMenu} onClose={() => setOpenMenu(false)} />
    </header>
  );
}
