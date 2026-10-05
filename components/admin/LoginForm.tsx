"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconBolt, IconLock, IconUser } from "@/components/ui/Icons";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("alperx");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giriş başarısız");

      const target = params.get("devam") || "/admin";
      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız");
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white p-7 shadow-2xl border border-neutral-200">
      {/* Üst Logo ve Başlık */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-sky-400 shadow-sm border border-neutral-800">
          <IconBolt className="h-6 w-6 text-sky-400" />
        </div>
        <div>
          <span className="text-xl font-black text-neutral-950 tracking-tight block leading-tight">
            e-aracım<span className="text-sky-600 font-black">.com</span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
            Güvenli Yönetici Paneli
          </span>
        </div>
      </div>

      <p className="text-xs text-neutral-500 leading-relaxed">
        Yönetim paneline erişmek için yetkili kimlik bilgilerinizi giriniz.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3.5 mt-1">
        {/* Kullanıcı Adı */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
            Kullanıcı Adı
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-neutral-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="alperx"
              className="w-full rounded-xl border border-neutral-300 pl-9 pr-3.5 py-2.5 text-sm font-semibold outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100"
            />
          </div>
        </div>

        {/* Şifre */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
            Şifre
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 text-neutral-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-300 pl-9 pr-12 py-2.5 text-sm font-semibold outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-xs font-bold text-neutral-400 hover:text-neutral-700"
            >
              {showPassword ? "Gizle" : "Göster"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-2.5 text-xs font-bold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-xl bg-neutral-950 hover:bg-black px-5 py-3 text-sm font-black text-white transition shadow-md disabled:opacity-60 active:scale-[0.99]"
        >
          {loading ? "GİRİŞ YAPILIYOR..." : "GÜVENLİ GİRİŞ YAP"}
        </button>
      </form>

      <div className="pt-2 border-t border-neutral-100 text-center">
        <span className="text-[10px] font-bold text-neutral-400">
          Tüm yönetici oturumları 256-bit şifrelenerek kayıt altına alınır.
        </span>
      </div>
    </div>
  );
}
