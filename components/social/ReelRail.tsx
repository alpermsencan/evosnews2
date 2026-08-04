import Link from "next/link";
import { IconPlay } from "@/components/ui/Icons";
import type { SocialPost } from "./types";

/** Anasayfa / akış kenarındaki yatay reel şeridi (sunucu bileşeni) */
export default function ReelRail({
  reels,
  title = "REELS",
  href = "/reels",
}: {
  reels: SocialPost[];
  title?: string;
  href?: string;
}) {
  if (reels.length === 0) return null;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-black tracking-wide text-neutral-800">
          <IconPlay className="h-4 w-4 text-evos" />
          {title}
        </h2>
        <Link
          href={href}
          className="text-[11px] font-black text-evos hover:underline"
        >
          TÜMÜ
        </Link>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto">
        {reels.map((r) => (
          <Link
            key={r.id}
            href={`/reels?id=${r.id}`}
            className="group relative flex aspect-[9/16] w-[120px] shrink-0 items-end overflow-hidden rounded-lg bg-neutral-900"
          >
            {r.posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.posterUrl}
                alt={r.body || "Reel"}
                className="absolute inset-0 h-full w-full object-cover opacity-85 transition group-hover:scale-105 group-hover:opacity-100"
              />
            )}
            <span className="relative z-10 flex w-full flex-col gap-0.5 bg-gradient-to-t from-black/85 to-transparent p-2">
              <span className="line-clamp-2 text-[10px] font-bold leading-tight text-white">
                {r.body || r.author.name}
              </span>
              <span className="text-[9px] font-black text-white/60">
                @{r.author.username}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
