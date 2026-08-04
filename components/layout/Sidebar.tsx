"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SIDEBAR_GROUPS, QUICK_LINKS } from "@/lib/nav";
import {
  IconBolt,
  IconChevronRight,
  IconClose,
  IconUser,
} from "@/components/ui/Icons";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Karartma */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-[86%] max-w-[380px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {/* Sidebar başlık */}
        <div className="flex shrink-0 items-center justify-between bg-evos px-4 py-3.5 text-white">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-2xl font-black tracking-tight"
          >
            <IconBolt className="h-7 w-7 text-white" />
            <span>
              Evos<span className="text-white/70">Gazete</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Menüyü kapat"
            className="rounded-full p-1.5 transition hover:bg-white/20"
          >
            <IconClose className="h-6 w-6" />
          </button>
        </div>

        {/* Giriş bloğu */}
        <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-evos/10 text-evos">
            <IconUser className="h-5 w-5" />
          </div>
          <div className="flex flex-1 flex-col leading-tight">
            <span className="text-sm font-bold text-neutral-800">
              Evos hesabına giriş yap
            </span>
            <span className="text-xs text-neutral-500">
              Dijital garajın ve takip listen seni bekliyor
            </span>
          </div>
          <Link href="/giris">
            <button className="shrink-0 rounded-md bg-evos px-3 py-1.5 text-xs font-bold text-white transition hover:bg-evos-dark">
              GİRİŞ
            </button>
          </Link>
        </div>

        {/* Hızlı erişim */}
        <div className="grid shrink-0 grid-cols-3 gap-px border-b border-neutral-200 bg-neutral-200">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.href + q.label}
              href={q.href}
              onClick={onClose}
              className="flex flex-col items-center gap-1 bg-white px-1 py-3 text-[11px] font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-evos"
            >
              <IconBolt className="h-4 w-4 text-volt" />
              {q.label}
            </Link>
          ))}
        </div>

        {/* Menü grupları */}
        <nav className="flex-1 overflow-y-auto overscroll-contain pb-24">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.title} className="border-b border-neutral-200 py-2">
              <h3 className="px-4 pb-1 pt-2 text-[11px] font-bold tracking-[0.12em] text-neutral-400">
                {group.title}
              </h3>
              <ul className="flex flex-col">
                {group.items.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center gap-3 px-4 py-2.5 transition hover:bg-neutral-50"
                    >
                      <span className="h-6 w-[3px] shrink-0 rounded-full bg-neutral-200 transition group-hover:bg-evos" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="flex items-center gap-2 text-[15px] font-bold text-neutral-800 group-hover:text-evos">
                          {item.label}
                          {item.badge && (
                            <span className="rounded bg-volt px-1.5 py-px text-[9px] font-black text-white">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        {item.desc && (
                          <span className="truncate text-xs text-neutral-500">
                            {item.desc}
                          </span>
                        )}
                      </span>
                      <IconChevronRight className="h-4 w-4 shrink-0 text-neutral-300 group-hover:text-evos" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="px-4 py-5">
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-bold text-neutral-600 transition hover:border-evos hover:text-evos"
            >
              Yönetim Paneli
            </Link>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-neutral-400">
              © {new Date().getFullYear()} Evos Gazete · Elektrikli mobilite
              yayın platformu
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
}
