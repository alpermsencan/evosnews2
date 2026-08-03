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

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className="group flex items-start gap-3 border-b border-neutral-100 py-3 last:border-0"
      >
        <div className="relative h-[62px] w-[92px] shrink-0 overflow-hidden rounded bg-neutral-100">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="92px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-3 text-[13px] font-bold leading-snug text-neutral-800 transition group-hover:text-evos">
            {article.title}
          </h3>
          <span className="text-[11px] font-semibold text-neutral-400">
            {timeAgo(article.publishedAt)}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link
        href={href}
        className="group flex flex-col gap-3 border-b border-neutral-200 bg-white p-3 transition hover:bg-neutral-50 sm:flex-row sm:p-4"
      >
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded bg-neutral-100 sm:aspect-[4/3] sm:w-[220px] lg:w-[260px]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            sizes="(max-width:640px) 100vw, 260px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {article.isVideo && (
            <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-evos text-white">
              <IconPlay className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-black text-white"
              style={{ backgroundColor: article.category.color }}
            >
              {article.category.name.toUpperCase()}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-400">
              <IconClock className="h-3 w-3" />
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <h3 className="text-lg font-black leading-snug text-neutral-900 transition group-hover:text-evos sm:text-xl">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm text-neutral-600">{article.spot}</p>
          <div className="mt-auto flex items-center gap-3 pt-1 text-[11px] font-semibold text-neutral-400">
            {article.author?.name && <span>{article.author.name}</span>}
            <span className="flex items-center gap-1">
              <IconEye className="h-3 w-3" />
              {article.views.toLocaleString("tr-TR")}
            </span>
            <span>{article.readTime} dk okuma</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "wide") {
    return (
      <Link href={href} className="group relative block overflow-hidden rounded-lg">
        <div className="relative aspect-[16/10] w-full bg-neutral-200">
          <Image
            src={article.image}
            alt={article.title}
            fill
            priority={priority}
            sizes="(max-width:1024px) 100vw, 640px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-4">
          <span
            className="w-fit rounded px-2 py-0.5 text-[10px] font-black text-white"
            style={{ backgroundColor: article.category.color }}
          >
            {article.category.name.toUpperCase()}
          </span>
          <h3 className="text-lg font-black leading-tight text-white drop-shadow sm:text-2xl">
            {article.title}
          </h3>
          <p className="hidden text-sm text-white/75 sm:line-clamp-2">
            {article.spot}
          </p>
        </div>
      </Link>
    );
  }

  // grid & rail
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg">
      <Link href={href} className="relative block aspect-[16/9] w-full bg-neutral-100">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority={priority}
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 340px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span
          className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-black text-white"
          style={{ backgroundColor: article.category.color }}
        >
          {article.category.name.toUpperCase()}
        </span>
        {article.isVideo && (
          <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-evos text-white">
            <IconPlay className="h-4 w-4" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={href}>
          <h3 className="line-clamp-3 text-[15px] font-black leading-snug text-neutral-900 transition group-hover:text-evos">
            {article.title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
          {article.spot}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] font-semibold text-neutral-400">
          <span className="flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            {timeAgo(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <IconEye className="h-3 w-3" />
            {article.views.toLocaleString("tr-TR")}
          </span>
        </div>
      </div>
    </article>
  );
}
