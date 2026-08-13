"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * İlan moderasyon eylemleri.
 *
 * Yayınla / reddet / vitrine al / sil tek satırda toplanır. Reddedilen ilan
 * SİLİNMEZ: satıcı ilanlarım sayfasında durumunu görebilsin diye kayıt kalır.
 */
export default function ListingRowActions({
  id,
  status,
  isSponsored,
}: {
  id: string;
  status: string;
  isSponsored: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "İşlem başarısız");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("İlan kalıcı olarak silinecek. Onaylıyor musunuz?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Silinemedi");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-1">
        {status !== "PUBLISHED" && (
          <Btn onClick={() => patch({ status: "PUBLISHED" })} busy={busy} tone="volt">
            YAYINLA
          </Btn>
        )}
        {status !== "REJECTED" && (
          <Btn onClick={() => patch({ status: "REJECTED" })} busy={busy} tone="evos">
            REDDET
          </Btn>
        )}
        <Btn onClick={() => patch({ isSponsored: !isSponsored })} busy={busy} tone="neutral">
          {isSponsored ? "VİTRİNDEN ÇIKAR" : "VİTRİNE AL"}
        </Btn>
        <Btn onClick={remove} busy={busy} tone="neutral">
          SİL
        </Btn>
      </div>
      {error && <span className="text-[10px] font-bold text-evos">{error}</span>}
    </div>
  );
}

function Btn({
  onClick,
  busy,
  tone,
  children,
}: {
  onClick: () => void;
  busy: boolean;
  tone: "volt" | "evos" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    volt: "bg-volt text-white hover:bg-volt-dark",
    evos: "bg-evos/10 text-evos hover:bg-evos/20",
    neutral: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`rounded px-2 py-1 text-[10px] font-black transition disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
