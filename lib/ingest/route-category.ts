/**
 * KATEGORİ YÖNLENDİRME
 *
 * Kaynak tanımındaki `categorySlug` bir beslemenin TAMAMI için tek bir hedef
 * belirler: Electrek'ten gelen her haber "dunya", DonanımHaber'den gelen her
 * haber "teknoloji" olur. Sonuç, sitedeki konu sayfalarının (şarj ağı, araç
 * merkezi, test sürüşü, fiyat analizi) hiç haber görmemesiydi — anasayfadaki
 * "ŞARJ AĞI" bölümü boş kalıyordu.
 *
 * Burada haber, başlığı ve spotundaki konuya göre doğru kategoriye
 * yönlendirilir. Hiçbir kural eşleşmezse kaynağın kendi kategorisi korunur:
 * emin olunmayan haber taşınmaz.
 *
 * Kurallar SIRALIDIR — ilk eşleşen kazanır. Sıra, dar konudan genişe doğrudur:
 * "ötv indirimi" haberi hem ÖTV hem fiyat kuralına uyar; ÖTV daha dar olduğu
 * için önce gelir.
 *
 * Anahtar kelimeler hem Türkçe hem İngilizce içerir: yönlendirme iki kez
 * çalışır — toplama sırasında (başlık çoğu zaman İngilizcedir) ve yeniden
 * yazımdan sonra (metin artık Türkçedir).
 */

import { foldTr } from "./topic";

type Rule = {
  slug: string;
  keywords: string[];
};

const RULES: Rule[] = [
  {
    // Şarj altyapısı: istasyon, operatör, soket, tarife.
    slug: "sarj-agi",
    keywords: [
      "şarj istasyonu",
      "şarj ağı",
      "şarj noktası",
      "şarj altyapı",
      "şarj operatörü",
      "şarj tarifesi",
      "şarj ücreti",
      "şarj fiyat",
      "hızlı şarj",
      "ultra hızlı",
      "supercharger",
      "charging station",
      "charging network",
      "charging hub",
      "charging point",
      "fast charger",
      "ev charger",
      "charging infrastructure",
      "megawatt charging",
      "nacs",
      "ccs",
      "kablosuz şarj",
      "şarj noktaları",
    ],
  },
  {
    // Vergi mevzuatı — ÖTV rehberi sayfasının konusu.
    slug: "otv-rehberi",
    keywords: [
      "ötv",
      "özel tüketim vergisi",
      "vergi dilimi",
      "vergi düzenlemesi",
      "matrah",
      "gümrük vergisi",
      "ek vergi",
    ],
  },
  {
    // Editöryel deneme / inceleme içeriği.
    slug: "test-surusu",
    keywords: [
      "test sürüşü",
      "ilk sürüş",
      "sürüş izlenimi",
      "incelemesi",
      "menzil testi",
      "test drive",
      "first drive",
      "road test",
      "we drove",
      "review:",
      "long-term test",
    ],
  },
  {
    // Otonom sürüş ve yapay zekâ — AI Danışman sayfasının haber şeridi.
    slug: "ai-danisman",
    keywords: [
      "yapay zeka",
      "yapay zekâ",
      "otonom sürüş",
      "otonom araç",
      "sürücüsüz",
      "robotaksi",
      "robotaxi",
      "full self-driving",
      "autopilot",
      "autonomous driving",
      "self-driving",
      "sesli asistan",
      "voice assistant",
    ],
  },
  {
    // Fiyat hareketi — fiyat analizi sayfasının konusu.
    slug: "fiyat-analizi",
    keywords: [
      "zam",
      "zamlandı",
      "fiyat listesi",
      "fiyatı belli oldu",
      "fiyatları belli oldu",
      "fiyat artışı",
      "fiyat indirimi",
      "indirime girdi",
      "kampanya fiyat",
      "price cut",
      "price increase",
      "price drop",
      "cheaper",
      "gets cheaper",
      "starting price",
      "başlangıç fiyatı",
    ],
  },
  {
    // Yeni model / lansman haberleri — Araç Merkezi.
    slug: "arac-merkezi",
    keywords: [
      "tanıtıldı",
      "tanıttı",
      "lansman",
      "yeni modeli",
      "satışa sunuldu",
      "satışa çıkıyor",
      "piyasaya sürülecek",
      "görücüye çıktı",
      "makyajlı",
      "yeni nesil",
      "unveil",
      "unveiled",
      "reveals",
      "revealed",
      "debut",
      "goes on sale",
      "spied",
      "prototype",
      "concept car",
      "facelift",
    ],
  },
  {
    // Batarya kimyası, yazılım, üretim teknolojisi.
    slug: "teknoloji",
    keywords: [
      "katı hal batarya",
      "solid-state",
      "sodyum iyon",
      "sodium-ion",
      "lfp batarya",
      "batarya teknolojisi",
      "batarya üretimi",
      "hücre üretimi",
      "yazılım güncellemesi",
      "software update",
      "over-the-air",
      "battery tech",
      "gigafactory",
    ],
  },
];

/**
 * Haberin düşmesi gereken kategori slug'ı.
 *
 * @param fallback Kaynağın kendi kategorisi — hiçbir kural eşleşmezse bu döner.
 */
export function routeCategory(fallback: string, ...fields: string[]) {
  const haystack = foldTr(fields.filter(Boolean).join(" "));

  for (const rule of RULES) {
    if (rule.keywords.some((k) => haystack.includes(foldTr(k)))) return rule.slug;
  }
  return fallback;
}

/** Yönlendirmenin hedefleyebileceği tüm kategoriler (kurulum doğrulaması için). */
export const ROUTED_SLUGS = RULES.map((r) => r.slug);
