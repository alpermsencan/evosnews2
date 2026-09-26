"use client";

import { useRef, useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/Icons";

export default function CardRail({
  children,
  itemClass = "w-[78%] sm:w-[46%] lg:w-[31%]",
  autoPlay = false,
  autoPlayInterval = 4000,
}: {
  children: React.ReactNode[];
  itemClass?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  useEffect(() => {
    if (!autoPlay || isHovered) return;

    const interval = setInterval(() => {
      const el = ref.current;
      if (!el) return;

      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 15;
      if (isAtEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, isHovered, autoPlayInterval]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
