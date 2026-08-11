import type { SourceJob, SourceKind } from "../types";
import { tcmbSource } from "./tcmb";
import { openChargeMapSource } from "./openchargemap";
import { newsRssSource } from "./news-rss";
import { marketStatsSource } from "./market-stats";

/**
 * İşleyici kaydı.
 * - Tekil kaynaklar kendi anahtarıyla çözülür ("tcmb", "openchargemap").
 * - `kind: "news"` olan tüm kaynaklar ortak RSS işleyicisini paylaşır; yeni bir
 *   haber beslemesi eklemek için kod değil, panelden bir DataSource kaydı yeter.
 */
export const SOURCES: Record<string, SourceJob> = {
  [tcmbSource.key]: tcmbSource,
  [openChargeMapSource.key]: openChargeMapSource,
  [marketStatsSource.key]: marketStatsSource,
  news: newsRssSource,
};

export type SourceSeed = {
  key: string;
  name: string;
  kind: SourceKind;
  schedule: string;
  endpoint?: string;
  categorySlug?: string;
  keywords?: string[];
  attribution?: string;
  isActive?: boolean;
  /** Yeniden yazılan metin doğrudan yayına girsin mi? */
  autoPublish?: boolean;
};

/**
 * Elektrikli araç haberlerini genel teknoloji beslemelerinden ayıklayan filtre.
 * "!" ile başlayanlar negatiftir: "şarj"/"batarya" kelimeleri tüketici
 * elektroniği haberlerinde de geçtiğinden bu liste yanlış pozitifleri eler.
 */
const EV_KEYWORDS = [
  // --- POZİTİF ---
  // Yalnızca ARAÇ bağlamı taşıyan ifadeler. "batarya", "menzil", "şarj" gibi
  // tek başına geçen kelimeler bilerek listede YOKTUR: telefon, kulaklık ve
  // dizüstü haberlerinde de geçtikleri için sürüyü kirletiyorlardı.
  "elektrikli araç",
  "elektrikli otomobil",
  "elektrikli araba",
  "elektrikli suv",
  "elektrikli sedan",
  "elektrikli pickup",
  "elektrikli kamyon",
  "elektrikli otobüs",
  "elektrikli model",
  "elektrikli hipermarket",
  "şarj istasyonu",
  "şarj ağı",
  "şarj noktası",
  "hızlı şarj istasyonu",
  "araç bataryası",
  "batarya teknolojisi",
  "katı hal batarya",
  "sodyum iyon",
  "menzil rekoru",
  "otomobil",
  "otomotiv",
  "ötv",
  "sıfır emisyon",
  "otonom sürüş",
  "togg",
  "tesla",
  "byd",
  "ioniq",
  "otomobil fuarı",

  // --- NEGATİF ---
  // Tüketici elektroniği gürültüsü. Bunlardan biri geçiyorsa haber elenir.
  "!iphone",
  "!apple",
  "!ipad",
  "!macbook",
  "!airpods",
  "!samsung",
  "!galaxy",
  "!xiaomi",
  "!huawei",
  "!android",
  "!ios ",
  "!kulaklık",
  "!akıllı saat",
  "!powerbank",
  "!power bank",
  "!laptop",
  "!dizüstü",
  "!tablet",
  "!oyun konsol",
  "!playstation",
  "!xbox",
  "!nintendo",
  "!cep telefonu",
  "!akıllı telefon",
  "!ekran kartı",
  "!işlemci",
  "!robot süpürge",
  "!monitör",
];

/**
 * Otomobil dışı ulaşım ve enerji gürültüsü.
 *
 * Electrek / InsideEVs gibi beslemeler e-bisiklet, scooter, güneş paneli ve
 * uzay haberlerini de yayınlıyor; site otomobil odaklı olduğu için bunlar
 * elenir. Liste hem İngilizce (toplama anında orijinal başlık) hem Türkçe
 * (arşiv temizliğinde yeniden yazılmış başlık) karşılığı içerir.
 */
const OFF_TOPIC = [
  "!e-bike",
  "!ebike",
  "!electric bike",
  "!elektrikli bisiklet",
  "!e-bisiklet",
  "!bisiklet",
  "!bicycle",
  "!scooter",
  "!moped",
  "!motorcycle",
  "!motosiklet",
  "!spacex",
  "!starship",
  "!uzay",
  "!moon",
  "!ay'da",
  "!solar panel",
  "!güneş paneli",
  "!solar roof",
  "!heat pump",
  "!ısı pompası",
  "!lawn mower",
  "!çim biçme",
  "!podcast",
  "!webinar",
  "!deal of the day",
  // NOT: "indirim" bilerek listede değil — "Tesla fiyat indirimi" gerçek bir
  // otomobil haberidir; yalnızca beslemelerin günlük fırsat köşesi elenir.
];

