/**
 * SAHİP OLMA MALİYETİ: VERGİ + KREDİ + ENERJİ
 *
 * Etiket fiyatı, elektrikli araçta ödenecek paranın yalnızca bir parçası.
 * Burada üç bileşen tek yerde hesaplanır:
 *
 *   1. Vergi   — ÖTV matrahtan, KDV ÖTV dâhil tutardan alınır (sıra önemli).
 *   2. Kredi   — eşit taksitli (annüite) kredi; toplam geri ödeme ve faiz.
 *   3. Enerji  — yıllık km ve tüketimden, gerçek şarj tarifesiyle.
 *
 * Hiçbir varsayılan oran uydurulmaz: ÖTV oranı aracın kendi kaydından, şarj
 * tarifesi operatörlerin ilan ettiği fiyatlardan gelir. Kredi faizi kullanıcı
 * girdisidir — bankaya göre değişir ve tahmin edilemez.
 */

export type TaxInput = {
  /** ÖTV matrahı (vergisiz satış bedeli). */
  base: number;
  otvRate: number;
  kdvRate?: number;
};

export const KDV_RATE = 20;

export function calculateTax({ base, otvRate, kdvRate = KDV_RATE }: TaxInput) {
  const otv = base * (otvRate / 100);
  // KDV, ÖTV DÂHİL tutar üzerinden hesaplanır — vergi üstüne vergi.
  const kdvBase = base + otv;
  const kdv = kdvBase * (kdvRate / 100);
  return {
    base,
    otv,
    kdv,
    total: base + otv + kdv,
    /** Etiket fiyatının yüzde kaçı vergi? */
    taxShare: ((otv + kdv) / (base + otv + kdv)) * 100,
  };
}

export type LoanInput = {
  /** Kredi tutarı (peşinat düşülmüş). */
  principal: number;
  /** Aylık faiz oranı (%). Bankalar bu şekilde ilan eder. */
  monthlyRate: number;
  months: number;
};

/**
 * Eşit taksitli (annüite) kredi.
 * Faiz sıfırsa formül 0'a bölmeye düşer; o durumda anapara eşit bölünür.
 */
export function calculateLoan({ principal, monthlyRate, months }: LoanInput) {
  if (principal <= 0 || months <= 0) {
    return { installment: 0, total: 0, interest: 0 };
  }

  const r = monthlyRate / 100;
  const installment =
    r === 0
      ? principal / months
      : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  const total = installment * months;
  return { installment, total, interest: total - principal };
}

export type EnergyInput = {
  /** Yıllık kilometre. */
  annualKm: number;
  /** kWh/100km */
  consumption: number;
  /** Şarjın yüzde kaçı evde yapılıyor (0-100)? */
  homeSharePct: number;
  /** ₺/kWh — ev tarifesi. */
  homePrice: number;
  /** ₺/kWh — halka açık DC tarifesi. */
  publicPrice: number;
};

export function calculateEnergy({
  annualKm,
  consumption,
  homeSharePct,
  homePrice,
  publicPrice,
}: EnergyInput) {
  const kwh = (annualKm * consumption) / 100;
  const homeShare = Math.min(100, Math.max(0, homeSharePct)) / 100;
  const blended = homePrice * homeShare + publicPrice * (1 - homeShare);

  return {
    annualKwh: kwh,
    blendedPrice: blended,
    annualCost: kwh * blended,
    monthlyCost: (kwh * blended) / 12,
    per100Km: consumption * blended,
  };
}
