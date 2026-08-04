"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/user/SessionProvider";

export type FriendStatus = "self" | "none" | "outgoing" | "incoming" | "friends";

const LABEL: Record<FriendStatus, string> = {
  self: "",
  none: "ARKADAŞ EKLE",
  outgoing: "İSTEK GÖNDERİLDİ",
  incoming: "İSTEĞİ KABUL ET",
  friends: "ARKADAŞSINIZ",
};

/** Duruma göre gönderilecek eylem */
const ACTION: Record<FriendStatus, string> = {
  self: "",
  none: "request",
  outgoing: "cancel",
  incoming: "accept",
  friends: "remove",
};

/** Kullanıcının onayladığı yıkıcı işlemler */
const CONFIRM: Partial<Record<FriendStatus, string>> = {
  friends: "Arkadaşlıktan çıkarılsın mı?",
  outgoing: "Arkadaşlık isteği geri çekilsin mi?",
};

export default function FriendButton({
  username,
  initialStatus,
  initialCount,
  size = "md",
}: {
  username: string;
  initialStatus: FriendStatus;
  initialCount?: number;
  size?: "sm" | "md";
}) {
  const { user } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<FriendStatus>(initialStatus);
  const [count, setCount] = useState(initialCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (status === "self") return null;

  const run = async (action: string) => {
    if (!user) {
      router.push(`/giris?devam=/profil/${username}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${username}/friend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem yapılamadı");
      setStatus(data.status);
      setCount(data.friendCount);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem yapılamadı");
    } finally {
      setBusy(false);
    }
  };

  const click = () => {
    const question = CONFIRM[status];
    if (question && !window.confirm(question)) return;
    void run(ACTION[status]);
  };

  const pad = size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-5 py-2.5 text-[13px]";
  const tone =
    status === "friends" || status === "outgoing"
      ? "border border-neutral-300 text-neutral-600 hover:border-evos hover:text-evos"
      : status === "incoming"
      ? "bg-volt text-white hover:bg-volt-dark"
      : "bg-neutral-900 text-white hover:bg-evos";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button
          onClick={click}
          disabled={busy}
          className={`rounded-md font-black transition disabled:opacity-60 ${pad} ${tone}`}
        >
          {busy ? "..." : LABEL[status]}
        </button>

        {status === "incoming" && (
          <button
            onClick={() => void run("reject")}
            disabled={busy}
            className={`rounded-md border border-neutral-300 font-black text-neutral-500 transition hover:border-evos hover:text-evos disabled:opacity-60 ${pad}`}
          >
            REDDET
          </button>
        )}
      </div>

      {initialCount !== undefined && (
        <span className="text-center text-[11px] font-bold text-neutral-400">
          {count} arkadaş
        </span>
      )}
      {error && (
        <span className="text-center text-[11px] font-bold text-evos">
          {error}
        </span>
      )}
    </div>
  );
}
