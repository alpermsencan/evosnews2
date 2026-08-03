"use client";

import { useId, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadClient";

function Preview({ src, alt }: { src: string; alt: string }) {
  return (
    // Admin önizlemesi: keyfi dış URL'ler olabildiği için next/image kullanmıyoruz
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.opacity = "0.25";
      }}
    />
  );
}

/** Tek görsel alanı: Cloudinary'ye yükle veya mevcut URL'i koru/yapıştır */
export default function ImageUpload({
  value,
  onChange,
  folder,
  placeholder = "https://...",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  placeholder?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const urls = await uploadToCloudinary([list[0]], folder);
      onChange(urls[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        {/* Mevcut görsel önizlemesi (picsum/unsplash dahil korunur) */}
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border border-neutral-300 bg-neutral-50">
          {value ? (
            <Preview src={value} alt="Görsel önizleme" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-neutral-300">
              GÖRSEL YOK
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[11px] font-black text-evos">
              YÜKLENİYOR
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-evos"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void handleFiles(e.dataTransfer.files);
            }}
            className={`flex flex-1 items-center gap-2 rounded-md border border-dashed px-3 py-2 transition ${
              dragOver ? "border-evos bg-red-50" : "border-neutral-300"
            }`}
          >
            <label
              htmlFor={inputId}
              className="cursor-pointer rounded bg-neutral-900 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-evos"
            >
              {busy ? "YÜKLENİYOR..." : "GÖRSEL YÜKLE"}
            </label>
            <span className="truncate text-[11px] text-neutral-400">
              veya sürükleyip bırakın
            </span>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="ml-auto text-[11px] font-bold text-neutral-400 transition hover:text-evos"
              >
                KALDIR
              </button>
            )}
            <input
              id={inputId}
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
            />
          </div>
        </div>
      </div>

      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </div>
  );
}
