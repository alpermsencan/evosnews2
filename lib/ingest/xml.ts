/**
 * Bağımlılıksız, küçük XML yardımcıları.
 *
 * RSS 2.0 ve Atom beslemeleri düz yapılıdır; tam bir XML parser'ı projeye
 * eklemek yerine ihtiyacımız olan alanları çıkaran dar kapsamlı yardımcılar
 * yeterli. Karmaşık/iç içe XML için uygun DEĞİLDİR.
 */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#39": "'",
  "#039": "'",
  "#8217": "’",
  "#8216": "‘",
  "#8220": "“",
  "#8221": "”",
  "#8211": "–",
  "#8212": "—",
  "#8230": "…",
};

export function decodeEntities(input: string) {
  return input
    .replace(/&(#x[0-9a-f]+);/gi, (_, h: string) =>
      String.fromCodePoint(parseInt(h.slice(2), 16)),
    )
    .replace(/&(#\d+);/g, (m, d: string) => {
      const named = ENTITIES[d];
      if (named) return named;
      const code = Number(d.slice(1));
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    })
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);
}

/** HTML etiketlerini söker, boşlukları normalleştirir. */
export function stripHtml(input: string) {
  return decodeEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapCdata(value: string) {
  const m = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return m ? m[1] : value;
}

/** `<item>…</item>` / `<entry>…</entry>` bloklarını ayırır. */
export function extractBlocks(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[\\s>][\\s\\S]*?<\\/${tag}>|<${tag}>[\\s\\S]*?<\\/${tag}>`, "gi");
  return xml.match(re) ?? [];
}

/** Bloktaki ilk `<tag>` içeriğini döndürür (CDATA çözülmüş, entity decode edilmiş). */
export function tagText(block: string, ...tags: string[]): string {
  for (const tag of tags) {
    const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = block.match(re);
    if (m?.[1]) {
      const value = decodeEntities(unwrapCdata(m[1])).trim();
      if (value) return value;
    }
  }
  return "";
}

/** `<tag attr="…" />` biçimindeki öz-kapanan etiketten öznitelik okur. */
export function tagAttr(block: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${attr}\\s*=\\s*["']([^"']+)["']`, "i");
  return decodeEntities(block.match(re)?.[1] ?? "").trim();
}

/** Atom `<link rel="alternate" href="…"/>` ve RSS `<link>…</link>` ikisini de kapsar. */
export function linkOf(block: string): string {
  const plain = tagText(block, "link");
  if (plain && /^https?:\/\//i.test(plain)) return plain;
  const href = tagAttr(block, "link", "href");
  return href;
}

/** RSS `pubDate` / Atom `published|updated` → Date (geçersizse null). */
export function dateOf(block: string): Date | null {
  const raw = tagText(block, "pubDate", "published", "updated", "dc:date");
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}
