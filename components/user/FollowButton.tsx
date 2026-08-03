"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";

/** Profil sayfasındaki takip et / takiptesin butonu */
export default function FollowButton({
  username,
  initialFollowing,
  initialFollowers,
}: {
  username: string;
  initialFollowing: boolean;
  initialFollowers: number;
}) {
  const { user } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    if (!user) {
      router.push(`/giris?devam=/profil/${username}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem yapılamadı");
      setFollowing(data.following);
      setFollowers(data.followers);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem yapılamadı");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={toggle}
        disabled={busy}
        className={`rounded-md px-5 py-2.5 text-[13px] font-black transition disabled:opacity-60 ${
          following
            ? "border border-neutral-300 text-neutral-600 hover:border-evos hover:text-evos"
            : "bg-evos text-white hover:bg-evos-dark"
        }`}
      >
        {busy ? "..." : following ? "TAKİPTESİN" : "TAKİP ET"}
      </button>
      <span className="text-center text-[11px] font-bold text-neutral-400">
        {followers} takipçi
      </span>
      {error && (
        <span className="text-center text-[11px] font-bold text-evos">{error}</span>
      )}
    </div>
  );
}
