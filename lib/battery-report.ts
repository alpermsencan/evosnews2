/**
 * BATARYA RAPORU — KALAN ÖMÜR VE RİSK HESABI
 *
 * Rapora yalnızca ÖLÇÜLEN değerler girilir (SOH, çevrim sayısı, DC şarj oranı,
 * kilometre). Kalan ömür ve risk seviyesi bu ölçümlerden BURADA hesaplanır;
 * ekspertizin ya da satıcının bu iki alanı elle yazması mümkün değildir —
 * yoksa "risk: düşük" her raporda yazardı ve hiçbir şey ifade etmezdi.
 *
 * MODELİN SINIRI AÇIKÇA BELİRTİLİR: bu bir tahmindir, garanti değildir.
 * Doğrusal bozulma varsayar; gerçekte bozulma eğrisi ilk yıllarda daha hızlı,
 * sonra yavaşlar. Bu yüzden sonuç yıl olarak KABA verilir (yarım yıl adımlı)
 * ve arayüzde "tahmini" ibaresiyle gösterilir.
 */

/** Üretici garantilerinin genel alt sınırı; bunun altı "değişim" bölgesidir. */
export const EOL_SOH = 70;

/** Tipik bir EV bataryası yılda ~%2 kapasite kaybeder (ortalama kullanım). */
const BASE_DEGRADATION_PER_YEAR = 2;

export type BatteryMeasurement = {
  sohPercent: number;
  cycleCount?: number | null;
  /** Toplam şarjın yüzde kaçı DC hızlı şarj (0-100). */
  fastChargeRatio?: number | null;
  odometerKm?: number | null;
  /** Aracın model yılı — yaşa bağlı bozulma hızını düzeltmek için. */
  vehicleYear?: number | null;
};

export type BatteryAssessment = {
  estimatedYearsLeft: number | null;
  riskLevel: "DUSUK" | "ORTA" | "YUKSEK" | null;
  /** Hesabın nasıl yapıldığının insan tarafından okunabilir özeti. */
  rationale: string[];
};

/**
 * Yıllık bozulma hızı. Ölçülen SOH ve aracın yaşı biliniyorsa GERÇEKLEŞEN
 * hız kullanılır; bilinmiyorsa tipik değere düşülür.
 */
function degradationPerYear(m: BatteryMeasurement) {
  const year = m.vehicleYear;
  if (year) {
    const age = new Date().getFullYear() - year;
    if (age >= 2) {
      // Aracın kendi geçmişinden ölçülen gerçek hız — tahminden iyidir.
      const observed = (100 - m.sohPercent) / age;
      // Uç değerleri kırp: 1 yıllık ölçüm hatası tahmini uçurmasın.
      return Math.max(0.5, Math.min(8, observed));
    }
  }

  // Hızlı şarj yoğunluğu bozulmayı hızlandırır.
  const ratio = m.fastChargeRatio;
  if (ratio == null) return BASE_DEGRADATION_PER_YEAR;
  return BASE_DEGRADATION_PER_YEAR * (1 + (ratio / 100) * 0.6);
}

export function assessBattery(m: BatteryMeasurement): BatteryAssessment {
  const rationale: string[] = [];

  if (!Number.isFinite(m.sohPercent) || m.sohPercent <= 0 || m.sohPercent > 100) {
    return { estimatedYearsLeft: null, riskLevel: null, rationale: ["Geçersiz SOH ölçümü"] };
  }

  const rate = degradationPerYear(m);
  const usedObserved = m.vehicleYear != null && new Date().getFullYear() - m.vehicleYear >= 2;

  rationale.push(
    usedObserved
      ? `Yıllık kapasite kaybı aracın kendi geçmişinden ölçüldü: ~%${rate.toFixed(1)}/yıl`
      : `Yıllık kapasite kaybı tipik değerden alındı: ~%${rate.toFixed(1)}/yıl`,
  );

  // %70'e (garanti/değişim sınırı) kaç yıl kaldı?
  const headroom = m.sohPercent - EOL_SOH;
  const years = headroom <= 0 ? 0 : headroom / rate;
  // Yarım yıl adımına yuvarla — hassasiyet iddiası taşımasın.
  const estimatedYearsLeft = Math.round(years * 2) / 2;

  rationale.push(
    headroom <= 0
      ? `SOH %${m.sohPercent} — %${EOL_SOH} değişim sınırının altında`
      : `%${EOL_SOH} sınırına ${estimatedYearsLeft} yıl (kalan pay: %${headroom.toFixed(1)})`,
  );

  // --- Risk seviyesi ---
  // Tek bir eşik yerine birden çok sinyal: SOH seviyesi, kalan ömür ve
  // hızlı şarj alışkanlığı birlikte değerlendirilir.
  let risk: BatteryAssessment["riskLevel"] = "DUSUK";

  if (m.sohPercent < 80 || estimatedYearsLeft < 3) {
    risk = "YUKSEK";
  } else if (m.sohPercent < 88 || estimatedYearsLeft < 6) {
    risk = "ORTA";
  }

  if (m.fastChargeRatio != null && m.fastChargeRatio > 70 && risk === "DUSUK") {
    // Bugün sağlıklı ama kullanım profili bozulmayı hızlandırıyor.
    risk = "ORTA";
    rationale.push(`Şarjların %${m.fastChargeRatio}'i DC hızlı şarj — bozulma hızlanır`);
  }

  if (m.cycleCount != null) {
    rationale.push(`${m.cycleCount.toLocaleString("tr-TR")} tam şarj çevrimi`);
  }

  rationale.push("Tahmindir; doğrusal bozulma varsayar ve garanti niteliği taşımaz.");

  return { estimatedYearsLeft, riskLevel: risk, rationale };
}

export const RISK_LABEL: Record<string, string> = {
  DUSUK: "Düşük risk",
  ORTA: "Orta risk",
  YUKSEK: "Yüksek risk",
};

export function riskTone(level?: string | null) {
  if (level === "DUSUK") return "bg-volt text-white";
  if (level === "ORTA") return "bg-amber-500 text-white";
  if (level === "YUKSEK") return "bg-evos text-white";
  return "bg-neutral-200 text-neutral-600";
}
