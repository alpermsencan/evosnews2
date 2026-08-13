"use client";

import { MAX_COMPARE, useCompare, type CompareKind } from "./CompareProvider";

/**
 * Kart üzerindeki "Karşılaştır" düğmesi.
 *
 * Sepet dolduğunda düğme devre dışı bırakılır ama SEÇİLİ olanlar tıklanabilir
 * kalır — yoksa kullanıcı dolu sepetten çıkarma yapamaz duruma düşerdi.
 */
export default function CompareButton({
  kind,
  slug,
  className = "",
}: {
  kind: CompareKind;
  slug: string;
  className?: string;
}) {
  const { has, toggle, full, ready } = useCompare();
  const selected = ready && has(kind, slug);
  const blocked = ready && full && !selected;

  return (
    <button
      type="button"
      onClick={() => toggle(kind, slug)}
      disabled={blocked}
      aria-pressed={selected}
      title={blocked ? `En fazla ${MAX_COMPARE} araç karşılaştırılabilir` : undefined}
      className={`rounded-md px-2.5 py-1.5 text-[11px] font-black transition disabled:cursor-not-allowed disabled:opacity-45 ${
        selected
          ? "bg-evos text-white"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      } ${className}`}
    >
      {selected ? "✓ KARŞILAŞTIRMADA" : "KARŞILAŞTIR"}
    </button>
  );
}
