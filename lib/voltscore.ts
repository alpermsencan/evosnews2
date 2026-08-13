/**
 * VOLTSCORE — ELEKTRİKLİ ARAÇ GÜVEN PUANI (0-100)
 *
 * İkinci el elektrikli araçta alıcının asıl sorusu "bu araç kaç km yaptı"
 * değil, "bataryası ne durumda ve nasıl kullanılmış" sorusudur. VoltScore bu
 * soruyu tek bir karşılaştırılabilir sayıya indirger.
 *
 * TASARIM KARARLARI
 *
 * 1. Puan SUNUCUDA hesaplanır ve her araca AYNI formül uygulanır. İstemciye
 *    hesaplatmak, puanı pazarlık malzemesi yapardı.
 *
 * 2. EKSİK KRİTER UYDURULMAZ. Bir kriterin verisi yoksa o kriter puanlamaya
 *    hiç girmez ve ağırlığı kalan kriterlere ORANTILI dağıtılır. Alternatifi
 *    (eksik kritere ortalama puan vermek) bilinmeyen bir aracı bilinen gibi
 *    gösterirdi; bu, sistemin tüm amacını bozar.
 *
 * 3. Bunun karşılığında `coverage` döndürülür: puanın kaç kriterin kaç
 *    yüzdesiyle hesaplandığı. %40 kapsamla çıkan 95 puan ile %100 kapsamla
 *    çıkan 95 puan aynı şey değildir ve arayüz bunu göstermek zorundadır.
 *
 * 4. Kapsam çok düşükse (< %35) puan HİÇ üretilmez — null döner. Üç kriterden
 *    hesaplanmış bir "güven puanı" güven vermez, yanıltır.
 */

export type ServiceHistory = "TAM" | "KISMI" | "YOK";
export type FastChargeHabit = "DUSUK" | "ORTA" | "YUKSEK";

export type VoltScoreInput = {
  /** Batarya raporundan gelen ölçülmüş SOH (%). */
  sohPercent?: number | null;
  km?: number | null;
  year?: number | null;
  fastChargeHabit?: FastChargeHabit | string | null;
  warrantyMonthsLeft?: number | null;
  serviceHistory?: ServiceHistory | string | null;
  /** "Hasarsız" dışındaki her değer kayıt sayılır. */
  damage?: string | null;
  /** Kullanıcının bildirdiği gerçek menzil. */
  realRangeKm?: number | null;
  /** Katalogdaki ilan edilen menzil — uyum oranı için. */
  catalogRangeKm?: number | null;
};

export type Criterion = {
  key: string;
  label: string;
  /** Toplam içindeki ağırlığı (%). */
  weight: number;
  /** 0-100 arası kriter puanı; veri yoksa null. */
  score: number | null;
  /** Kullanıcıya gösterilecek ham değer ("%92", "48.000 km"). */
  display: string;
};

export type VoltScoreResult = {
  score: number | null;
  /** Puanın hesaplandığı ağırlık toplamı (%). */
  coverage: number;
  grade: string;
  criteria: Criterion[];
};

/** Ağırlıklar toplamı 100'dür. */
const WEIGHTS = {
  battery: 30,
  kmAge: 15,
  fastCharge: 15,
  accident: 12,
  warranty: 10,
  service: 10,
  rangeMatch: 8,
} as const;

/** Bu kapsamın altında puan üretilmez. */
const MIN_COVERAGE = 35;

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Yıllık ortalama kilometre. Türkiye'de bir otomobil yılda ~15.000 km yapar;
 * bunun altı puan kazandırır, üstü kaybettirir.
 */
const KM_PER_YEAR_NORMAL = 15_000;

function batteryScore(soh?: number | null) {
  if (soh == null) return null;
  // %100 SOH = 100 puan, %70 = 0 puan. %70 altı zaten garanti sınırıdır ve
  // aracın modül değişimine ihtiyacı olduğu anlamına gelir.
  return clamp(((soh - 70) / 30) * 100);
}

function kmAgeScore(km?: number | null, year?: number | null) {
  if (km == null || year == null) return null;
  const age = Math.max(1, new Date().getFullYear() - year);
  const perYear = km / age;
  // Yılda 15.000 km beklenen; 5.000 km/yıl tam puan, 30.000 km/yıl sıfır.
  return clamp(((30_000 - perYear) / 25_000) * 100);
}

function fastChargeScore(habit?: string | null) {
  if (!habit) return null;
  // Sürekli DC hızlı şarj batarya ömrünü kısaltır; AC ağırlıklı kullanım korur.
  const table: Record<string, number> = { DUSUK: 100, ORTA: 65, YUKSEK: 30 };
  return table[habit] ?? null;
}

