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
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#1F1F1F] transition hover:bg-[#EAEAEA]"
    >
      <IconBell className="h-5 w-5" />
      {user && unread > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#05C46C] px-1 text-[9px] font-black text-white shadow-xs">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
