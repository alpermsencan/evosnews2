"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { useSession } from "./SessionProvider";
import { IconUser } from "@/components/ui/Icons";

/** Header'daki giriş butonu / oturum açıksa profil menüsü */
export default function UserMenu() {
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user)
    return (
      <Link
        href="/giris"
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-black/25 px-2.5 text-sm font-bold text-white transition hover:bg-black/40 sm:h-10 sm:px-4"
      >
        <IconUser className="h-4 w-4 sm:h-5 sm:w-5" />
        <span>GİRİŞ</span>
      </Link>
    );

  const items = [
    { href: `/profil/${user.username}`, label: "Profilim" },
    { href: "/akis", label: "Akışım" },
    { href: "/arkadaslar", label: "Arkadaşlarım" },
    { href: "/reels/yeni", label: "Reel Yükle" },
    { href: "/hesabim", label: "Hesap Ayarları" },
    { href: "/hesabim/kaydedilenler", label: "Kaydedilenler" },
    { href: "/bildirimler", label: "Bildirimler" },
  ];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((s) => !s)}
        aria-label="Hesap menüsü"
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-md bg-black/25 px-1.5 pr-2.5 transition hover:bg-black/40 sm:h-10"
      >
        <Avatar src={user.avatar} name={user.name} size="xs" />
        <span className="hidden max-w-28 truncate text-sm font-bold text-white sm:inline">
          {user.name.split(" ")[0]}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
          <Link
            href={`/profil/${user.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 transition hover:bg-neutral-50"
          >
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-black text-neutral-900">
                {user.name}
              </span>
              <span className="truncate text-[11px] text-neutral-400">
                @{user.username}
              </span>
            </span>
          </Link>

          <ul className="flex flex-col py-1">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-bold text-neutral-600 transition hover:bg-neutral-50 hover:text-evos"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push("/");
              router.refresh();
            }}
            className="w-full border-t border-neutral-100 px-4 py-3 text-left text-sm font-black text-evos transition hover:bg-red-50"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      )}
    </div>
  );
}
