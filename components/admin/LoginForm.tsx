"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconBolt } from "@/components/ui/Icons";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız");
      router.push(params.get("devam") || "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-xl"
    >
      <div className="flex items-center gap-2">
        <IconBolt className="h-7 w-7 text-evos" />
        <span className="text-2xl font-black text-neutral-900">
          Evos<span className="text-neutral-400">Admin</span>
        </span>
      </div>

      <p className="text-sm text-neutral-500">
        Yönetim paneline erişmek için şifrenizi girin.
      </p>

      <input
        type="password"
        required
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Yönetici şifresi"
        className="rounded-md border border-neutral-300 px-3 py-3 text-sm outline-none focus:border-evos"
      />

      {error && (
        <span className="rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-evos">
          {error}
        </span>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-evos px-5 py-3 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
      >
        {loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
      </button>

      <span className="text-center text-[11px] text-neutral-400">
        Varsayılan şifre: evos2026 (ADMIN_PASSWORD ile değiştirilebilir)
      </span>
    </form>
  );
}
