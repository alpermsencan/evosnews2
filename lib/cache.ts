/**
 * Cache etiketleri.
 *
 * Okuma tarafı (lib/queries.ts) verileri bu etiketlerle önbelleğe alır; yazma
 * tarafı (admin mutasyonları + ingest cron'u) aynı etiketi `revalidateTag` ile
 * geçersiz kılar. Böylece sayfalar statik hızda servis edilirken içerik
 * değiştiği anda tazelenir — "hızlı" ile "güncel" arasında seçim gerekmez.
 */
export const TAGS = {
  articles: "articles",
  categories: "categories",
  vehicles: "vehicles",
  stations: "stations",
  tariffs: "tariffs",
  listings: "listings",
  community: "community",
  tickers: "tickers",
  prices: "prices",
  otv: "otv",
  poll: "poll",
} as const;

export type CacheTag = (typeof TAGS)[keyof typeof TAGS];

/**
 * Önbellek ömürleri (saniye).
 *
 * Asıl tazeleme etiketlerle ANLIK yapılır: her mutasyon (panel, ingest cron,
 * bakım betikleri) ilgili etiketi geçersiz kılar. Buradaki süreler yalnızca
 * emniyet supabıdır — bir tazeleme çağrısı atlanırsa veri en fazla bu kadar
 * eski kalabilir.
 *
 * Kısa tutuluyorlar: bu ölçekte sorgu maliyeti önemsiz, buna karşılık
 * "sayfada eski veri görünüyor" hatası kullanıcı için doğrudan görünür.
 * Uzun bir TTL, atlanan bir invalidasyonu saatlerce gizler.
 */
export const TTL = {
  /** Haber akışı. */
  articles: 60,
  /** Kategori gibi nadiren değişen referans veriler. */
  reference: 120,
  /** Kur ve pazar göstergeleri şeridi. */
  market: 60,
  /** Araç ve istasyon listeleri. */
  catalog: 60,
} as const;
