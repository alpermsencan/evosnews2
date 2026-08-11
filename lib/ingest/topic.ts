/**
 * KONU FİLTRESİ
 *
 * Genel teknoloji beslemelerinde (ör. DonanımHaber) haberlerin çoğu elektrikli
 * araçla ilgisizdir. Kaynak tanımındaki `keywords` listesi doluysa yalnızca
 * eşleşen haberler kuyruğa alınır.
 *
 * Listede "!" ile başlayan kelimeler NEGATİFTİR ve eşleşen haberi eler.
 * Negatif liste, "batarya"/"şarj" gibi kelimelerin tüketici elektroniği
 * haberlerinde de geçmesinden doğan yanlış pozitifleri temizler.
 *
 * Ayrı modülde durur çünkü iki yerden kullanılır: toplama sırasında (yeni
 * haberi almalı mıyız?) ve arşiv temizliğinde (anahtar kelimeler değiştikten
 * sonra kuyruğa girmiş olmaması gereken kayıtları ayıklamak için).
 */

/** Türkçe büyük/küçük harf farkını (İ/ı) da eleyen karşılaştırma anahtarı. */
export function foldTr(text: string) {
  return text.replace(/İ/g, "i").replace(/I/g, "ı").toLocaleLowerCase("tr-TR");
}

export function matchesTopic(keywords: string[], ...fields: string[]) {
  if (!keywords.length) return true;

  const haystack = foldTr(fields.join(" "));
  const has = (k: string) => haystack.includes(foldTr(k));

  const positives = keywords.filter((k) => k.trim() && !k.startsWith("!"));
  const negatives = keywords
    .filter((k) => k.startsWith("!") && k.length > 1)
    .map((k) => k.slice(1).trim());

  if (negatives.some(has)) return false;
  if (!positives.length) return true;
  return positives.some((k) => has(k.trim()));
}
