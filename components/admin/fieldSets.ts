import type { Field } from "./EntityForm";

type Opt = { value: string; label: string };

export function articleFields(categories: Opt[], authors: Opt[]): Field[] {
  return [
    { name: "title", label: "BAŞLIK", type: "text", required: true, full: true },
    { name: "slug", label: "SLUG", type: "text", help: "Boş bırakılırsa başlıktan üretilir" },
    { name: "categoryId", label: "KATEGORİ", type: "select", options: categories, required: true },
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
  { name: "rangeKm", label: "MENZİL (km)", type: "number" },
  { name: "batteryKwh", label: "BATARYA (kWh)", type: "number" },
  { name: "motorPowerKw", label: "MOTOR (kW)", type: "number" },
  { name: "motorPowerHp", label: "MOTOR (HP)", type: "number" },
  { name: "acceleration", label: "0-100 (sn)", type: "number" },
  { name: "topSpeed", label: "AZAMİ HIZ (km/s)", type: "number" },
  { name: "dcChargeKw", label: "DC ŞARJ (kW)", type: "number" },
  { name: "chargeMin", label: "%10-80 ŞARJ (dk)", type: "number" },
  { name: "consumption", label: "TÜKETİM (kWh/100km)", type: "number" },
  { name: "trunkLiter", label: "BAGAJ (litre)", type: "number" },
  { name: "driveType", label: "ÇEKİŞ", type: "select", options: [
    { value: "FWD", label: "FWD (Önden)" },
    { value: "RWD", label: "RWD (Arkadan)" },
    { value: "AWD", label: "AWD (Dört çeker)" },
  ] },
  { name: "rating", label: "PUAN (0-5)", type: "number" },
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
  { name: "maxPowerKw", label: "MAKS. GÜÇ (kW)", type: "number" },
  { name: "pricePerKwh", label: "TARİFE (₺/kWh)", type: "number" },
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

export const listingFields: Field[] = [
  { name: "title", label: "İLAN BAŞLIĞI", type: "text", required: true, full: true },
  { name: "brand", label: "MARKA", type: "text", required: true },
  { name: "model", label: "MODEL", type: "text" },
  { name: "year", label: "MODEL YILI", type: "number" },
  { name: "km", label: "KİLOMETRE", type: "number" },
  { name: "price", label: "FİYAT (₺)", type: "number", required: true },
  { name: "city", label: "ŞEHİR", type: "text" },
  { name: "color", label: "RENK", type: "text" },
  { name: "rangeKm", label: "MENZİL (km)", type: "number" },
  { name: "batteryHealth", label: "BATARYA SAĞLIĞI (%)", type: "number" },
  { name: "sellerType", label: "SATICI TİPİ", type: "select", options: [
    { value: "Sahibinden", label: "Sahibinden" },
    { value: "Galeri", label: "Galeri" },
  ] },
  { name: "sellerName", label: "SATICI ADI", type: "text" },
  { name: "damage", label: "HASAR DURUMU", type: "text" },
  { name: "image", label: "KAPAK GÖRSELİ", type: "image", folder: "evos/ilanlar" },
  { name: "images", label: "EK GÖRSELLER", type: "images", folder: "evos/ilanlar" },
  { name: "isSponsored", label: "VİTRİN", type: "checkbox", placeholder: "Vitrin ilanı" },
  { name: "description", label: "AÇIKLAMA", type: "textarea", rows: 4, full: true },
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
