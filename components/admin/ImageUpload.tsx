"use client";

import { useId, useRef, useState, useEffect } from "react";

function Preview({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={hasError ? "/arac-placeholder.svg" : src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setHasError(true)}
    />
  );
}

/** Tek görsel alanı: Doğrudan bilgisayardan dosya seçimi ve yükleme önceliklidir */
export default function ImageUpload({
  value,
  onChange,
  folder = "evos/araclar",
  placeholder = "https://example.com/gorsel.jpg",
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
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Galeri yöneticisinden ana görsel seçildiğinde üst form otomatik güncellensin
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ url: string }>;
      if (customEvent.detail?.url) {
        onChange(customEvent.detail.url);
      }
    };
    window.addEventListener("vehicle-image-changed", handler);
    return () => window.removeEventListener("vehicle-image-changed", handler);
  }, [onChange]);

  const handleFiles = async (files: FileList | File[] | null) => {
    const list = Array.from(files ?? []).filter((f) => f.size > 0);
    if (list.length === 0) return;

    setBusy(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("files", list[0]);
      fd.append("file", list[0]);
      if (folder) fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Görsel yüklenemedi");
      }

      const uploadedUrl =
        (Array.isArray(data.images) && data.images[0]?.url) ||
        data.url ||
        "";

      if (!uploadedUrl) {
        throw new Error("Yükleme başarılı ancak görsel adresi alınamadı.");
      }

      onChange(uploadedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Görsel Yükleme & Önizleme Alanı */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Önizleme Kutusu */}
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-100 shadow-sm flex items-center justify-center">
          {value ? (
            <>
              <Preview src={value} alt="Kapak görseli önizleme" />
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                KAPAK
              </span>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400 gap-1 p-2 text-center">
              <span className="text-xl">📷</span>
              <span className="text-[10px] font-bold">GÖRSEL SEÇİLMEDİ</span>
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/85 text-[11px] font-black text-neutral-900 gap-1.5">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
              <span>YÜKLENİYOR...</span>
            </div>
          )}
        </div>

        {/* Dosya Seçim & Yükleme Butonları */}
        <div className="flex flex-1 flex-col gap-2.5 w-full">
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
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border-2 border-dashed p-4 transition ${
              dragOver
                ? "border-emerald-500 bg-emerald-50"
                : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <label
                htmlFor={inputId}
                className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-neutral-800 transition"
              >
                <span>📁 Bilgisayardan Görsel Seç</span>
              </label>
              <span className="text-xs text-neutral-500 hidden md:inline">
                veya buraya sürükleyip bırakın
              </span>
            </div>

            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-bold text-red-600 hover:text-red-800 transition px-2 py-1 hover:bg-red-50 rounded"
              >
                Görseli Kaldır
              </button>
            )}

            <input
              id={inputId}
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
              disabled={busy}
            />
          </div>

          {/* İsteğe bağlı: Web URL girişi */}
          <div className="flex flex-col gap-1.5">
            {!showUrlInput && !value?.startsWith("http") ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[11px] font-bold text-neutral-500 hover:text-neutral-900 transition self-start flex items-center gap-1"
              >
                <span>🔗 İsteğe bağlı: Web URL&apos;si ile eklemek için tıklayın</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-neutral-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowUrlInput(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 px-1"
                  title="Kapat"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <span className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
