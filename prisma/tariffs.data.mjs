/**
 * ŞARJ OPERATÖRÜ TARİFELERİ — REFERANS VERİ
 *
 * Türkiye'de faaliyet gösteren halka açık şarj ağlarının ilan ettiği
 * ₺/kWh fiyatları. Kademeler operatörlerin kendi ilan yapısıyla aynıdır:
 *
 *   AC     → ≤ 22 kW
 *   DC     → < 150 kW ("hızlı")
 *   Ultra  → ≥ 150 kW (HPC)
 *
 * Operatör o kademede hizmet vermiyorsa alan `null` bırakılır ve arayüzde
 * "—" görünür; sıfır veya tahmini bir sayı YAZILMAZ. Fiyat aralık olarak
 * ilan edilmişse (sokete/güce göre değişiyorsa) `*PriceMax` doldurulur.
 *
 * Kaynak: volthaber.com/sarj-fiyatlari derlemesi (operatörlerin kendi
 * ilanlarından toplanmıştır). Tüm fiyatlara KDV dâhildir. Tarifeler sık
 * değişir — panelden (/admin/tarifeler) güncellenir ve her satır kendi
 * doğrulama tarihini taşır.
 */

/** Derlemenin alındığı tarih — her satırın `verifiedAt` değeri budur. */
export const TARIFFS_VERIFIED_AT = "2026-08-13";
export const TARIFFS_SOURCE = "volthaber";
export const TARIFFS_SOURCE_URL = "https://volthaber.com/sarj-fiyatlari/";

