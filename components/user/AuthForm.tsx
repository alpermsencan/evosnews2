"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";
import { safeReturnPath } from "@/lib/return-path";
import Logo from "@/components/ui/Logo";

const INPUT =
  "w-full rounded-xl border border-neutral-300 px-3.5 py-3 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const redirectUrl = safeReturnPath(params.get("next") || params.get("devam"));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        isRegister ? "/api/account/register" : "/api/account/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isRegister ? { email, password, name, username } : { email, password }
          ),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız");

      await refresh();
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-neutral-200 bg-white p-7 sm:p-9 shadow-xl ring-1 ring-black/5"
    >
      {/* e-aracım Logo & Başlık */}
      <div className="flex flex-col items-center text-center gap-3">
        <Logo size="lg" />
        <div className="flex flex-col gap-1 mt-1">
          <h1 className="text-xl font-black text-neutral-900">
            {isRegister ? "e-aracım'a Katılın" : "Tekrar Hoş Geldiniz"}
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-xs">
            {isRegister
              ? "Ücretsiz hesap oluşturarak ikinci el elektrikli araç ilanı verin, satıcılarla mesajlaşın ve topluluğa katılın."
              : "İlanlarınızı yönetmek, mesajlarınızı görüntülemek ve favorilerinize erişmek için giriş yapın."}
          </p>
        </div>
      </div>

      {isRegister && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-600">
              AD SOYAD *
            </span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ahmet Yılmaz"
              className={INPUT}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-600">
              KULLANICI ADI (İSTEĞE BAĞLI)
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="ahmetyilmaz"
              className={INPUT}
            />
            <span className="text-[10px] text-neutral-400">
              Boş bırakırsanız adınızdan otomatik üretilir.
            </span>
          </label>
        </>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-black tracking-wide text-neutral-600">
          {isRegister ? "E-POSTA ADRESİ *" : "E-POSTA VEYA KULLANICI ADI *"}
        </span>
        <input
          required
          type={isRegister ? "email" : "text"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@eposta.com"
          className={INPUT}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-black tracking-wide text-neutral-600">
          ŞİFRE *
        </span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={INPUT}
        />
        {isRegister && (
          <span className="text-[10px] text-neutral-400">En az 12 karakter</span>
        )}
      </label>

      {isRegister && (
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            required
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="text-[11px] leading-tight text-neutral-500">
            <Link
              href="/yasal/uyelik-sozlesmesi"
              target="_blank"
              className="font-bold text-neutral-700 hover:underline"
            >
              Üyelik Sözleşmesi
            </Link>{" "}
            ve{" "}
            <Link
              href="/yasal/kvkk"
              target="_blank"
              className="font-bold text-neutral-700 hover:underline"
            >
              KVKK Aydınlatma Metni
            </Link>
            &apos;ni okudum, kabul ediyorum.
          </span>
        </label>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 px-5 py-3.5 text-xs sm:text-sm font-black text-white transition hover:opacity-95 active:scale-95 shadow-md shadow-blue-500/20 disabled:opacity-60"
      >
        {loading
          ? "LÜTFEN BEKLEYİN..."
          : isRegister
          ? "ÜCRETSİZ HESAP OLUŞTUR"
          : "GİRİŞ YAP"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        {isRegister ? "Zaten bir hesabınız var mı? " : "Henüz hesabınız yok mu? "}
        <Link
          href={isRegister ? "/giris" : "/kayit"}
          className="font-black text-blue-600 hover:underline"
        >
          {isRegister ? "Giriş yapın" : "Ücretsiz kayıt olun"}
        </Link>
      </p>
    </form>
  );
}
