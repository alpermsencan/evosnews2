import Link from "next/link";
import type { ArticleCard } from "@/lib/queries";

export default function MostRead({ articles }: { articles: ArticleCard[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center gap-2 bg-evos-ink px-4 py-3">
        <span className="h-4 w-1.5 rounded-full bg-evos" />
        <h3 className="text-sm font-black tracking-wide text-white">
          EN ÇOK OKUNANLAR
        </h3>
      </div>
      <ol className="flex flex-col">
        {articles.map((a, i) => (
          <li key={a.id}>
            <Link
              href={`/haber/${a.slug}`}
              className="group flex items-start gap-3 border-b border-neutral-100 px-4 py-3 transition hover:bg-neutral-50 last:border-0"
            >
              <span className="w-6 shrink-0 text-xl font-black leading-none text-evos/30 group-hover:text-evos">
                {i + 1}
              </span>
              <span className="line-clamp-3 text-[13px] font-bold leading-snug text-neutral-800 transition group-hover:text-evos">
                {a.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
