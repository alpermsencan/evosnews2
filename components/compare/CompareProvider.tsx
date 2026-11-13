"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

/**
 * KARŞILAŞTIRMA SEPETİ
 *
 * Kullanıcı araçları farklı sayfalarda gezerek seçer (katalog, ilanlar,
 * araç merkezi), sonra tek ekranda karşılaştırır. Seçim bu yüzden sayfa
 * geçişlerinde YAŞAMAK zorunda: `localStorage`'da tutulur, sunucuya gitmez.
 *
 * Sepette iki tür bir arada durabilir — katalogdaki SIFIR model ile
 * pazaryerindeki İKİNCİ EL ilan. "Sıfır mı ikinci el mi alsam" sorusu bu
 * karşılaştırmanın asıl sebebidir, dolayısıyla türleri ayırmak yanlış olurdu.
 */

export type CompareKind = "vehicle" | "listing";
export type CompareItem = { kind: CompareKind; slug: string };

const KEY = "evos-compare";
export const MAX_COMPARE = 4;

type Ctx = {
  items: CompareItem[];
  has: (kind: CompareKind, slug: string) => boolean;
  toggle: (kind: CompareKind, slug: string) => void;
  remove: (kind: CompareKind, slug: string) => void;
  clear: () => void;
  full: boolean;
  ready: boolean;
};

const CompareContext = createContext<Ctx | null>(null);

function read(raw: string | null): CompareItem[] {
  try {
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.slug === "string" && (x.kind === "vehicle" || x.kind === "listing"))
      .slice(0, MAX_COMPARE);
  } catch {
    // Bozuk/eski biçimdeki kayıt sepeti çökertmesin.
    return [];
  }
}

let memory: string | null = null;
let storageUnavailable = false;
function snapshot() { if (storageUnavailable) return memory; try { return localStorage.getItem(KEY); } catch { return memory; } }
function subscribe(callback: () => void) {
  const changed = (event: StorageEvent) => { if (event.key === KEY || event.key === null) callback(); };
  window.addEventListener("storage", changed);
  window.addEventListener("evos-compare-change", callback);
  return () => { window.removeEventListener("storage", changed); window.removeEventListener("evos-compare-change", callback); };
}

export default function CompareProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  const items = useMemo(() => read(raw), [raw]);
  const persist = useCallback((next: CompareItem[]) => {
    memory = JSON.stringify(next);
    try { localStorage.setItem(KEY, memory); storageUnavailable = false; } catch { storageUnavailable = true; }
    window.dispatchEvent(new Event("evos-compare-change"));
  }, []);

  const has = useCallback(
    (kind: CompareKind, slug: string) =>
      items.some((i) => i.kind === kind && i.slug === slug),
    [items],
  );

  const toggle = useCallback(
    (kind: CompareKind, slug: string) => {
      const exists = items.some((i) => i.kind === kind && i.slug === slug);
      if (exists) {
        persist(items.filter((i) => !(i.kind === kind && i.slug === slug)));
        return;
      }
      if (items.length >= MAX_COMPARE) return;
      persist([...items, { kind, slug }]);
    },
    [items, persist],
  );

  const remove = useCallback(
    (kind: CompareKind, slug: string) =>
      persist(items.filter((i) => !(i.kind === kind && i.slug === slug))),
    [items, persist],
  );

  const clear = useCallback(() => persist([]), [persist]);

  const value = useMemo<Ctx>(
    () => ({ items, has, toggle, remove, clear, full: items.length >= MAX_COMPARE, ready }),
    [items, has, toggle, remove, clear, ready],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    return {
      items: [],
      has: () => false,
      toggle: () => {},
      remove: () => {},
      clear: () => {},
      full: false,
      ready: true,
    };
  }
  return ctx;
}
