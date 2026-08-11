/**
 * TÜRKİYE İL REFERANSI
 *
 * Posta kodlarının ilk iki hanesi plaka koduyla aynıdır ve ili kesin verir.
 * Dış kaynaklardan (ör. Open Charge Map) gelen adreslerde il alanı çoğu zaman
 * boş veya İngilizce yazılmış olduğu için burada normalize edilir.
 */

/** Plaka kodu → il adı (81 il). */
export const PROVINCE_BY_POSTCODE: Record<string, string> = {
  "01": "Adana", "02": "Adıyaman", "03": "Afyonkarahisar", "04": "Ağrı",
  "05": "Amasya", "06": "Ankara", "07": "Antalya", "08": "Artvin",
  "09": "Aydın", "10": "Balıkesir", "11": "Bilecik", "12": "Bingöl",
  "13": "Bitlis", "14": "Bolu", "15": "Burdur", "16": "Bursa",
  "17": "Çanakkale", "18": "Çankırı", "19": "Çorum", "20": "Denizli",
  "21": "Diyarbakır", "22": "Edirne", "23": "Elazığ", "24": "Erzincan",
  "25": "Erzurum", "26": "Eskişehir", "27": "Gaziantep", "28": "Giresun",
  "29": "Gümüşhane", "30": "Hakkâri", "31": "Hatay", "32": "Isparta",
  "33": "Mersin", "34": "İstanbul", "35": "İzmir", "36": "Kars",
  "37": "Kastamonu", "38": "Kayseri", "39": "Kırklareli", "40": "Kırşehir",
  "41": "Kocaeli", "42": "Konya", "43": "Kütahya", "44": "Malatya",
  "45": "Manisa", "46": "Kahramanmaraş", "47": "Mardin", "48": "Muğla",
  "49": "Muş", "50": "Nevşehir", "51": "Niğde", "52": "Ordu",
  "53": "Rize", "54": "Sakarya", "55": "Samsun", "56": "Siirt",
  "57": "Sinop", "58": "Sivas", "59": "Tekirdağ", "60": "Tokat",
  "61": "Trabzon", "62": "Tunceli", "63": "Şanlıurfa", "64": "Uşak",
  "65": "Van", "66": "Yozgat", "67": "Zonguldak", "68": "Aksaray",
  "69": "Bayburt", "70": "Karaman", "71": "Kırıkkale", "72": "Batman",
  "73": "Şırnak", "74": "Bartın", "75": "Ardahan", "76": "Iğdır",
  "77": "Yalova", "78": "Karabük", "79": "Kilis", "80": "Osmaniye",
  "81": "Düzce",
};

/** İngilizce/aksansız yazımların doğru il adına eşlenmesi. */
const ALIASES: Record<string, string> = {
  istanbul: "İstanbul",
  izmir: "İzmir",
  ankara: "Ankara",
  antalya: "Antalya",
  bursa: "Bursa",
  adana: "Adana",
  konya: "Konya",
  mersin: "Mersin",
  icel: "Mersin",
  kocaeli: "Kocaeli",
  izmit: "Kocaeli",
  mugla: "Muğla",
  aydin: "Aydın",
  denizli: "Denizli",
  balikesir: "Balıkesir",
  canakkale: "Çanakkale",
  tekirdag: "Tekirdağ",
  sakarya: "Sakarya",
  eskisehir: "Eskişehir",
  gaziantep: "Gaziantep",
  diyarbakir: "Diyarbakır",
  samsun: "Samsun",
  trabzon: "Trabzon",
  kayseri: "Kayseri",
  malatya: "Malatya",
  sanliurfa: "Şanlıurfa",
  kahramanmaras: "Kahramanmaraş",
  afyonkarahisar: "Afyonkarahisar",
  afyon: "Afyonkarahisar",
  zonguldak: "Zonguldak",
  duzce: "Düzce",
  yalova: "Yalova",
  bolu: "Bolu",
  edirne: "Edirne",
  kirklareli: "Kırklareli",
  manisa: "Manisa",
  usak: "Uşak",
  isparta: "Isparta",
  burdur: "Burdur",
  nevsehir: "Nevşehir",
  hatay: "Hatay",
  ordu: "Ordu",
  rize: "Rize",
  sivas: "Sivas",
  erzurum: "Erzurum",
  van: "Van",
  elazig: "Elazığ",
  corum: "Çorum",
  amasya: "Amasya",
  tokat: "Tokat",
  giresun: "Giresun",
  karabuk: "Karabük",
  bartin: "Bartın",
  kastamonu: "Kastamonu",
  sinop: "Sinop",
  kutahya: "Kütahya",
  bilecik: "Bilecik",
  karaman: "Karaman",
  aksaray: "Aksaray",
  nigde: "Niğde",
  kirsehir: "Kırşehir",
  kirikkale: "Kırıkkale",
  yozgat: "Yozgat",
  osmaniye: "Osmaniye",
  kilis: "Kilis",
  adiyaman: "Adıyaman",
  mardin: "Mardin",
  batman: "Batman",
  siirt: "Siirt",
  sirnak: "Şırnak",
  hakkari: "Hakkâri",
  bitlis: "Bitlis",
  mus: "Muş",
  bingol: "Bingöl",
  tunceli: "Tunceli",
  erzincan: "Erzincan",
  bayburt: "Bayburt",
  gumushane: "Gümüşhane",
  artvin: "Artvin",
  ardahan: "Ardahan",
  kars: "Kars",
  igdir: "Iğdır",
  agri: "Ağrı",
  cankiri: "Çankırı",
};

const VALID = new Set(Object.values(PROVINCE_BY_POSTCODE));

/** Aksan ve büyük/küçük harf farkını eleyen anahtar. */
function fold(text: string) {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

/**
 * Serbest metinden il adı çözer. Tanınmayan değer için null döner —
 * ilçe adını il gibi göstermemek için tahmin üretilmez.
 */
export function normalizeProvince(raw: string): string | null {
  if (!raw) return null;
  if (VALID.has(raw)) return raw;

  const key = fold(raw);
  if (ALIASES[key]) return ALIASES[key];

  for (const name of VALID) if (fold(name) === key) return name;
  return null;
}

/**
 * Serbest metinde (istasyon adı, adres satırı) geçen il adını arar.
 * Örnek: "ZES - Çanakkale Kepez" → "Çanakkale".
 *
 * Kelime sınırına bakılır; aksi hâlde "Van" gibi kısa il adları
 * "Vangölü", "Karavan" gibi kelimelerin içinde yanlış eşleşir.
 */
export function findProvinceInText(text: string): string | null {
  if (!text) return null;
  const words = new Set(fold(text).split(/(?<=[a-z])(?=[A-Z])|[^a-z]+/).filter(Boolean));

  for (const name of VALID) {
    if (words.has(fold(name))) return name;
  }
  // "Afyonkarahisar" gibi bileşik adlar için yerel kısaltmalar.
  for (const [alias, province] of Object.entries(ALIASES)) {
    if (words.has(alias)) return province;
  }
  return null;
}
