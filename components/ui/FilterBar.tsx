"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type FilterField = {
  key: string;
  label: string;
  type: "select" | "number" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export default function FilterBar({
  fields,
  title = "FİLTRELE",
}: {
  fields: FilterField[];
  title?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = (key: string) => params.get(key) ?? "";

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const reset = () => router.push(pathname, { scroll: false });

  const activeCount = fields.filter((f) => current(f.key)).length;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 lg:hidden"
      >
        <span className="text-sm font-black text-neutral-800">
          {title}
          {activeCount > 0 && (
            <span className="ml-2 rounded bg-evos px-1.5 py-0.5 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </span>
        <span className="text-neutral-400">{open ? "−" : "+"}</span>
      </button>

      <div
        className={`${open ? "flex" : "hidden"} flex-col gap-3 border-t border-neutral-100 p-4 lg:flex lg:flex-row lg:flex-wrap lg:items-end lg:border-t-0`}
      >
        {fields.map((f) => (
          <label key={f.key} className="flex min-w-0 flex-1 flex-col gap-1 lg:min-w-[150px]">
            <span className="text-[11px] font-bold tracking-wide text-neutral-500">
              {f.label}
            </span>
            {f.type === "select" ? (
              <select
                value={current(f.key)}
                onChange={(e) => update(f.key, e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-evos"
              >
                <option value="">Tümü</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                defaultValue={current(f.key)}
                placeholder={f.placeholder}
                onBlur={(e) => update(f.key, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    update(f.key, (e.target as HTMLInputElement).value);
                }}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-evos"
              />
            )}
          </label>
        ))}

        <button
          onClick={reset}
          className="h-[38px] shrink-0 rounded-md border border-neutral-300 px-4 text-sm font-bold text-neutral-600 transition hover:border-evos hover:text-evos"
        >
          Temizle
        </button>
      </div>
    </div>
  );
}
