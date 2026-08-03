import Link from "next/link";

type Item = { id: string; title: string; slug: string };

export default function BreakingBar({ items }: { items: Item[] }) {
  if (!items.length) return null;
  const loop = [...items, ...items];

  return (
    <div className="flex w-full items-stretch overflow-hidden bg-evos-ink text-white">
      <div className="flex shrink-0 items-center gap-2 bg-evos px-3 py-2 text-[12px] font-black tracking-wide sm:px-4 sm:text-sm">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-white" />
        SON DAKİKA
      </div>
      <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {loop.map((item, i) => (
            <Link
              key={`${item.id}-${i}`}
              href={`/haber/${item.slug}`}
              className="flex items-center gap-3 px-5 text-[13px] font-semibold text-white/90 transition hover:text-white sm:text-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-volt" />
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
