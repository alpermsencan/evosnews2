"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconClose, IconFilter, IconSearch, IconChevronRight } from "@/components/ui/Icons";
import { LISTING_CATEGORIES } from "@/lib/listingCategories";
import { CategoryIcon } from "./CategoryIcon";

export default function CategorySelectModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleProceed = () => {
    if (!selectedSlug) return;
    const cat = LISTING_CATEGORIES.find((c) => c.slug === selectedSlug);
    if (cat) {
      setIsOpen(false);
      router.push(`/ilanlar/${cat.slug}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
    }
  };

  return (
    <>
      {/* BİRLEŞTİRİLMİŞ ARAMA & FİLTRELER ÇUBUĞU */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="relative flex flex-1 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
          <IconSearch className="h-5 w-5 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsOpen(true);
            }}
            placeholder="İlanlar arasında model, marka veya il ara..."
            className="w-full bg-transparent px-2.5 text-sm font-semibold text-neutral-900 outline-none placeholder:text-neutral-400"
          />
        </div>

        {/* FİLTRELER BUTONU (TAM SAYFA AÇAR) */}
        <button
          onClick={() => setIsOpen(true)}
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-3 text-sm font-black text-white shadow-md transition hover:from-blue-700 hover:to-sky-700 active:scale-[0.99] shrink-0"
        >
          <IconFilter className="h-4 w-4" />
          <span>FİLTRELER</span>
          <IconChevronRight className="h-4 w-4 ml-1 opacity-80" />
        </button>
      </div>

      {/* TAM SAYFA KATEGORİ FİLTRE MODALI (Seçmeden İlerleme Olmayacak) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4 bg-[#0B1E3F] text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
                <IconFilter className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  2.EL İLAN FİLTRELERİ
                </h3>
                <p className="text-[11px] text-sky-200">
                  Lütfen devam etmek için bir araç kategorisi seçin
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition font-black"
            >
              ✕
            </button>
          </div>

          {/* Body: Kategori Seçim Alanı */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-4xl mx-auto w-full flex flex-col justify-between">
            <div className="flex flex-col gap-5">
              <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-xs font-bold text-sky-900 flex items-center gap-2">
                <span>ℹ️</span>
                <span>
                  İlanları filtrelemek ve sonuçları görüntülemek için öncelikle ilgilendiğiniz kategoriyi seçmeniz gerekmektedir.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {LISTING_CATEGORIES.map((cat) => {
                  const isSelected = selectedSlug === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setSelectedSlug(cat.slug)}
                      className={`group relative flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-sky-600 bg-sky-50/80 shadow-md ring-2 ring-sky-500/20"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/60"
                      }`}
                    >
                      <span className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl p-2.5 transition ${
                        isSelected ? "bg-sky-600 text-white shadow-sm" : "bg-neutral-100 text-neutral-700 group-hover:bg-sky-50 group-hover:text-sky-600"
                      }`}>
                        <CategoryIcon slug={cat.slug} className="h-7 w-7" />
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm sm:text-base font-black transition ${
                              isSelected ? "text-sky-900" : "text-neutral-900"
                            }`}
                          >
                            {cat.name}
                          </h4>
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs font-black transition ${
                              isSelected
                                ? "border-sky-600 bg-sky-600 text-white"
                                : "border-neutral-300 bg-white text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-neutral-500 font-medium line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alt İşlem Butonları (Seçilmeden İlerletmez) */}
            <div className="border-t border-neutral-200 pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <span className="text-xs font-bold text-neutral-500">
                {selectedSlug ? (
                  <span className="text-sky-700 font-black">
                    Seçilen Kategori: {LISTING_CATEGORIES.find((c) => c.slug === selectedSlug)?.name}
                  </span>
                ) : (
                  "Lütfen yukarıdan bir kategori seçin (Seçim zorunludur)"
                )}
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 sm:flex-initial rounded-xl border border-neutral-300 px-5 py-3 text-xs font-bold text-neutral-700 hover:bg-neutral-100"
                >
                  Vazgeç
                </button>

                <button
                  type="button"
                  disabled={!selectedSlug}
                  onClick={handleProceed}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-xs font-black text-white shadow-lg transition ${
                    selectedSlug
                      ? "bg-sky-600 hover:bg-sky-700 active:scale-[0.98] cursor-pointer"
                      : "bg-neutral-300 cursor-not-allowed opacity-60"
                  }`}
                >
                  <span>FİLTRELEMEYE DEVAM ET</span>
                  <IconChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
