"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { IconPlay, IconPlus } from "@/components/ui/Icons";
import { uploadMemberVideo, type UploadedVideoResult } from "@/lib/uploadClient";
import { VISIBILITY_OPTIONS } from "./types";

type LinkOption = { id: string; label: string };

/**
 * Reel yükleme formu.
 * Video önce Cloudinary'ye yüklenir (kapak görseli ve süre oradan gelir),
 * ardından gönderi kaydı oluşturulur.
 */
export default function ReelComposer({
  articles,
  vehicles,
}: {
  articles: LinkOption[];
  vehicles: LinkOption[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [video, setVideo] = useState<UploadedVideoResult | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [articleId, setArticleId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setError("");
    setLocalPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const result = await uploadMemberVideo(file);
      setVideo(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video yüklenemedi");
      setLocalPreview(null);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) {
      setError("Önce bir video yükle");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "reel",
          body: caption.trim(),
          videoUrl: video.url,
          posterUrl: video.posterUrl,
          durationSec: video.durationSec,
          visibility,
          articleId: articleId || undefined,
          vehicleId: vehicleId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reel paylaşılamadı");

      router.push(`/reels?id=${data.post.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reel paylaşılamadı");
      setBusy(false);
    }
  };

  const isVertical = video ? video.height >= video.width : true;

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]"
    >
      {/* Önizleme */}
      <div className="flex flex-col gap-3">
        <div className="relative flex aspect-[9/16] w-full items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900">
          {localPreview || video ? (
            <video
              src={video?.url ?? localPreview ?? undefined}
              poster={video?.posterUrl}
              controls
              playsInline
              muted
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-neutral-500">
              <IconPlay className="h-10 w-10" />
              <span className="text-[12px] font-bold">Önizleme burada</span>
            </span>
          )}

          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/70 text-[12px] font-black text-white">
              YÜKLENİYOR...
            </span>
          )}
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-3 text-[12px] font-black text-white transition hover:bg-evos">
          <IconPlus className="h-4 w-4" />
          {video ? "BAŞKA VİDEO SEÇ" : "VİDEO SEÇ"}
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => void pick(e.target.files)}
          />
        </label>

        <p className="text-[11px] leading-relaxed text-neutral-400">
          MP4, MOV veya WEBM · en fazla 80 MB. En iyi sonuç için dikey (9:16)
          çekim ve 15–60 saniye uzunluk önerilir.
        </p>

        {video && !isVertical && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
            Bu video yatay görünüyor. Reels akışında kenarlarda boşluk kalacak.
          </p>
        )}
      </div>

      {/* Ayarlar */}
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-black tracking-wide text-neutral-500">
            AÇIKLAMA
          </span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Ne anlatıyorsun? #togg #menzil gibi etiketler ekleyebilirsin."
            className="resize-none rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[14px] leading-relaxed outline-none transition focus:border-evos focus:bg-white"
          />
          <span className="self-end text-[11px] font-bold text-neutral-300">
            {caption.length}/2000
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-black tracking-wide text-neutral-500">
            KİMLER GÖREBİLİR
          </span>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="rounded-md border border-neutral-200 px-3 py-2.5 text-[13px] font-bold text-neutral-700 outline-none focus:border-evos"
          >
            {VISIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} — {o.hint}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">
              HABERE BAĞLA (opsiyonel)
            </span>
            <select
              value={articleId}
              onChange={(e) => setArticleId(e.target.value)}
              className="rounded-md border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 outline-none focus:border-evos"
            >
              <option value="">Seçilmedi</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-black tracking-wide text-neutral-500">
              ARACA BAĞLA (opsiyonel)
            </span>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="rounded-md border border-neutral-200 px-3 py-2.5 text-[13px] text-neutral-700 outline-none focus:border-evos"
            >
              <option value="">Seçilmedi</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <span className="rounded-md bg-red-50 px-3 py-2 text-[12px] font-bold text-evos">
            {error}
          </span>
        )}

        <button
          type="submit"
          disabled={busy || uploading || !video}
          className="rounded-md bg-evos px-6 py-3 text-[13px] font-black text-white transition hover:bg-evos-dark disabled:opacity-40"
        >
          {busy ? "PAYLAŞILIYOR..." : "REEL'İ PAYLAŞ"}
        </button>
      </div>
    </form>
  );
}
