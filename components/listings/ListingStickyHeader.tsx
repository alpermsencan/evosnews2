"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconShare,
  IconClose,
  IconCheck,
} from "@/components/ui/Icons";

export default function ListingStickyHeader({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, []);

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareText = encodeURIComponent(`${title} — EVOtoPilot 2.El İlanı`);
  const encodedUrl = encodeURIComponent(pageUrl);

  return (
    <>
      {/* SAYFAYLA BİRLİKTE AŞAĞI İNEN SABİT ÜST SÜTUN (STICKY HEADER) */}
      <div className="sticky top-0 z-40 -mx-3 sm:mx-0 flex h-14 items-center justify-between border-b border-neutral-200 bg-white/95 px-4 backdrop-blur shadow-sm">
        {/* Sol: Geri götüren ok */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/ilanlar");
            }
          }}
          type="button"
          aria-label="Geri Dön"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-neutral-100 active:scale-95"
        >
          <IconArrowLeft className="h-6 w-6" />
        </button>

        {/* Orta: İlan Detayı yazısı */}
        <span className="text-base font-black tracking-tight text-neutral-900 truncate max-w-[200px] sm:max-w-md">
          İlan Detayı
        </span>

        {/* Sağ: Paylaşma butonu */}
        <button
          onClick={() => setShareOpen(true)}
          type="button"
          aria-label="İlanı Paylaş"
          className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-neutral-100 active:scale-95"
        >
          <IconShare className="h-5 w-5" />
        </button>
      </div>

      {/* PAYLAŞ BOTTOM SHEET (Arka sayfa kararmadan hafif/şeffaf arka planla açılır) */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Arka plan: Kararmayan, tıklanınca kapatan şeffaf alan */}
          <div
            onClick={() => setShareOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-[0.5px] transition-opacity"
          />

          {/* Ufak Bottom Sheet Paneli */}
          <div className="relative z-50 w-full max-w-lg mx-auto rounded-t-3xl border-t border-neutral-200 bg-white p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Tutamaç */}
            <div className="mx-auto -mt-2 mb-3 h-1 w-12 rounded-full bg-neutral-300" />

            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wide">
                İlanı Paylaş
              </h3>
              <button
                onClick={() => setShareOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* Paylaşım Butonları (Facebook, X, WhatsApp, E-posta) */}
            <div className="grid grid-cols-2 gap-2.5 my-4">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition active:scale-[0.98]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-sm">
                  💬
                </span>
                <span>WhatsApp</span>
              </a>

              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-xs font-black text-neutral-900 hover:bg-neutral-100 transition active:scale-[0.98]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white font-black text-xs">
                  𝕏
                </span>
                <span>X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs font-black text-blue-800 hover:bg-blue-100 transition active:scale-[0.98]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
                  f
                </span>
                <span>Facebook</span>
              </a>

              {/* E-posta */}
              <a
                href={`mailto:?subject=${shareText}&body=${encodedUrl}`}
                className="flex items-center gap-2.5 rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-xs font-black text-purple-800 hover:bg-purple-100 transition active:scale-[0.98]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-xs">
                  ✉
                </span>
                <span>E-posta</span>
              </a>
            </div>

            {/* Aşağısında küçük yazıyla sayfa linki ve kopyala */}
            <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] mt-2">
              <span className="truncate text-neutral-500 font-medium">
                {pageUrl || `/ilanlar/${slug}`}
              </span>
              <button
                onClick={handleCopyLink}
                type="button"
                className={`shrink-0 rounded-lg px-3 py-1 font-black transition ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-sky-600 text-white hover:bg-sky-700"
                }`}
              >
                {copied ? "Kopyalandı!" : "Linki Kopyala"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
