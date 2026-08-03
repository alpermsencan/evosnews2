"use client";

import { useEffect } from "react";
import { useSession } from "./SessionProvider";

/** Bildirimler sayfası açıldığında tümünü okundu işaretler ve rozeti sıfırlar */
export default function MarkNotificationsRead({ unread }: { unread: number }) {
  const { setUnread } = useSession();

  useEffect(() => {
    if (unread === 0) return;
    fetch("/api/notifications", { method: "PUT" })
      .then(() => setUnread(0))
      .catch(() => {});
  }, [unread, setUnread]);

  return null;
}
