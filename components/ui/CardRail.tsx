"use client";

import { useRef } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/Icons";

export default function CardRail({
  children,
  itemClass = "w-[78%] sm:w-[46%] lg:w-[31%]",
}: {
  children: React.ReactNode[];
  itemClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClass}`}>
            {child}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll(-1)}
        aria-label="Sola kaydır"
        className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-lg transition hover:bg-evos hover:text-white lg:flex"
      >
        <IconChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Sağa kaydır"
        className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-lg transition hover:bg-evos hover:text-white lg:flex"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