function accidentScore(damage?: string | null) {
  if (!damage) return null;
  const d = damage.toLocaleLowerCase("tr-TR");
  if (d.includes("hasarsız")) return 100;
  if (d.includes("boyalı") || d.includes("lokal")) return 70;
  if (d.includes("değişen")) return 40;
  if (d.includes("ağır") || d.includes("pert")) return 0;
  return 50;
}

function warrantyScore(monthsLeft?: number | null) {
  if (monthsLeft == null) return null;
  // 60 ay ve üzeri kalan garanti tam puan; garantisi bitmiş araç sıfır.
  return clamp((monthsLeft / 60) * 100);
}

function serviceScore(history?: string | null) {
  if (!history) return null;
  const table: Record<string, number> = { TAM: 100, KISMI: 55, YOK: 15 };
  return table[history] ?? null;
}

function rangeMatchScore(real?: number | null, catalog?: number | null) {
  if (real == null || catalog == null || catalog <= 0) return null;
  // Gerçek menzilin katalog menziline oranı. %85 ve üzeri tam puan —
  // WLTP'nin altında kalmak normaldir, aşırı sapma bataryayı işaret eder.
  const ratio = real / catalog;
  return clamp(((ratio - 0.5) / 0.35) * 100);
}

export function calculateVoltScore(input: VoltScoreInput): VoltScoreResult {
  const criteria: Criterion[] = [
    {
      key: "battery",
      label: "Batarya sağlığı",
      weight: WEIGHTS.battery,
      score: batteryScore(input.sohPercent),
      display: input.sohPercent != null ? `%${input.sohPercent}` : "—",
    },
    {
      key: "kmAge",
      label: "Km / yaş dengesi",
      weight: WEIGHTS.kmAge,
      score: kmAgeScore(input.km, input.year),
      display:
        input.km != null && input.year != null
          ? `${input.km.toLocaleString("tr-TR")} km · ${input.year}`
          : "—",
    },
    {
      key: "fastCharge",
      label: "Hızlı şarj kullanımı",
      weight: WEIGHTS.fastCharge,
      score: fastChargeScore(input.fastChargeHabit),
      display:
        { DUSUK: "Düşük", ORTA: "Orta", YUKSEK: "Yüksek" }[
          String(input.fastChargeHabit)
        ] ?? "—",
    },
    {
      key: "accident",
      label: "Kaza / değişen",
      weight: WEIGHTS.accident,
      score: accidentScore(input.damage),
      display: input.damage || "—",
    },
    {
      key: "warranty",
      label: "Garanti süresi",
      weight: WEIGHTS.warranty,
      score: warrantyScore(input.warrantyMonthsLeft),
      display:
        input.warrantyMonthsLeft != null ? `${input.warrantyMonthsLeft} ay kaldı` : "—",
    },
    {
      key: "service",
      label: "Servis geçmişi",
      weight: WEIGHTS.service,
      score: serviceScore(input.serviceHistory),
      display:
        { TAM: "Tam", KISMI: "Kısmi", YOK: "Yok" }[String(input.serviceHistory)] ?? "—",
    },
    {
      key: "rangeMatch",
      label: "Gerçek menzil uyumu",
      weight: WEIGHTS.rangeMatch,
      score: rangeMatchScore(input.realRangeKm, input.catalogRangeKm),
      display:
        input.realRangeKm != null && input.catalogRangeKm
          ? `${input.realRangeKm} / ${input.catalogRangeKm} km`
          : "—",
    },
  ];

  const known = criteria.filter((c) => c.score != null);
  const coverage = known.reduce((sum, c) => sum + c.weight, 0);

  if (coverage < MIN_COVERAGE) {
    return { score: null, coverage, grade: "Yetersiz veri", criteria };
  }

  // Ağırlıkları bilinen kriterler üzerinden yeniden normalize et.
  const weighted = known.reduce((sum, c) => sum + (c.score as number) * c.weight, 0);
  const score = Math.round(weighted / coverage);

  return { score, coverage, grade: gradeOf(score), criteria };
}

export function gradeOf(score: number) {
  if (score >= 90) return "Çok iyi";
  if (score >= 75) return "İyi";
  if (score >= 60) return "Orta";
  if (score >= 45) return "Zayıf";
  return "Riskli";
}

/** Puan rozetinin rengi — aynı eşikler her yerde kullanılsın diye tek yerde. */
export function scoreTone(score: number | null) {
  if (score == null) return { bg: "bg-neutral-200", text: "text-neutral-600" };
  if (score >= 90) return { bg: "bg-volt", text: "text-white" };
  if (score >= 75) return { bg: "bg-green-600", text: "text-white" };
  if (score >= 60) return { bg: "bg-amber-500", text: "text-white" };
  return { bg: "bg-evos", text: "text-white" };
}
