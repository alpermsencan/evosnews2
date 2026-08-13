"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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

function read(): CompareItem[] {
  try {
    const raw = localStorage.getItem(KEY);
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

export default function CompareProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  // Sunucu render'ında localStorage yok; ilk okuma tamamlanana kadar
  // düğmeler "seçili" görünmesin diye hazır olma durumu tutulur.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);

    // Aynı siteyi iki sekmede açan kullanıcıda sepet ayrışmasın.
    const sync = (e: StorageEvent) => {
      if (e.key === KEY) setItems(read());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const persist = useCallback((next: CompareItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Depolama kotası dolu veya gizli sekmede kapalı olabilir; sepet o
      // oturumda bellekte çalışmaya devam eder.
    }
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
  if (!ctx) throw new Error("useCompare, CompareProvider içinde kullanılmalıdır");
  return ctx;
}
