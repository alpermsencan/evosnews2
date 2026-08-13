/**
 * Coğrafi mesafe.
 *
 * Hem sunucuda (rota servisi erişilemediğinde kuş uçuşu mesafeye düşmek için)
 * hem tarayıcıda (istasyonları kullanıcının konumuna göre sıralamak için)
 * kullanılır — bu yüzden hiçbir Node/Next bağımlılığı yoktur.
 */

const EARTH_RADIUS_KM = 6371;

/** İki nokta arasındaki kuş uçuşu mesafe (km). */
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** "1,4 km" / "12 km" — yakın mesafede ondalık, uzakta gereksiz. */
export function formatKm(km: number) {
  return km < 10
    ? `${km.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`
    : `${Math.round(km).toLocaleString("tr-TR")} km`;
}
