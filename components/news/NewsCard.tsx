import Image from "next/image";
import Link from "next/link";
import { IconClock, IconEye, IconPlay } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/utils";
import type { ArticleCard } from "@/lib/queries";

type Props = {
  article: ArticleCard;
  variant?: "grid" | "row" | "wide" | "compact" | "rail";
  priority?: boolean;
};

export default function NewsCard({
  article,
  variant = "grid",
  priority = false,
}: Props) {
  const href = `/haber/${article.slug}`;

  // 1. COMPACT VARYANTI (Yan Panel ve Kompakt Listeler)
  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex items-start gap-3 border-b border-neutral-100 py-3 last:border-0 transition"
      >
        <div className="relative h-[68px] w-[100px] shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200 shadow-2xs">
          <Image
            src={article.image || "/haber-placeholder.svg"}
            alt={article.title}
            fill
            sizes="100px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600">
              {article.category?.name || "Haber"}
            </span>
            <span className="text-[10px] text-neutral-300">·</span>
            <span className="text-[10px] font-semibold text-neutral-400">
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <h3 className="line-clamp-2 text-xs sm:text-[13px] font-black leading-snug text-neutral-900 transition group-hover:text-red-600">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  // 2. ROW VARYANTI (Yatay Liste Görünümü)
  if (variant === "row") {
    return (
      <Link
        href={href}
        className="group flex flex-col sm:flex-row gap-4 rounded-2xl border border-neutral-200/90 bg-white p-4 transition duration-200 hover:border-neutral-950 hover:shadow-md"
      >
        <div className="relative aspect-[16/10] w-full sm:w-[240px] lg:w-[280px] shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200">
          <Image
            src={article.image || "/haber-placeholder.svg"}
            alt={article.title}
            fill
            sizes="(max-width:640px) 100vw, 280px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {article.isVideo && (
            <span className="absolute bottom-2.5 left-2.5 flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-950/80 text-white backdrop-blur-xs shadow-xs">
              <IconPlay className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-black uppercase tracking-wider text-neutral-900 border border-neutral-200">
                <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                <span>{article.category?.name || "Özel Haber"}</span>
              </span>
              {article.sourceName && (
                <span className="text-[10px] font-bold text-neutral-500">
                  {article.sourceName}
                </span>
              )}
              <span className="text-[10px] font-semibold text-neutral-400">
                · {timeAgo(article.publishedAt)}
              </span>
            </div>
            {/* Slider Tarzı Net ve Güçlü Başlık */}
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug text-neutral-950 transition group-hover:text-red-600 line-clamp-2">
              {article.title}
            </h3>
            {article.spot && (
              <p className="line-clamp-2 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                {article.spot}
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3 pt-2 border-t border-neutral-150 text-[11px] font-semibold text-neutral-400">
            {article.author?.name && (
              <span className="text-neutral-700 font-bold">{article.author.name}</span>
            )}
            <span className="flex items-center gap-1">
              <IconEye className="h-3.5 w-3.5" />
              {article.views.toLocaleString("tr-TR")}
            </span>
            <span>{article.readTime} dk okuma</span>
          </div>
        </div>
      </Link>
    );
  }

  // 3. WIDE VARYANTI (Özel Analiz Öne Çıkan - Slider Stili Cam Kartlı & Doğal Görselli)
  if (variant === "wide") {
    return (
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl border border-neutral-200/80 bg-neutral-950 shadow-md transition hover:border-red-600"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={article.image || "/haber-placeholder.svg"}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width:1024px) 100vw, 680px"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          {/* Hafif Alttan Karartma (Görseli Asla Boğmaz) */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
        </div>

        {/* Slider Başlık Mimarisi: Yarı Saydam Kurumsal Cam Kapsül */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 z-10">
          <div className="rounded-xl sm:rounded-2xl bg-neutral-950/85 backdrop-blur-md border border-white/20 p-3.5 sm:p-4 shadow-xl transition group-hover:bg-neutral-950/95 group-hover:border-red-500/50">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-red-400">
                {article.category?.name || "ÖZEL ANALİZ"}
              </span>
              <span className="text-white/30 text-xs">·</span>
              <span className="text-[10px] font-semibold text-neutral-300">
                {timeAgo(article.publishedAt)}
              </span>
            </div>
            <h3 className="text-sm sm:text-lg lg:text-xl font-black text-white tracking-tight leading-snug group-hover:text-red-400 transition line-clamp-2">
              {article.title}
            </h3>
            {article.spot && (
              <p className="hidden sm:line-clamp-1 text-xs text-white/80 font-medium mt-1 leading-normal">
                {article.spot}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // 4. GRID & RAIL VARYANTI (Standart Kart Görünümü)
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-250 bg-white transition duration-200 hover:border-neutral-950 hover:shadow-md ring-1 ring-black/5">
      {/* Kapak Görseli: Karartmasız, Doğal ve Ferah */}
      <Link href={href} className="relative block aspect-[16/10] w-full overflow-hidden bg-neutral-100 border-b border-neutral-150">
        <Image
          src={article.image || "/haber-placeholder.svg"}
          alt={article.title}
          fill
          priority={priority}
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 340px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Kategori Etiketi */}
        <div className="absolute left-2.5 top-2.5 z-10">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-950/85 backdrop-blur-xs text-[9px] font-black uppercase tracking-wider text-white border border-white/20 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>{article.category?.name || "HABER"}</span>
          </span>
        </div>
        {article.isVideo && (
          <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950/85 text-white backdrop-blur-xs shadow-xs">
            <IconPlay className="h-3.5 w-3.5" />
          </span>
        )}
      </Link>

      {/* İçerik: Slider Tarzı Net, Kalın ve Kurumsal Başlık */}
      <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400">
            {article.sourceName && (
              <span className="font-bold text-neutral-700">{article.sourceName} ·</span>
            )}
            <span>{timeAgo(article.publishedAt)}</span>
          </div>

          <Link href={href}>
            <h3 className="line-clamp-2 text-xs sm:text-sm font-black tracking-tight leading-snug text-neutral-950 transition group-hover:text-red-600">
              {article.title}
            </h3>
          </Link>

          {article.spot && (
            <p className="line-clamp-2 text-[11px] sm:text-xs text-neutral-600 font-medium leading-relaxed mt-0.5">
              {article.spot}
            </p>
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-neutral-150 text-[10px] font-semibold text-neutral-400">
          <span className="truncate">{article.author?.name || "e-aracım"}</span>
          <span className="flex items-center gap-1 shrink-0">
            <IconEye className="h-3 w-3" />
            {article.views.toLocaleString("tr-TR")}
          </span>
        </div>
      </div>
    </article>
  );
}
