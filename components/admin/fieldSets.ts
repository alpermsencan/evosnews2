import type { Field } from "./EntityForm";

type Opt = { value: string; label: string };

export function articleFields(categories: Opt[], authors: Opt[]): Field[] {
  return [
    { name: "title", label: "BAŞLIK", type: "text", required: true, full: true },
    { name: "slug", label: "SLUG", type: "text", help: "Boş bırakılırsa başlıktan üretilir" },
    { name: "categoryId", label: "KATEGORİ", type: "select", options: categories, required: true },
    {
      name: "status",
      label: "YAYIN DURUMU",
      type: "select",
      options: [
        { value: "PUBLISHED", label: "Yayında" },
        { value: "DRAFT", label: "Taslak (moderasyon kuyruğunda)" },
        { value: "REJECTED", label: "Reddedildi" },
      ],
      help: "Taslak ve reddedilen haberler sitede görünmez",
    },
    { name: "authorId", label: "YAZAR", type: "select", options: authors },
    { name: "imageCredit", label: "GÖRSEL KAYNAĞI", type: "text" },
    { name: "readTime", label: "OKUMA SÜRESİ (dk)", type: "number" },
    { name: "image", label: "KAPAK GÖRSELİ", type: "image", folder: "evos/haberler", help: "Yükleyin veya mevcut URL'i koruyun" },
    { name: "spot", label: "SPOT", type: "textarea", rows: 3, required: true, full: true },
    { name: "content", label: "İÇERİK", type: "richtext", required: true, folder: "evos/haberler", help: "Görsel butonuyla metin içine görsel ekleyebilirsiniz" },
    { name: "tags", label: "ETİKETLER", type: "tags", full: true, placeholder: "Togg, Menzil, Batarya" },
    { name: "gallery", label: "GALERİ GÖRSELLERİ", type: "images", folder: "evos/haberler" },
    { name: "isHeadline", label: "MANŞET", type: "checkbox", placeholder: "Manşet carousel'inde göster" },
    { name: "isFeatured", label: "ÖNE ÇIKAN", type: "checkbox", placeholder: "Öne çıkan haber" },
    { name: "isBreaking", label: "SON DAKİKA", type: "checkbox", placeholder: "Son dakika şeridinde göster" },
    { name: "isVideo", label: "VİDEO", type: "checkbox", placeholder: "Video haberi" },
    { name: "publishedAt", label: "YAYIN TARİHİ", type: "date" },
  ];
}

export const categoryFields: Field[] = [
  { name: "name", label: "AD", type: "text", required: true },
  { name: "slug", label: "SLUG", type: "text" },
  { name: "color", label: "RENK", type: "color" },
  { name: "order", label: "SIRA", type: "number" },
  { name: "href", label: "ÖZEL LİNK", type: "text", help: "Boşsa /kategori/slug kullanılır" },
  { name: "isMainNav", label: "ÜST MENÜ", type: "checkbox", placeholder: "Üst menüde göster" },
  { name: "description", label: "AÇIKLAMA", type: "textarea", rows: 3, full: true },
];

export const authorFields: Field[] = [
  { name: "name", label: "AD SOYAD", type: "text", required: true },
  { name: "slug", label: "SLUG", type: "text" },
  { name: "title", label: "UNVAN", type: "text" },
  { name: "twitter", label: "TWITTER", type: "text" },
  { name: "avatar", label: "AVATAR", type: "image", folder: "evos/yazarlar" },
  { name: "bio", label: "BİYOGRAFİ", type: "textarea", rows: 3, full: true },
];

