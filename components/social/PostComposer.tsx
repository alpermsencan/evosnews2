"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import Avatar from "@/components/user/Avatar";
import { useSession } from "@/components/user/SessionProvider";
import { IconClose, IconPlay, IconPlus } from "@/components/ui/Icons";
import { uploadMemberImages } from "@/lib/uploadClient";
import { VISIBILITY_OPTIONS, type SocialPost } from "./types";

/**
 * Gönderi oluşturma kutusu.
 * `articleId` verildiğinde paylaşım o habere iliştirilir (haber sayfasından
 * "bu haberi paylaş" akışı).
 */
export default function PostComposer({
  onCreated,
  articleId,
  articleTitle,
  placeholder,
}: {
  onCreated?: (post: SocialPost) => void;
  articleId?: string;
  articleTitle?: string;
  placeholder?: string;
}) {
  const { user } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!user)
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-neutral-300 bg-white p-5">
        <p className="text-sm font-bold text-neutral-700">
          Toplulukla bir şey paylaşmak ister misin?
        </p>
        <p className="text-[13px] text-neutral-500">
          Menzil deneyimini, şarj notlarını veya araç yorumunu paylaşmak için
          üye girişi yap.
        </p>
        <Link
          href="/giris?devam=/akis"
          className="mt-1 rounded-md bg-evos px-5 py-2 text-[13px] font-black text-white transition hover:bg-evos-dark"
        >
          GİRİŞ YAP
        </Link>
      </div>
    );

  const pickImages = async (files: FileList | null) => {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;
    if (images.length + list.length > 4) {
      setError("En fazla 4 görsel ekleyebilirsin");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const urls = await uploadMemberImages(list, "post");
      setImages((prev) => [...prev, ...urls].slice(0, 4));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text && images.length === 0) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "text",
          body: text,
          images,
          visibility,
          articleId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Paylaşılamadı");

      setBody("");
      setImages([]);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
      onCreated?.(data.post);

      // Aynı sayfadaki akış listesi yeni gönderiyi anında başa alsın
      window.dispatchEvent(
        new CustomEvent("evos:post-created", { detail: data.post })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Paylaşılamadı");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar src={user.avatar} name={user.name} size="sm" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          rows={body.length > 90 ? 4 : 2}
          placeholder={
            placeholder ??
            `${user.name.split(" ")[0]}, bugün elektrikli tarafında ne oldu?`
          }
          className="min-h-[52px] flex-1 resize-none rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[15px] leading-relaxed outline-none transition focus:border-evos focus:bg-white"
        />
      </div>

      {articleTitle && (
        <div className="flex items-center gap-2 rounded-md bg-neutral-50 px-3 py-2 text-[12px] font-bold text-neutral-500">
          <span className="rounded bg-evos px-1.5 py-0.5 text-[9px] font-black text-white">
            HABER
          </span>
          <span className="line-clamp-1">{articleTitle}</span>
        </div>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src) => (
            <span key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-20 w-20 rounded-md bg-neutral-100 object-cover"
              />
              <button
                type="button"
                onClick={() => setImages((p) => p.filter((i) => i !== src))}
                aria-label="Görseli kaldır"
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white"
              >
                <IconClose className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        <label
          className={`flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-black transition ${
            uploading
              ? "text-neutral-400"
              : "text-neutral-600 hover:border-evos hover:text-evos"
          }`}
        >
          <IconPlus className="h-3.5 w-3.5" />
          {uploading ? "YÜKLENİYOR..." : "GÖRSEL"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void pickImages(e.target.files)}
          />
        </label>

        <Link
          href="/reels/yeni"
          className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-[12px] font-black text-neutral-600 transition hover:border-evos hover:text-evos"
        >
          <IconPlay className="h-3.5 w-3.5" />
          REEL
        </Link>

        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-[12px] font-bold text-neutral-600 outline-none focus:border-evos"
        >
          {VISIBILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <span className="ml-auto flex items-center gap-3">
          {done && (
            <span className="text-[11px] font-black text-volt">PAYLAŞILDI</span>
          )}
          <span className="text-[11px] font-bold text-neutral-300">
            {body.length}/2000
          </span>
          <button
            type="submit"
            disabled={busy || uploading || (!body.trim() && images.length === 0)}
            className="rounded-md bg-evos px-5 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark disabled:opacity-40"
          >
            {busy ? "..." : "PAYLAŞ"}
          </button>
        </span>
      </div>

      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </form>
  );
}
