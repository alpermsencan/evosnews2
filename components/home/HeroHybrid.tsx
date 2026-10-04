"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconBolt,
  IconSearch,
  IconSparkles,
  IconChevronRight,
  IconCar,
  IconTag,
} from "@/components/ui/Icons";
import { formatTL, timeAgo } from "@/lib/utils";

type Slide = {
  id: string;
  title: string;
  slug: string;
  spot: string;
  image: string;
  isVideo?: boolean;
  isBreaking?: boolean;
  publishedAt: Date | string;
  category?: { name: string; slug: string; color?: string };
};

export default function HeroHybrid({ slides }: { slides: Slide[] }) {
  const router = useRouter();
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Sol Panel Filtre State'leri
  const [budgetMax, setBudgetMax] = useState<number>(2500000);
  const [bodyType, setBodyType] = useState<string>("all");
  const [minRange, setMinRange] = useState<number>(400);

  const activeSlide = slides[activeSlideIdx] || slides[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (budgetMax) params.set("maxPrice", budgetMax.toString());
    if (bodyType !== "all") params.set("kasa", bodyType);
    if (minRange) params.set("minRange", minRange.toString());
    router.push(`/araclar?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* SOL PANEL: Akıllı EV Arama & Eşleştirme (5 Kolon) */}
        <div className="flex flex-col justify-between border-b border-neutral-200 bg-gradient-to-b from-[#091526] via-[#0B1E3F] to-[#0A1830] p-6 text-white lg:col-span-5 lg:border-b-0 lg:border-r">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <IconSparkles className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-black tracking-widest text-sky-400 uppercase">
                AKILLI ARAÇ EŞLEŞTİRİCİ
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl text-white leading-tight">
                Size En Uygun Elektrikli Modeli Keşfedin
              </h2>
              <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
                2026 Türkiye pazarındaki 180+ elektrikli aracı bütçenize, menzile ve ÖTV dilimine göre anında filtreleyin.
              </p>
            </div>

            {/* Arama & Filtre Formu */}
            <form onSubmit={handleSearchSubmit} className="mt-2 flex flex-col gap-3.5">
              {/* Bütçe Slider */}
              <div className="flex flex-col gap-1 rounded-xl bg-white/5 p-3 border border-white/10">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-neutral-300">MAKSİMUM BÜTÇE</span>
                  <span className="font-black text-sky-400">{formatTL(budgetMax)}</span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={6000000}
                  step={100000}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="accent-sky-400 my-1"
                />
                <div className="flex justify-between text-[9px] text-neutral-400">
                  <span>1.0 Mn ₺</span>
                  <span>2.5 Mn ₺ (%10 ÖTV)</span>
                  <span>6.0+ Mn ₺</span>
                </div>
              </div>

              {/* Kasa Tipi ve Minimum Menzil */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral-300 uppercase">
                    Kasa Tipi
                  </label>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-400"
                  >
                    <option value="all" className="bg-[#0B1E3F]">Tüm Tipler</option>
                    <option value="SUV" className="bg-[#0B1E3F]">SUV</option>
                    <option value="Sedan" className="bg-[#0B1E3F]">Sedan</option>
                    <option value="Hatchback" className="bg-[#0B1E3F]">Hatchback</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-neutral-300 uppercase">
                    Min. Menzil
                  </label>
                  <select
                    value={minRange}
                    onChange={(e) => setMinRange(Number(e.target.value))}
                    className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white outline-none focus:border-sky-400"
                  >
                    <option value={300} className="bg-[#0B1E3F]">300+ km</option>
                    <option value={400} className="bg-[#0B1E3F]">400+ km</option>
                    <option value={500} className="bg-[#0B1E3F]">500+ km</option>
                    <option value={600} className="bg-[#0B1E3F]">600+ km</option>
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-3 text-xs font-black text-white shadow-md transition hover:bg-sky-400 active:scale-[0.98]"
                >
                  <IconSearch className="h-4 w-4" /> UYGUN MODELLERİ BUL
                </button>
              </div>
            </form>
          </div>

          {/* Hızlı Etiketler */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-3">
            <span className="text-[10px] font-bold text-neutral-400">Trend:</span>
            {["Togg T10F", "Model Y", "BYD Seal", "Renault 5", "Kia EV3"].map((tag) => (
              <Link
                key={tag}
                href={`/araclar?q=${encodeURIComponent(tag)}`}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-sky-200 transition hover:bg-sky-500 hover:text-white"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* SAĞ PANEL: Manşet & Günün Flaş Gelişmesi (7 Kolon) */}
        <div className="relative flex flex-col justify-between bg-black lg:col-span-7">
          {activeSlide && (
            <Link
              href={`/haber/${activeSlide.slug}`}
              className="group relative block aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:h-[420px]"
            >
              <img
                src={activeSlide.image}
                alt={activeSlide.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5 sm:p-7">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm"
                    style={{ backgroundColor: activeSlide.category?.color || "#0284c7" }}
                  >
                    {activeSlide.category?.name || "GÜNDEM"}
                  </span>
                  <span className="text-[10px] font-bold text-white/70">
                    {timeAgo(activeSlide.publishedAt)}
                  </span>
                </div>

                <h3 className="text-lg font-black leading-snug text-white group-hover:text-sky-400 transition sm:text-2xl drop-shadow-md line-clamp-2">
                  {activeSlide.title}
                </h3>

                <p className="hidden text-xs text-white/80 line-clamp-2 sm:block leading-relaxed">
                  {activeSlide.spot}
                </p>
              </div>
            </Link>
          )}

          {/* Manşet Küçük Slider Dotları / Geçişleri */}
          {slides.length > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 bg-[#0B1E3F]/90 px-4 py-2.5 backdrop-blur">
              <div className="flex items-center gap-1.5">
                {slides.slice(0, 5).map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveSlideIdx(idx)}
                    aria-label={`${idx + 1}. haber`}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeSlideIdx
                        ? "w-6 bg-sky-400"
                        : "w-2 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-300">
                <span>{activeSlideIdx + 1} / {Math.min(5, slides.length)}</span>
                <Link
                  href="/kategori/haber-merkezi"
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 ml-2"
                >
                  TÜM HABERLER <IconChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
