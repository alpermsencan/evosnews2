import { NextResponse } from "next/server";

export function ok(data: unknown, init?: number) {
  return NextResponse.json(data as Record<string, unknown>, { status: init ?? 200 });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function handle<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return NextResponse.json(data as Record<string, unknown>);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sunucu hatası";
    console.error("[API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Sorgu parametrelerini sayıya çevirir */
export function num(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function slugify(text: string) {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}