export const vehicleFields: Field[] = [
  { name: "brand", label: "MARKA", type: "text", required: true },
  { name: "model", label: "MODEL", type: "text", required: true },
  { name: "slug", label: "SLUG", type: "text" },
  { name: "year", label: "MODEL YILI", type: "number" },
  { name: "segment", label: "SEGMENT", type: "text", placeholder: "C-SUV" },
  { name: "bodyType", label: "KASA TİPİ", type: "text", placeholder: "SUV" },
  { name: "price", label: "FİYAT (₺)", type: "number", required: true },
  { name: "otvRate", label: "ÖTV ORANI (%)", type: "number" },
  { name: "rangeKm", label: "MENZİL — WLTP (km)", type: "number" },
  {
    name: "rangeSummerKm",
    label: "GERÇEK YAZ MENZİLİ (km)",
    type: "number",
    placeholder: "Ölçüm yoksa boş bırakın",
    help: "WLTP'den katsayıyla türetmeyin; yalnızca ölçülmüş değer girin",
  },
  {
    name: "rangeWinterKm",
    label: "GERÇEK KIŞ MENZİLİ (km)",
    type: "number",
    placeholder: "Ölçüm yoksa boş bırakın",
  },
  {
    name: "rangeSource",
    label: "MENZİL KAYNAĞI",
    type: "text",
    placeholder: "ör. EV Database gerçek menzil ölçümü",
  },
  { name: "batteryKwh", label: "BATARYA (kWh)", type: "number" },
  { name: "motorPowerKw", label: "MOTOR (kW)", type: "number" },
  { name: "motorPowerHp", label: "MOTOR (HP)", type: "number" },
  { name: "acceleration", label: "0-100 (sn)", type: "number" },
  { name: "topSpeed", label: "AZAMİ HIZ (km/s)", type: "number" },
  { name: "dcChargeKw", label: "DC ŞARJ (kW)", type: "number", placeholder: "Bilinmiyorsa boş bırakın" },
  { name: "chargeMin", label: "%10-80 ŞARJ (dk)", type: "number", placeholder: "Bilinmiyorsa boş bırakın" },
  { name: "consumption", label: "TÜKETİM (kWh/100km)", type: "number" },
  { name: "trunkLiter", label: "BAGAJ (litre)", type: "number", placeholder: "Bilinmiyorsa boş bırakın" },
  { name: "driveType", label: "ÇEKİŞ", type: "select", options: [
    { value: "FWD", label: "FWD (Önden)" },
    { value: "RWD", label: "RWD (Arkadan)" },
    { value: "AWD", label: "AWD (Dört çeker)" },
  ] },
  { name: "warranty", label: "BATARYA GARANTİSİ", type: "text", placeholder: "ör. 8 yıl / 160.000 km" },
  { name: "rating", label: "EDİTÖR PUANI (0-5)", type: "number", placeholder: "İnceleme yapılmadıysa boş bırakın" },
  { name: "image", label: "ARAÇ GÖRSELİ", type: "image", folder: "evos/araclar" },
  { name: "isFeatured", label: "ÖNE ÇIKAN", type: "checkbox", placeholder: "Anasayfa vitrininde göster" },
  { name: "pros", label: "ARTILARI", type: "tags", full: true, placeholder: "Virgülle ayırın" },
  { name: "cons", label: "EKSİLERİ", type: "tags", full: true, placeholder: "Virgülle ayırın" },
  { name: "description", label: "AÇIKLAMA", type: "textarea", rows: 4, full: true },
];