/** Türkçe genel teknoloji beslemeleri için tam filtre. */
const TR_TECH_FILTER = [...EV_KEYWORDS, ...OFF_TOPIC];

/**
 * Elektrikli araca adanmış İngilizce beslemeler için filtre.
 * Pozitif liste yoktur — besleme zaten konuya adanmış; yalnızca otomobil dışı
 * içerik elenir.
 */
const EN_EV_FILTER = [...OFF_TOPIC];

/**
 * Kurulumda oluşturulan varsayılan kaynaklar.
 *
 * Beslemelerin tamamı canlı olarak doğrulandı (HTTP 200 + geçerli RSS).
 *
 * NOT: Haber kaynakları `autoPublish: true` ile gelir. Bu güvenlidir çünkü
 * yayına çıkan metin kaynağın metni DEĞİLDİR: her haber lib/ingest/rewrite.ts
 * tarafından sıfırdan Türkçe yeniden yazılır, yazılamayan kayıt DRAFT olarak
 * kuyrukta kalır. Yeniden yazım aynı zamanda çeviri yaptığı için İngilizce
 * kaynaklar da doğrudan Türkçe yayına girer.
 */
export const DEFAULT_SOURCES: SourceSeed[] = [
  {
    key: "tcmb",
    name: tcmbSource.name,
    kind: "fx",
    schedule: tcmbSource.schedule,
    endpoint: tcmbSource.endpoint,
    attribution: tcmbSource.attribution,
  },
  {
    key: "openchargemap",
    name: openChargeMapSource.name,
    kind: "stations",
    schedule: openChargeMapSource.schedule,
    endpoint: openChargeMapSource.endpoint,
    attribution: openChargeMapSource.attribution,
  },
  {
    key: "market-stats",
    name: marketStatsSource.name,
    kind: "prices",
    schedule: marketStatsSource.schedule,
    attribution: marketStatsSource.attribution,
  },
  {
    key: "news:donanimhaber",
    name: "DonanımHaber",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://www.donanimhaber.com/rss/tum/",
    categorySlug: "teknoloji",
    keywords: TR_TECH_FILTER,
    attribution: "Kaynak: DonanımHaber",
    autoPublish: true,
  },
  {
    key: "news:shiftdelete",
    name: "ShiftDelete",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://shiftdelete.net/feed",
    categorySlug: "teknoloji",
    keywords: TR_TECH_FILTER,
    attribution: "Kaynak: ShiftDelete",
    autoPublish: true,
  },
  {
    key: "news:webrazzi",
    name: "Webrazzi",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://webrazzi.com/feed/",
    categorySlug: "haber-merkezi",
    keywords: TR_TECH_FILTER,
    attribution: "Kaynak: Webrazzi",
    autoPublish: true,
  },
  {
    key: "news:log",
    name: "Log",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://www.log.com.tr/feed/",
    categorySlug: "teknoloji",
    keywords: TR_TECH_FILTER,
    attribution: "Kaynak: Log",
    autoPublish: true,
  },
  {
    key: "news:electrek",
    name: "Electrek",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://electrek.co/feed/",
    categorySlug: "dunya",
    keywords: EN_EV_FILTER,
    attribution: "Kaynak: Electrek",
    autoPublish: true,
  },
  {
    key: "news:chargedevs",
    name: "Charged EVs",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://chargedevs.com/feed/",
    categorySlug: "dunya",
    keywords: EN_EV_FILTER,
    attribution: "Kaynak: Charged EVs",
    autoPublish: true,
  },
  {
    key: "news:insideevs",
    name: "InsideEVs",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://insideevs.com/rss/articles/all/",
    categorySlug: "dunya",
    keywords: EN_EV_FILTER,
    attribution: "Kaynak: InsideEVs",
    autoPublish: true,
    // KAPALI: insideevs.com bot isteklerini 403 ile reddediyor ve RSS özeti
    // ~90 karakter. Elimizde yeniden yazıma yetecek olgu olmadığı için
    // haberler kuyrukta takılıyordu. Site erişime izin verirse açılabilir.
    isActive: false,
  },
  {
    key: "news:electrive",
    name: "electrive",
    kind: "news",
    schedule: "0 4 * * *",
    endpoint: "https://www.electrive.com/feed/",
    categorySlug: "dunya",
    keywords: EN_EV_FILTER,
    attribution: "Kaynak: electrive",
    autoPublish: true,
  },
];
