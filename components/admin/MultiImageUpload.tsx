"use client";

import { useId, useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadClient";

/** Çoklu görsel alanı: mevcut URL'ler korunur, yenileri Cloudinary'ye yüklenir */
export default function MultiImageUpload({
  value,
  onChange,
  folder,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [manual, setManual] = useState("");

  const handleFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    setBusy(true);
    setError("");
    try {
      const urls = await uploadToCloudinary(list, folder);
      onChange([...value, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görseller yüklenemedi");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addManual = () => {
    const urls = manual
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (urls.length === 0) return;
    onChange([...value, ...urls]);
    setManual("");
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-md border border-neutral-300 bg-neutral-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Görsel ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-black text-white transition hover:bg-evos"
              >
                ✕
              </button>
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 px-1 py-0.5 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  className="px-1 text-[11px] font-black text-white"
                >
                  ‹
                </button>
                <span className="text-[10px] font-bold text-white">{i + 1}</span>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  className="px-1 text-[11px] font-black text-white"
                >
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
        className={`flex flex-wrap items-center gap-2 rounded-md border border-dashed px-3 py-2 transition ${
          dragOver ? "border-evos bg-red-50" : "border-neutral-300"
        }`}
      >
        <label
          htmlFor={inputId}
          className="cursor-pointer rounded bg-neutral-900 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-evos"
        >
          {busy ? "YÜKLENİYOR..." : "GÖRSEL EKLE"}
        </label>
        <span className="text-[11px] text-neutral-400">
          birden fazla seçebilir veya sürükleyip bırakabilirsiniz
        </span>
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addManual();
            }
          }}
          placeholder="Hazır URL yapıştır (virgülle birden fazla)"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-evos"
        />
        <button
          type="button"
          onClick={addManual}
          className="rounded-md border border-neutral-300 px-4 text-[11px] font-black text-neutral-600 transition hover:border-evos hover:text-evos"
        >
          EKLE
        </button>
      </div>

      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </div>
  );
}