export const stationFields: Field[] = [
  { name: "name", label: "İSTASYON ADI", type: "text", required: true, full: true },
  { name: "slug", label: "SLUG", type: "text" },
  { name: "operator", label: "OPERATÖR", type: "text", required: true },
  { name: "city", label: "İL", type: "text", required: true },
  { name: "district", label: "İLÇE", type: "text" },
  { name: "address", label: "ADRES", type: "text", full: true },
  { name: "lat", label: "ENLEM", type: "number" },
  { name: "lng", label: "BOYLAM", type: "number" },
  { name: "socketCount", label: "SOKET SAYISI", type: "number" },
  { name: "maxPowerKw", label: "MAKS. GÜÇ (kW)", type: "number", placeholder: "Bilinmiyorsa boş bırakın" },
  { name: "pricePerKwh", label: "TARİFE (₺/kWh)", type: "number", placeholder: "Doğrulanmadıysa boş bırakın" },
  { name: "status", label: "DURUM", type: "select", options: [
    { value: "aktif", label: "Aktif" },
    { value: "bakim", label: "Bakımda" },
    { value: "planlanan", label: "Planlanan" },
  ] },
  { name: "socketTypes", label: "SOKET TİPLERİ", type: "tags", placeholder: "CCS, Type 2" },
  { name: "amenities", label: "OLANAKLAR", type: "tags", placeholder: "Kafe, WC, Market" },
  { name: "isFast", label: "HIZLI ŞARJ", type: "checkbox", placeholder: "DC hızlı şarj" },
  { name: "is24h", label: "7/24", type: "checkbox", placeholder: "Kesintisiz hizmet" },
];

/**
 * Operatör tarifesi.
 *
 * Fiyat alanları boş bırakılabilir: operatörün o kademede hizmeti yoksa hücre
 * "—" görünür. Sıfır yazmak "ücretsiz şarj" anlamına gelir ve uydurma veridir.
 */
export const tariffFields: Field[] = [
  { name: "operator", label: "OPERATÖR", type: "text", required: true, full: true },
  { name: "slug", label: "SLUG", type: "text", help: "Boş bırakılırsa addan üretilir" },
  { name: "website", label: "WEB SİTESİ", type: "url", placeholder: "https://" },
  { name: "acPrice", label: "AC ≤22 kW (₺/kWh)", type: "number" },
  { name: "acPriceMax", label: "AC ÜST SINIR", type: "number", help: "Yalnızca aralık ilan edildiyse" },
  { name: "dcPrice", label: "DC <150 kW (₺/kWh)", type: "number" },
  { name: "dcPriceMax", label: "DC ÜST SINIR", type: "number", help: "Yalnızca aralık ilan edildiyse" },
  { name: "ultraPrice", label: "DC ≥150 kW (₺/kWh)", type: "number" },
  { name: "ultraPriceMax", label: "ULTRA ÜST SINIR", type: "number", help: "Yalnızca aralık ilan edildiyse" },
  { name: "sourceUrl", label: "FİYAT KAYNAĞI", type: "url", placeholder: "Operatörün tarife sayfası" },
  { name: "isActive", label: "YAYINDA", type: "checkbox", placeholder: "Tabloda göster" },
  {
    name: "aliases",
    label: "ALTERNATİF ADLAR",
    type: "tags",
    full: true,
    placeholder: "İstasyon envanterindeki farklı yazımlar",
    help: "Open Charge Map operatör adı farklıysa buraya yazın (ör. Tesla)",
  },
  { name: "note", label: "NOT", type: "text", full: true, placeholder: "Kademe sınırı, kampanya, bölgesel fark" },
];

export const communityFields: Field[] = [
  { name: "title", label: "KONU BAŞLIĞI", type: "text", required: true, full: true },
  { name: "author", label: "YAZAR", type: "text", required: true },
  { name: "topic", label: "KONU", type: "text", required: true },
  { name: "isPinned", label: "SABİTLE", type: "checkbox", placeholder: "Üstte sabitle" },
  { name: "avatar", label: "AVATAR", type: "image", folder: "evos/topluluk" },
  { name: "body", label: "İÇERİK", type: "textarea", rows: 5, required: true, full: true },
];

export const tickerFields: Field[] = [
  { name: "label", label: "ETİKET", type: "text", required: true },
  { name: "value", label: "DEĞER", type: "text", required: true },
  { name: "unit", label: "BİRİM", type: "text", placeholder: "₺/kWh" },
  { name: "changePct", label: "DEĞİŞİM (%)", type: "number" },
  { name: "order", label: "SIRA", type: "number" },
];
