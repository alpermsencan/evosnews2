"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconBolt } from "@/components/ui/Icons";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("evos2026");
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doLogin = async (passToSubmit: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passToSubmit.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız");

      const target = params.get("devam") || "/admin";
      // Tarayıcı yönlendirmesi
      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(password);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200">
      <div className="flex items-center gap-2">
        <IconBolt className="h-7 w-7 text-sky-600" />
        <span className="text-2xl font-black text-neutral-900 tracking-tight">
          Evos<span className="text-neutral-400">Admin</span>
        </span>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Yönetim paneline erişmek için şifrenizi girin.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Yönetici şifresi"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-3 pr-10 text-sm font-semibold outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-xs font-bold text-neutral-400 hover:text-neutral-700"
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        </div>

        {error && (
          <span className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-200">
            {error}
          </span>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#0B1E3F] hover:bg-slate-900 px-5 py-3 text-sm font-black text-white transition shadow-md disabled:opacity-60"
        >
          {loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
        </button>

        <button
          type="button"
          onClick={() => {
            setPassword("evos2026");
            doLogin("evos2026");
          }}
          disabled={loading}
          className="rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 py-2.5 text-xs font-black text-sky-800 transition"
        >
          ⚡ Tek Tıkla Giriş Yap (evos2026)
        </button>
      </form>

      <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-100 text-center">
        <span className="text-[11px] font-bold text-neutral-500">
          Geçerli Parola: <strong className="text-neutral-800 font-black">evos2026</strong>
        </span>
      </div>
    </div>
  );
}
