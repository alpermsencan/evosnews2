"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AvatarUpload from "./AvatarUpload";
import { useSession } from "./SessionProvider";

const INPUT =
  "rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none transition focus:border-evos";
const LABEL = "text-[11px] font-black tracking-wide text-neutral-500";

type Initial = {
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  website: string | null;
  twitter: string | null;
};

/** Hesap ayarları: profil bilgileri + şifre değişimi */
export default function ProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const { refresh } = useSession();

  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [avatar, setAvatar] = useState(initial.avatar ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [website, setWebsite] = useState(initial.website ?? "");
  const [twitter, setTwitter] = useState(initial.twitter ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOkMsg("");
    try {
      const payload: Record<string, unknown> = {
        name,
        username,
        avatar,
        bio,
        city,
        website,
        twitter,
      };
      if (newPassword) {
        payload.newPassword = newPassword;
        payload.currentPassword = currentPassword;
      }

      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");

      setOkMsg("Profilin güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-5 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>PROFİL FOTOĞRAFI</span>
        <AvatarUpload value={avatar} name={name} onChange={setAvatar} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>AD SOYAD *</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>KULLANICI ADI *</span>
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className={INPUT}
          />
          <span className="text-[11px] text-neutral-400">
            Profil adresin: /profil/{username || "kullaniciadi"}
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>E-POSTA</span>
          <input
            value={initial.email}
            disabled
            className={`${INPUT} bg-neutral-50 text-neutral-400`}
          />
          <span className="text-[11px] text-neutral-400">
            E-posta adresi değiştirilemez
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>ŞEHİR</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="İstanbul"
            className={INPUT}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>WEB SİTESİ</span>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
            className={INPUT}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LABEL}>X / TWITTER</span>
          <input
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="kullaniciadi"
            className={INPUT}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className={LABEL}>HAKKIMDA</span>
          <textarea
            rows={3}
            maxLength={300}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendinden kısaca bahset..."
            className={`${INPUT} resize-y`}
          />
          <span className="text-[11px] text-neutral-400">
            {bio.length}/300 karakter
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
        <span className="text-sm font-black text-neutral-800">
          Şifre Değiştir
        </span>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={LABEL}>MEVCUT ŞİFRE</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={INPUT}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={LABEL}>YENİ ŞİFRE</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="En az 6 karakter"
              className={INPUT}
            />
          </label>
        </div>
        <span className="text-[11px] text-neutral-400">
          Şifreni değiştirmek istemiyorsan bu alanları boş bırak.
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm font-bold text-evos">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="rounded-md bg-green-50 px-4 py-2 text-sm font-bold text-volt-dark">
          {okMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-fit rounded-md bg-evos px-6 py-3 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
      >
        {loading ? "KAYDEDİLİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
      </button>
    </form>
  );
}
