"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "./SessionProvider";
import { IconBolt } from "@/components/ui/Icons";

const INPUT =
  "rounded-md border border-neutral-300 px-3 py-3 text-sm outline-none transition focus:border-evos";

/** Giriş ve kayıt formu (aynı bileşen, mod'a göre) */
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
      router.push(params.get("devam") || `/profil/${data.user.username}`);
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
      className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <IconBolt className="h-7 w-7 text-evos" />
        <span className="text-2xl font-black text-neutral-900">
          Evos<span className="text-neutral-400">Gazete</span>
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-black text-neutral-900">
          {isRegister ? "Aramıza katıl" : "Tekrar hoş geldin"}
        </h1>
        <p className="text-sm text-neutral-500">
          {isRegister
            ? "Ücretsiz üye ol; haberlere yorum yap, beğen, kaydet ve kendi profilini oluştur."
            : "Yorum yapmak, beğenmek ve okuma listeni görmek için giriş yap."}
        </p>
      </div>

      {isRegister && (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">
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
            <span className="text-[11px] font-black tracking-wide text-neutral-500">
              KULLANICI ADI
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="ahmetyilmaz"
              className={INPUT}
            />
            <span className="text-[11px] text-neutral-400">
              Boş bırakırsan adından otomatik üretilir. 3-20 karakter, küçük harf,
              rakam ve _
            </span>
          </label>
        </>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-black tracking-wide text-neutral-500">
          {isRegister ? "E-POSTA *" : "E-POSTA VEYA KULLANICI ADI *"}
        </span>
        <input
          required
          type={isRegister ? "email" : "text"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={isRegister ? "ornek@eposta.com" : "ornek@eposta.com"}
          className={INPUT}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-black tracking-wide text-neutral-500">
          ŞİFRE *
        </span>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••"
          className={INPUT}
        />
        {isRegister && (
          <span className="text-[11px] text-neutral-400">En az 6 karakter</span>
        )}
      </label>

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
        {loading
          ? "LÜTFEN BEKLEYİN..."
          : isRegister
          ? "ÜCRETSİZ ÜYE OL"
          : "GİRİŞ YAP"}
      </button>

      <p className="text-center text-sm text-neutral-500">
        {isRegister ? "Zaten üye misin? " : "Henüz üye değil misin? "}
        <Link
          href={isRegister ? "/giris" : "/kayit"}
          className="font-black text-evos hover:underline"
        >
          {isRegister ? "Giriş yap" : "Ücretsiz üye ol"}
        </Link>
      </p>
    </form>
  );
}
