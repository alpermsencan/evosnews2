"use client";

import Link from "next/link";
import { useSession } from "./SessionProvider";
import { IconBell } from "@/components/ui/Icons";

/** Header zili; okunmamış bildirim varsa rozet gösterir */
export default function NotificationBell() {
  const { user, unread } = useSession();

  return (
    <Link
      href={user ? "/bildirimler" : "/giris?devam=/bildirimler"}
      aria-label="Bildirimler"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-cyan-300 hover:text-white transition hover:bg-white/[0.1]"
    >
      <IconBell className="h-5 w-5" />
      {user && unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-400 px-1 text-[9px] font-black text-slate-950 shadow-xs">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
