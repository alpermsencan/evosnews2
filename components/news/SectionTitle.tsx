import Link from "next/link";
import { IconChevronRight } from "@/components/ui/Icons";

export default function SectionTitle({
  title,
  href,
  color = "#e30613",
  subtitle,
}: {
  title: string;
  href?: string;
  color?: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b-2 border-neutral-200 pb-2">
      <div className="flex min-w-0 flex-col">
        <h2 className="flex items-center gap-2 text-lg font-black tracking-tight text-neutral-900 sm:text-xl">
          <span
            className="h-5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 sm:text-sm">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-neutral-500 transition hover:text-evos sm:text-sm"
        >
          TÜMÜ
          <IconChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