export const tariffs = [
  {"operator":"ZES (Zorlu)","aliases":["ZES"],"acPrice":9.99,"acPriceMax":null,"dcPrice":12.99,"dcPriceMax":null,"ultraPrice":16.49,"ultraPriceMax":null,"website":"https://zes.net","note":"HPC 16.49 TL"},
  {"operator":"Eşarj (Enerjisa)","aliases":["Esarj"],"acPrice":9.9,"acPriceMax":null,"dcPrice":13.5,"dcPriceMax":null,"ultraPrice":13.5,"ultraPriceMax":null,"website":"https://esarj.com","note":"Tüm DC sabit"},
  {"operator":"Trugo (TOGG)","aliases":["Togg"],"acPrice":9.95,"acPriceMax":null,"dcPrice":13.78,"dcPriceMax":null,"ultraPrice":15.36,"ultraPriceMax":null,"website":"https://trugo.com.tr","note":"150 kW altı/üzeri"},
  {"operator":"Tesla Supercharger","aliases":["Tesla","Tesla (including non-tesla)"],"acPrice":null,"acPriceMax":null,"dcPrice":null,"dcPriceMax":null,"ultraPrice":9.9,"ultraPriceMax":12.3,"website":"https://www.tesla.com/tr_tr/supercharger","note":"Tesla: 9.90, Diğer: 12.30 TL"},
  {"operator":"Astor Şarj","aliases":[],"acPrice":9.49,"acPriceMax":null,"dcPrice":12.49,"dcPriceMax":null,"ultraPrice":12.49,"ultraPriceMax":null,"website":"https://astorsarj.com.tr","note":"Tüm DC'ler sabit"},
  {"operator":"Shell Recharge","aliases":[],"acPrice":11.99,"acPriceMax":null,"dcPrice":13.5,"dcPriceMax":null,"ultraPrice":14.99,"ultraPriceMax":null,"website":"https://www.shell.com.tr/suruculer/shell-recharge.html","note":"Kademeli fiyat"},
  {"operator":"Voltrun","aliases":[],"acPrice":9.9,"acPriceMax":null,"dcPrice":12.9,"dcPriceMax":null,"ultraPrice":12.9,"ultraPriceMax":null,"website":"https://www.voltrun.com","note":null},
  {"operator":"beefull","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":10.99,"dcPriceMax":null,"ultraPrice":12.99,"ultraPriceMax":null,"website":"https://beefull.com","note":"80 kW farkı"},
  {"operator":"360enerji","aliases":[],"acPrice":7,"acPriceMax":null,"dcPrice":8.99,"dcPriceMax":null,"ultraPrice":8.99,"ultraPriceMax":null,"website":"https://360enerji.com","note":null},
  {"operator":"5 Şarj (Borusan)","aliases":["5 Sarj"],"acPrice":8.99,"acPriceMax":null,"dcPrice":12.49,"dcPriceMax":null,"ultraPrice":15.99,"ultraPriceMax":null,"website":"https://5sarj.com","note":"150 kW farkı"},
  {"operator":"Aksa Şarj","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":11.49,"dcPriceMax":null,"ultraPrice":12.49,"ultraPriceMax":null,"website":"https://www.aksasarj.com.tr","note":"100 kW farkı"},
  {"operator":"Borenco","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":10.99,"dcPriceMax":null,"ultraPrice":10.99,"ultraPriceMax":null,"website":"https://borenco.com.tr","note":null},
  {"operator":"ChargeIQ","aliases":[],"acPrice":7.99,"acPriceMax":null,"dcPrice":10.49,"dcPriceMax":null,"ultraPrice":10.49,"ultraPriceMax":null,"website":"https://chargeiq.com","note":null},
  {"operator":"Charge Teknoloji","aliases":[],"acPrice":7.7,"acPriceMax":null,"dcPrice":9,"dcPriceMax":null,"ultraPrice":9,"ultraPriceMax":null,"website":"https://chargeteknoloji.com","note":null},
  {"operator":"CW Enerji","aliases":[],"acPrice":7.99,"acPriceMax":null,"dcPrice":10.99,"dcPriceMax":null,"ultraPrice":10.99,"ultraPriceMax":null,"website":"https://cwenerji.com","note":null},
  {"operator":"Çelikler Enerji","aliases":[],"acPrice":8.49,"acPriceMax":null,"dcPrice":10.6,"dcPriceMax":null,"ultraPrice":10.6,"ultraPriceMax":null,"website":"https://celiklerenerji.com","note":null},
  {"operator":"D-Charge","aliases":[],"acPrice":9.4,"acPriceMax":null,"dcPrice":12.99,"dcPriceMax":null,"ultraPrice":12.99,"ultraPriceMax":null,"website":"https://dcharge.com.tr","note":null},
  {"operator":"e-POwer (PO)","aliases":["Petrol Ofisi","ePower"],"acPrice":8.49,"acPriceMax":null,"dcPrice":10.99,"dcPriceMax":null,"ultraPrice":10.99,"ultraPriceMax":null,"website":"https://www.petrolofisi.com.tr/e-power","note":null},
  {"operator":"enyakıt","aliases":["En Yakıt"],"acPrice":14.9,"acPriceMax":null,"dcPrice":14.9,"dcPriceMax":null,"ultraPrice":14.9,"ultraPriceMax":null,"website":"https://enyakit.com.tr","note":"Sabit Fiyat"},
  {"operator":"Epsis","aliases":[],"acPrice":8.5,"acPriceMax":null,"dcPrice":9.5,"dcPriceMax":null,"ultraPrice":11.5,"ultraPriceMax":null,"website":"https://epsiz.com","note":null},
  {"operator":"Estasyon","aliases":[],"acPrice":8.2,"acPriceMax":8.63,"dcPrice":11.44,"dcPriceMax":null,"ultraPrice":11.44,"ultraPriceMax":null,"website":"https://estasyon.com.tr/","note":"21/22 kW AC farkı"},
  {"operator":"Evbee","aliases":[],"acPrice":9.95,"acPriceMax":null,"dcPrice":13.78,"dcPriceMax":null,"ultraPrice":15.36,"ultraPriceMax":null,"website":"https://evbee.com.tr/","note":"Sınır: 150 kW"},
  {"operator":"FullCharger","aliases":[],"acPrice":8.29,"acPriceMax":null,"dcPrice":11.29,"dcPriceMax":null,"ultraPrice":11.29,"ultraPriceMax":null,"website":"https://fullcharger.com.tr","note":null},
  {"operator":"Hunat Enerji","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":12.49,"dcPriceMax":null,"ultraPrice":12.49,"ultraPriceMax":null,"website":"https://hunatenerji.com.tr","note":null},
  {"operator":"Neva Şarj","aliases":[],"acPrice":9.9,"acPriceMax":null,"dcPrice":13.9,"dcPriceMax":null,"ultraPrice":13.9,"ultraPriceMax":null,"website":"https://www.nevasarj.com","note":"240 kW'a kadar DC"},
  {"operator":"RHG Enertürk","aliases":[],"acPrice":6.6,"acPriceMax":9.98,"dcPrice":12.49,"dcPriceMax":null,"ultraPrice":12.49,"ultraPriceMax":null,"website":"https://rhgsarj.com.tr","note":"AC1 ve AC2 farkı"},
  {"operator":"Sharz.net","aliases":["Sharz.Net"],"acPrice":9.29,"acPriceMax":null,"dcPrice":10.49,"dcPriceMax":null,"ultraPrice":11.49,"ultraPriceMax":null,"website":"https://sharz.net","note":"Sınır: 60 kW"},
  {"operator":"Armatec","aliases":[],"acPrice":7.49,"acPriceMax":null,"dcPrice":9.99,"dcPriceMax":null,"ultraPrice":9.99,"ultraPriceMax":null,"website":"https://armatec.com.tr","note":"Endüstriyel"},
  {"operator":"E4 Şarj","aliases":[],"acPrice":9.49,"acPriceMax":null,"dcPrice":11.99,"dcPriceMax":null,"ultraPrice":14.99,"ultraPriceMax":null,"website":null,"note":"60 kW ve tüm DC"},
  {"operator":"Electrise","aliases":[],"acPrice":8.5,"acPriceMax":null,"dcPrice":9.5,"dcPriceMax":10,"ultraPrice":11,"ultraPriceMax":null,"website":null,"note":"Kademeli fiyat"},
  {"operator":"Fastgo","aliases":[],"acPrice":8.49,"acPriceMax":null,"dcPrice":8.9,"dcPriceMax":null,"ultraPrice":8.9,"ultraPriceMax":null,"website":"https://fastgo.com.tr","note":null},
  {"operator":"FixCharge","aliases":[],"acPrice":9.33,"acPriceMax":null,"dcPrice":10.76,"dcPriceMax":null,"ultraPrice":10.76,"ultraPriceMax":null,"website":"https://fixcharge.com.tr","note":null},
  {"operator":"Fortis Şarj","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":null,"dcPriceMax":null,"ultraPrice":11.99,"ultraPriceMax":null,"website":null,"note":"Sadece 120-180 kW DC"},
  {"operator":"G-Charge","aliases":[],"acPrice":8.9,"acPriceMax":null,"dcPrice":11.9,"dcPriceMax":null,"ultraPrice":11.9,"ultraPriceMax":null,"website":"https://gcharge.com.tr","note":null},
  {"operator":"GIOEV","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":12.48,"dcPriceMax":null,"ultraPrice":12.48,"ultraPriceMax":null,"website":null,"note":null},
  {"operator":"JetŞarj","aliases":[],"acPrice":8.29,"acPriceMax":null,"dcPrice":11.29,"dcPriceMax":null,"ultraPrice":11.29,"ultraPriceMax":null,"website":"https://jetsarj.com.tr","note":null},
  {"operator":"K-ŞARJ","aliases":[],"acPrice":7.9,"acPriceMax":null,"dcPrice":9.5,"dcPriceMax":null,"ultraPrice":9.9,"ultraPriceMax":null,"website":null,"note":"Sınır: 80 kW"},
  {"operator":"Lumicle","aliases":[],"acPrice":8.49,"acPriceMax":null,"dcPrice":11.49,"dcPriceMax":null,"ultraPrice":11.49,"ultraPriceMax":null,"website":null,"note":null},
  {"operator":"Magicline","aliases":[],"acPrice":8.2,"acPriceMax":null,"dcPrice":9.9,"dcPriceMax":null,"ultraPrice":9.9,"ultraPriceMax":null,"website":"https://magiclinesarj.com","note":null},
  {"operator":"Miggo (Migros)","aliases":["Migros"],"acPrice":9.5,"acPriceMax":null,"dcPrice":12.5,"dcPriceMax":null,"ultraPrice":null,"ultraPriceMax":null,"website":null,"note":null},
  {"operator":"Multiforce","aliases":[],"acPrice":7,"acPriceMax":null,"dcPrice":10.9,"dcPriceMax":null,"ultraPrice":10.9,"ultraPriceMax":null,"website":"https://multiforce.com.tr","note":null},
  {"operator":"Obişarj","aliases":[],"acPrice":9.9,"acPriceMax":null,"dcPrice":12.96,"dcPriceMax":null,"ultraPrice":12.96,"ultraPriceMax":null,"website":"https://obisarj.com.tr","note":null},
  {"operator":"Onlife","aliases":[],"acPrice":5.79,"acPriceMax":null,"dcPrice":8.49,"dcPriceMax":null,"ultraPrice":8.49,"ultraPriceMax":null,"website":"https://onlife.com.tr","note":null},
  {"operator":"otojet","aliases":[],"acPrice":8.99,"acPriceMax":9.49,"dcPrice":11.99,"dcPriceMax":null,"ultraPrice":11.99,"ultraPriceMax":null,"website":"https://otojet.com.tr","note":"AC: 7.5/11/22 kW"},
  {"operator":"Otopriz","aliases":[],"acPrice":9.9,"acPriceMax":null,"dcPrice":12.5,"dcPriceMax":null,"ultraPrice":12.5,"ultraPriceMax":null,"website":"https://otopriz.com.tr","note":"DC ≥ 30 kW"},
  {"operator":"Ovolt","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":9.99,"dcPriceMax":null,"ultraPrice":11.49,"ultraPriceMax":null,"website":null,"note":"Sınır: 60 kW"},
  {"operator":"otoWATT","aliases":[],"acPrice":7.99,"acPriceMax":9.99,"dcPrice":11.49,"dcPriceMax":null,"ultraPrice":12.49,"ultraPriceMax":null,"website":"https://otowatt.com.tr","note":"Site içi/dışı farkı"},
  {"operator":"Porty","aliases":[],"acPrice":8.4,"acPriceMax":null,"dcPrice":8.75,"dcPriceMax":null,"ultraPrice":9.9,"ultraPriceMax":null,"website":"https://porty.com.tr","note":"Sınır: 60 kW"},
  {"operator":"Q Charge","aliases":[],"acPrice":9.95,"acPriceMax":null,"dcPrice":13.78,"dcPriceMax":null,"ultraPrice":15.36,"ultraPriceMax":null,"website":"https://qcharge.com.tr/","note":"Sınır: 150 kW"},
  {"operator":"Reşarj","aliases":[],"acPrice":7.79,"acPriceMax":null,"dcPrice":10.79,"dcPriceMax":null,"ultraPrice":10.79,"ultraPriceMax":null,"website":"https://resarj.com.tr","note":null},
  {"operator":"ŞARJON","aliases":[],"acPrice":9.99,"acPriceMax":null,"dcPrice":11.99,"dcPriceMax":null,"ultraPrice":13.19,"ultraPriceMax":null,"website":"https://sarjon.com.tr/","note":null},
  {"operator":"Şarj Mahal","aliases":[],"acPrice":8.4,"acPriceMax":null,"dcPrice":8.49,"dcPriceMax":null,"ultraPrice":11.84,"ultraPriceMax":null,"website":"https://sarjmahal.com.tr","note":"Sınır: 60 kW (8.49₺)"},
  {"operator":"Solarşarj","aliases":[],"acPrice":8.69,"acPriceMax":12.99,"dcPrice":9.89,"dcPriceMax":15.49,"ultraPrice":9.89,"ultraPriceMax":15.49,"website":null,"note":"Sokete göre"},
  {"operator":"Spark","aliases":[],"acPrice":8.39,"acPriceMax":null,"dcPrice":9.39,"dcPriceMax":null,"ultraPrice":9.39,"ultraPriceMax":null,"website":"https://sparksarj.com","note":null},
  {"operator":"Swapp","aliases":[],"acPrice":6.9,"acPriceMax":null,"dcPrice":6.9,"dcPriceMax":null,"ultraPrice":6.9,"ultraPriceMax":null,"website":"https://swapp.com.tr","note":null},
  {"operator":"TEDY","aliases":[],"acPrice":7.8,"acPriceMax":null,"dcPrice":9.9,"dcPriceMax":null,"ultraPrice":7.9,"ultraPriceMax":null,"website":null,"note":"200-360 kW (7.90₺)"},
  {"operator":"tunçmatik CHARGE","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":9.5,"dcPriceMax":null,"ultraPrice":11.5,"ultraPriceMax":null,"website":null,"note":"Eco mod: 9.50 TL"},
  {"operator":"Vale","aliases":[],"acPrice":8.99,"acPriceMax":null,"dcPrice":12.99,"dcPriceMax":null,"ultraPrice":12.99,"ultraPriceMax":null,"website":"https://valesarj.com.tr","note":null},
  {"operator":"VOLTGO","aliases":[],"acPrice":6.99,"acPriceMax":null,"dcPrice":9.75,"dcPriceMax":null,"ultraPrice":9.75,"ultraPriceMax":null,"website":"https://voltgo.com.tr","note":null},
  {"operator":"VoltiNET","aliases":[],"acPrice":9.99,"acPriceMax":null,"dcPrice":12.99,"dcPriceMax":null,"ultraPrice":12.99,"ultraPriceMax":null,"website":null,"note":null},
  {"operator":"Voltla","aliases":[],"acPrice":8.49,"acPriceMax":null,"dcPrice":11.99,"dcPriceMax":null,"ultraPrice":11.99,"ultraPriceMax":null,"website":"https://voltla.com","note":null},
  {"operator":"Vzx Şarj (Vizyoneks)","aliases":["Vizyoneks","Vzx"],"acPrice":8,"acPriceMax":null,"dcPrice":12,"dcPriceMax":null,"ultraPrice":12,"ultraPriceMax":null,"website":null,"note":null},
  {"operator":"WAT Mobilite","aliases":[],"acPrice":9.99,"acPriceMax":null,"dcPrice":12.99,"dcPriceMax":null,"ultraPrice":14.49,"ultraPriceMax":null,"website":"https://www.watmobilite.com/","note":"Sınır: 180 kW"},
  {"operator":"Zeplin Enerji","aliases":[],"acPrice":8.5,"acPriceMax":null,"dcPrice":null,"dcPriceMax":null,"ultraPrice":10.3,"ultraPriceMax":null,"website":null,"note":"> 60 kW DC"}];
