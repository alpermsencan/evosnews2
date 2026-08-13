"use client";

import Link from "next/link";
import { MAX_COMPARE, useCompare } from "./CompareProvider";

/**
 * Ekranın altında beliren karşılaştırma çubuğu.
 *
 * Sepette bir şey varsa görünür; kullanıcı hangi sayfada olursa olsun
 * seçiminin farkında olur ve tek tıkla karşılaştırma ekranına geçer.
 * Sepet boşken hiç render edilmez — boş bir çubuk mobilde ekranı yer.
 */
export default function CompareBar() {
  const { items, clear, remove, ready } = useCompare();

  if (!ready || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-3 py-2.5 shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.3)] backdrop-blur lg:px-6">
      {/* Mobil alt menü çubuğunun üstüne binmemesi için altta pay bırakılır. */}
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-3 pb-[env(safe-area-inset-bottom)]">
        <span className="text-[11px] font-black text-neutral-500">
          KARŞILAŞTIRMA ({items.length}/{MAX_COMPARE})
        </span>

        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {items.map((i) => (
            <li key={`${i.kind}-${i.slug}`}>
              <button
                type="button"
                onClick={() => remove(i.kind, i.slug)}
                className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-600 transition hover:bg-neutral-200"
                aria-label={`${i.slug} seçimini kaldır`}
              >
                <span className="max-w-[140px] truncate">{i.slug.replace(/-/g, " ")}</span>
                <span aria-hidden className="text-neutral-400">✕</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clear}
            className="text-[11px] font-bold text-neutral-400 transition hover:text-evos"
          >
            TEMİZLE
          </button>
          <Link
            href="/karsilastir"
            className="rounded-md bg-evos px-4 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark"
          >
            KARŞILAŞTIR
          </Link>
        </div>
      </div>
    </div>
  );
}
