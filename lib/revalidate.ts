import "server-only";
import { revalidateTag } from "next/cache";
import { TAGS, type CacheTag } from "./cache";

/**
 * Yazma sonrası önbellek tazeleme.
 *
 * Sayfa okumaları artık önbelleklenmiyor (bkz. lib/queries.ts), bu yüzden
 * mutasyonlar zaten anında görünür. Buradaki çağrılar iki şeyi kapsar:
 * sitemap/RSS'i besleyen `getPublishedIndex` önbelleği ve ileride yeniden
 * önbellek eklenirse doğru kancanın hazır olması.
 *
 * NOT: `revalidateTag` girdiyi silmez, bayat işaretler; bayat kopya bir sonraki
 * isteğe servis edilip arkada yenilenir. Anında geçersiz kılan `updateTag`
 * yalnızca Server Action'dan çağrılabildiği için route handler'larda
 * kullanılamıyor. Kullanıcıya anında doğru veri göstermenin yolu, kritik
 * okumaları hiç önbelleklememektir.
 */
export function touch(...tags: CacheTag[]) {
  // Next 16'da ikinci argüman zorunlu: "max" = etiketli tüm girdileri tamamen
  // geçersiz kıl (updateTag yalnızca Server Action içinden çağrılabilir).
  for (const tag of tags) revalidateTag(tag, "max");
}

/** Haber içeriği değişti (oluşturma, güncelleme, silme, moderasyon kararı). */
export const touchArticles = () => touch(TAGS.articles);
export const touchCategories = () => touch(TAGS.categories, TAGS.articles);
export const touchVehicles = () => touch(TAGS.vehicles);
export const touchStations = () => touch(TAGS.stations);
/** Operatör tarifesi değişti — şarj fiyatları sayfası ve şarj ağı özeti. */
export const touchTariffs = () => touch(TAGS.tariffs, TAGS.stations);
/** İlan eklendi/güncellendi/moderasyondan geçti. */
export const touchListings = () => touch(TAGS.listings);
export const touchCommunity = () => touch(TAGS.community);
export const touchTickers = () => touch(TAGS.tickers);
export const touchPrices = () => touch(TAGS.prices);
export const touchOtv = () => touch(TAGS.otv);
export const touchPoll = () => touch(TAGS.poll);
