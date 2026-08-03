"use client";

import { useId, useRef, useState } from "react";
import Avatar from "./Avatar";
import { uploadToCloudinary } from "@/lib/uploadClient";

/** Üye avatarı: Cloudinary'ye yükler, mevcut URL'i de kabul eder */
export default function AvatarUpload({
  value,
  name,
  onChange,
}: {
  value: string;
  name: string;
  onChange: (url: string) => void;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const [url] = await uploadToCloudinary([file]);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar src={value || null} name={name || "?"} size="lg" />
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-evos">
              YÜKLENİYOR
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <label
              htmlFor={inputId}
              className="cursor-pointer rounded-md bg-neutral-900 px-4 py-2 text-[11px] font-black text-white transition hover:bg-evos"
            >
              {busy ? "YÜKLENİYOR..." : "FOTOĞRAF SEÇ"}
            </label>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-md border border-neutral-300 px-4 py-2 text-[11px] font-bold text-neutral-500 transition hover:border-evos hover:text-evos"
              >
                KALDIR
              </button>
            )}
          </div>
          <span className="text-[11px] text-neutral-400">
            JPG, PNG veya WEBP · en fazla 10 MB
          </span>
        </div>

        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </div>
  );
}
