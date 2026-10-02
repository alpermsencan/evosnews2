"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";
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
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  const redirectUrl =
    params.get("next") ||
    params.get("devam") ||
    "/hesabim";

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

  const handleSocialAuth = async (provider: "google" | "facebook") => {
    setSocialLoading(provider);
    setError("");
    try {
      const res = await fetch("/api/account/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${provider} ile bağlanılamadı`);

      await refresh();
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sosyal giriş yapılamadı");
    } finally {
      setSocialLoading(null);
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

      {/* SOSYAL GİRİŞ BUTONLARI (Google & Facebook) */}
      <div className="flex flex-col gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handleSocialAuth("google")}
          disabled={loading || !!socialLoading}
          className="flex items-center justify-center gap-3 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-xs font-black text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition active:scale-95 shadow-xs disabled:opacity-60"
        >
          {socialLoading === "google" ? (
            <span className="text-xs font-bold text-neutral-500">Google ile bağlanılıyor...</span>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google ile {isRegister ? "Kayıt Ol" : "Giriş Yap"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSocialAuth("facebook")}
          disabled={loading || !!socialLoading}
          className="flex items-center justify-center gap-3 w-full rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] px-4 py-3 text-xs font-black text-white transition active:scale-95 shadow-xs disabled:opacity-60"
        >
          {socialLoading === "facebook" ? (
            <span className="text-xs font-bold text-white/90">Facebook ile bağlanılıyor...</span>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook ile {isRegister ? "Kayıt Ol" : "Giriş Yap"}</span>
            </>
          )}
        </button>
      </div>

      {/* AYIRICI ÇİZGİ */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-neutral-200" />
        <span className="absolute bg-white px-3 text-[10px] font-black uppercase text-neutral-400 tracking-wider">
          VEYA E-POSTA İLE DEVAM ET
        </span>
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
          <span className="text-[10px] text-neutral-400">En az 6 karakter</span>
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
        disabled={loading || !!socialLoading}
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
