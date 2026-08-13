"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/user/SessionProvider";

/**
 * İlan favorileme.
 *
 * Durum iyimser güncellenir; istek başarısız olursa geri alınır. Giriş
 * yapmamış ziyaretçi tıkladığında giriş sayfasına DÖNÜŞ ADRESİYLE gönderilir,
 * böylece girişten sonra baktığı ilana geri döner.
 */
export default function FavoriteButton({
  listingId,
  slug,
  initial = false,
}: {
  listingId: string;
  slug: string;
  initial?: boolean;
}) {
  const { user } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!user) {
      router.push(`/giris?devam=${encodeURIComponent(`/ilanlar/${slug}`)}`);
      return;
    }

    const next = !favorited;
    setFavorited(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/favorite`, { method: "POST" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setFavorited(!!json.favorited);
    } catch {
      setFavorited(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={favorited}
      className={`rounded-md px-2.5 py-1.5 text-[11px] font-black transition disabled:opacity-60 ${
        favorited
          ? "bg-evos/10 text-evos"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {favorited ? "♥ FAVORİDE" : "♡ FAVORİLE"}
    </button>
  );
}
