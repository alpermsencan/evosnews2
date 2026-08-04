"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Gönderi moderasyonu: yayından kaldır / geri al */
export default function PostRowActions({
  id,
  isHidden,
}: {
  id: string;
  isHidden: boolean;
}) {
  const router = useRouter();
  const [hidden, setHidden] = useState(isHidden);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isHidden: !hidden }),
      });
      if (res.ok) {
        setHidden((h) => !h);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={() => void toggle()}
      disabled={busy}
      className={`rounded-md px-3 py-1.5 text-[11px] font-black transition disabled:opacity-50 ${
        hidden
          ? "bg-neutral-900 text-white hover:bg-volt"
          : "border border-neutral-300 text-neutral-600 hover:border-evos hover:text-evos"
      }`}
    >
      {busy ? "..." : hidden ? "YAYINA AL" : "YAYINDAN KALDIR"}
    </button>
  );
}
