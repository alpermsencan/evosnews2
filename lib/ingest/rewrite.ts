import { fetchWithRetry } from "./http";
import { decodeEntities, stripHtml } from "./xml";

/**
 * HABER YENİDEN YAZIMI
 *
 * Agregatör kuralı: kaynağın metni asla kopyalanmaz. Bu katman orijinal
 * haberden yalnızca OLGULARI (kim, ne, ne zaman, hangi sayı) okur ve haberi
 * sıfırdan, kendi cümlelerimizle Türkçe yeniden yazar. Yayınlanan metin bize
 * aittir; kaynağa atıf ve kanonik bağlantı her zaman korunur.
 *
 * Anahtar tanımlı değilse veya model hata verirse yeniden yazım yapılmaz;
 * haber DRAFT olarak moderasyon kuyruğunda bekler (bkz. news-rss.ts).
 */

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

/** Modele gönderilen kaynak metnin üst sınırı — maliyet ve gecikme kontrolü. */
const SOURCE_CHARS_MAX = 6000;

export type RewriteInput = {
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
};

export type RewriteOutput = {
  title: string;
  spot: string;
  contentHtml: string;
  tags: string[];
  model: string;
};

export function rewriteEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export type SourcePage = {
  /** Olgu çıkarımı için düz metin. YAYINLANMAZ, yalnızca modele verilir. */
  facts: string;
  /** Kaynağın öne çıkan görseli (og:image / twitter:image). */
  image: string | null;
};

/** og:image / twitter:image adayları — ilk geçerli mutlak URL kazanır. */
const IMAGE_META = [
  /<meta[^>]+property=["']og:image(?::url)?["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::url)?["']/i,
  /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
];

/**
 * Kaynak sayfayı TEK sefer indirip hem olgu metnini hem görseli çıkarır.
 *
 * Tam bir readability uygulaması değil: gövde paragraflarını toplar, menü ve
 * altbilgi gürültüsünü uzunluk eşiğiyle eler. Ağ hatası sonucu boş döndürür;
 * çağıran taraf o haberi yeniden yazmadan kuyrukta bırakır.
 */
export async function fetchSourcePage(url: string): Promise<SourcePage> {
  try {
    const res = await fetchWithRetry(url, { timeoutMs: 12_000, retries: 1 });
    const html = await res.text();

    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " ");

    const facts = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map((m) => stripHtml(m[1]))
      // Kısa parçalar genelde "Paylaş", tarih satırı, reklam etiketi olur.
      .filter((t) => t.length > 60)
      .join("\n\n")
      .slice(0, SOURCE_CHARS_MAX);

    let image: string | null = null;
    for (const re of IMAGE_META) {
      const found = decodeEntities(html.match(re)?.[1] ?? "").trim();
      if (/^https?:\/\//i.test(found)) {
        image = found;
        break;
      }
    }

    return { facts, image };
  } catch {
    return { facts: "", image: null };
  }
}

const SYSTEM_PROMPT = `Sen Türkçe yayın yapan bir elektrikli araç ve mobilite gazetesinin muhabirisin.
Sana bir haberin kaynak metni verilecek. Görevin bu haberi SIFIRDAN, kendi cümlelerinle yeniden yazmak.

KESİN KURALLAR:
1. Kaynak metinden hiçbir cümleyi kopyalama, birebir alıntı yapma, cümle yapısını taklit etme. Olguları al, anlatımı tamamen kendin kur.
2. Kaynakta olmayan hiçbir bilgi, sayı, tarih, fiyat veya alıntı UYDURMA. Emin olmadığın ayrıntıyı hiç yazma.
3. Tarafsız, kısa cümleli, haber dili kullan. Reklam ve abartı yok.
4. Başlığı yeniden kur; kaynağın başlığını tekrarlama.
5. Gövdeyi 3-5 paragraf yaz, her paragraf 2-4 cümle olsun.
6. Türkçe imla ve noktalama kurallarına uy.

Yanıtını yalnızca şu JSON şemasıyla ver:
{"title": "...", "spot": "...", "paragraphs": ["...", "..."], "tags": ["...", "..."]}

title: en fazla 90 karakter, tırnak veya nokta ile bitmeyen haber başlığı.
spot: tek cümlelik, en fazla 200 karakterlik özet.
paragraphs: 3-5 paragraf, düz metin (HTML etiketi yok).
tags: 3-5 adet kısa Türkçe etiket, küçük harf.`;

type OpenAiResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

/** Modelin döndürdüğü serbest metinden JSON gövdesini ayıklar. */
function parseJson(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, "");
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

const asText = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Yeniden yazımın gerçekten yeniden yazım olduğunu doğrular.
 * Model tembellik edip kaynaktan uzun bir parçayı aynen taşıdıysa sonucu
 * reddederiz — haber DRAFT olarak kuyrukta kalır, insan karar verir.
 */
function looksCopied(source: string, produced: string) {
  if (!source) return false;
  const norm = (s: string) => s.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
  const haystack = norm(source);

  return norm(produced)
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length >= 60)
    .some((s) => haystack.includes(s));
}

/**
 * Haberi yeniden yazar. Başarısızlıkta null döner — çağıran taraf içeriği
 * DRAFT olarak bırakır, asla kaynağın metnini yayınlamaz.
 */
export async function rewriteArticle(
  input: RewriteInput,
  opts: { facts?: string; timeoutMs?: number } = {},
): Promise<RewriteOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const facts = (opts.facts ?? "").trim();

  // Kaynak metin yoksa elimizde yalnızca başlık ve RSS özeti var; bu kadarıyla
  // güvenilir bir haber gövdesi üretilemez, uydurma riski doğar.
  if (facts.length < 200 && input.summary.length < 160) return null;

  const userPrompt = [
    `KAYNAK: ${input.sourceName}`,
    `ORİJİNAL BAŞLIK: ${input.title}`,
    `ORİJİNAL ÖZET: ${input.summary}`,
    "",
    "KAYNAK METİN (yalnızca olgu çıkarımı için, kopyalama):",
    facts || input.summary,
  ].join("\n");

  const res = await fetchWithRetry(OPENAI_ENDPOINT, {
    timeoutMs: opts.timeoutMs ?? 45_000,
    retries: 1,
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const data = (await res.json()) as OpenAiResponse;
  if (data.error?.message) throw new Error(`OpenAI: ${data.error.message}`);

  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = parseJson(content);
  if (!parsed) return null;

  const title = asText(parsed.title);
  const spot = asText(parsed.spot);
  const paragraphs = Array.isArray(parsed.paragraphs)
    ? parsed.paragraphs.map(asText).filter((p) => p.length > 30)
    : [];

  // Eksik veya güdük çıktı yayına alınmaz.
  if (title.length < 15 || spot.length < 30 || paragraphs.length < 2) return null;

  const combined = [title, spot, ...paragraphs].join(" ");
  if (looksCopied(facts, combined)) {
    throw new Error("Yeniden yazım kaynağa fazla benziyor, yayına alınmadı");
  }

  const tags = Array.isArray(parsed.tags)
    ? [...new Set(parsed.tags.map(asText).filter(Boolean))].slice(0, 5)
    : [];

  const contentHtml = [
    ...paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`),
    `<p class="source-note"><em>Bu haber <a href="${escapeHtml(input.sourceUrl)}" rel="nofollow noopener" target="_blank">${escapeHtml(input.sourceName)}</a> kaynağındaki bilgilere dayanılarak Evos Gazete tarafından derlenmiştir.</em></p>`,
  ].join("\n");

  return { title, spot, contentHtml, tags, model };
}
