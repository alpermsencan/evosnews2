"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadMemberImages } from "@/lib/uploadClient";

/**
 * İlan görseli yükleyici.
 *
 * Panel bileşeni (`components/admin/ImageUpload`) klasör adını doğrudan
 * gönderir ve bu yalnızca yöneticiye açıktır. Üye yüklemelerinde klasör
 * İSTEMCİDEN alınmaz: sunucuya "amaç" gönderilir, klasörü ve dosya sınırını
 * sunucu belirler — aksi halde üye istediği klasöre yazabilirdi.
 */
export default function ListingImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    try {
      const [url] = await uploadMemberImages([files[0]], "listing");
      if (url) onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görsel yüklenemedi");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {value && (
          <div className="relative h-20 w-28 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
            <Image src={value} alt="İlan görseli" fill sizes="112px" className="object-cover" />
          </div>
        )}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="rounded-md bg-neutral-100 px-4 py-2 text-[12px] font-black text-neutral-700 transition hover:bg-neutral-200 disabled:opacity-60"
        >
          {busy ? "YÜKLENİYOR…" : value ? "GÖRSELİ DEĞİŞTİR" : "GÖRSEL YÜKLE"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-bold text-neutral-400 hover:text-evos"
          >
            KALDIR
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => pick(e.target.files)}
      />

      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
      <span className="text-[10px] text-neutral-400">
        Yüklemezseniz ilanda yer tutucu görsel kullanılır.
      </span>
    </div>
  );
}
