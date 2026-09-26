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
      <p className="text-sm text-neutral-600 max-w-md mb-6">
        Sunucu verilerine erişilirken geçici bir sorun meydana geldi. Lütfen tekrar deneyin.
      </p>
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
