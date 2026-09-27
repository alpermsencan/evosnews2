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
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:text-neutral-950 transition hover:bg-neutral-100"
    >
      <IconBell className="h-5 w-5" />
      {user && unread > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
