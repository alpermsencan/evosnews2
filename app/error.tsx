'use client';

import { useEffect } from "react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uygulama çalışma hatası:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-black mb-4">
        !
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-2">
        Sayfa Yüklenirken Bir Hata Oluştu
      </h2>
      <p className="text-sm text-neutral-600 max-w-md mb-4">
        Sunucu veya veritabanı yanıt verirken geçici bir sorun meydana geldi.
      </p>

      {error?.message && (
        <div className="mb-6 max-w-xl w-full rounded-xl bg-neutral-50 p-3.5 text-left border border-neutral-200">
          <p className="text-[11px] font-bold uppercase text-neutral-400 mb-1">Teknik Hata İletisi:</p>
          <p className="font-mono text-xs text-red-700 break-words">{error.message}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => reset()}
        className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
      >
        Sayfayı Yeniden Yükle
      </button>
    </div>
  );
}
