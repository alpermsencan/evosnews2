import { IconArrowDown, IconArrowUp } from "@/components/ui/Icons";

type TickerItem = {
  id: string;
  label: string;
  value: string;
  unit: string | null;
  changePct: number;
};

export default function TickerBar({ items }: { items: TickerItem[] }) {
  if (!items.length) return null;

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1280px] px-2 sm:px-4">
        <div className="no-scrollbar flex divide-x divide-neutral-200 overflow-x-auto">
          {items.map((t) => {
            const up = t.changePct >= 0;
            return (
              <div
                key={t.id}
                className="flex min-w-[46%] shrink-0 flex-col gap-0.5 px-3 py-2.5 sm:min-w-[24%] md:min-w-0 md:flex-1"
              >
                <span className="text-[11px] font-black tracking-wide text-neutral-500">
                  {t.label}
                </span>
                <span className="text-[17px] font-black leading-tight text-neutral-900 sm:text-lg">
                  {t.value}
                  {t.unit && (
                    <span className="ml-1 text-[11px] font-bold text-neutral-400">
                      {t.unit}
                    </span>
                  )}
                </span>
                <span
                  className={`mt-0.5 flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold text-white ${
                    up ? "bg-volt" : "bg-evos"
                  }`}
                >
                  {up ? (
                    <IconArrowUp className="h-2.5 w-2.5" />
                  ) : (
                    <IconArrowDown className="h-2.5 w-2.5" />
                  )}
                  {Math.abs(t.changePct).toLocaleString("tr-TR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
