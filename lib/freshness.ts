import { prisma } from "./prisma";

/**
 * VERİ TAZELİĞİ DENETİMİ
 *
 * Cron her gün çalışıyor olabilir ama bu tek başına "veri güncel" demek
 * değildir: bir besleme sessizce boş dönebilir, bir anahtar süresi dolabilir,
 * ya da hiçbir cron'un dokunmadığı bir veri kümesi (araç kataloğu, operatör
 * tarifeleri) aylarca eskiyebilir. Buradaki denetim her veri kümesine tek tek
 * "en son ne zaman tazelendin?" diye sorar ve eşiği aşanı işaretler.
 *
 * Eşikler cron sıklığından TÜRETİLİR, tahmin değildir: günlük çalışan bir iş
 * için 36 saat (bir çalışma atlanabilir), haftalık iş için 10 gün.
 *
 * `auto: false` olan kümeler hiçbir cron tarafından tazelenmez — bunlar için
 * eşik "operatörün elle güncellemesi gereken süre"dir.
 */

export type HealthStatus = "fresh" | "stale" | "unknown";

export type DatasetHealth = {
  key: string;
  label: string;
  /** Kümenin en son tazelendiği an. Hiç kayıt yoksa null. */
  updatedAt: Date | null;
  ageHours: number | null;
  maxAgeHours: number;
  status: HealthStatus;
  /** Cron tazeliyor mu, yoksa elle mi girilmesi gerekiyor? */
  auto: boolean;
  /** Bayatsa operatörün ne yapması gerektiği. */
  action: string;
};

const HOUR = 60 * 60 * 1000;

/**
 * TCMB yalnızca iş günleri kur yayımlar; cuma akşamından pazartesi sabahına
 * kadar 60+ saat geçer. Eşik bu tatili kapsayacak kadar geniş tutuldu, yoksa
 * her hafta sonu yanlış alarm üretirdi.
 */
const FX_MAX_AGE = 96;

type Probe = {
  key: string;
  label: string;
  maxAgeHours: number;
  auto: boolean;
  action: string;
  read: () => Promise<Date | null>;
};

const PROBES: Probe[] = [
  {
    key: "articles",
    label: "Haberler",
    maxAgeHours: 36,
    auto: true,
    action: "/admin/kaynaklar → beslemeleri elle çalıştırın; OPENAI_API_KEY süresi dolmuş olabilir",
    read: async () => {
      const a = await prisma.article.findFirst({
        where: { ingestedAt: { not: null } },
        orderBy: { ingestedAt: "desc" },
        select: { ingestedAt: true },
      });
      return a?.ingestedAt ?? null;
    },
  },
  {
    key: "fx",
    label: "Döviz kurları (TCMB)",
    maxAgeHours: FX_MAX_AGE,
    auto: true,
    action: "/api/cron/fx ucunu elle tetikleyin",
    read: async () => {
      const t = await prisma.ticker.findFirst({
        where: { source: "tcmb" },
        orderBy: { fetchedAt: "desc" },
        select: { fetchedAt: true },
      });
      return t?.fetchedAt ?? null;
    },
  },
  {
    key: "stations",
    label: "Şarj istasyonları (Open Charge Map)",
    // Haftalık iş: 168 saat + bir çalışma atlanma payı.
    maxAgeHours: 240,
    auto: true,
    action: "OPENCHARGEMAP_API_KEY geçerli mi kontrol edin, /api/cron/stations tetikleyin",
    read: async () => {
      const s = await prisma.dataSource.findFirst({
        where: { key: "openchargemap" },
        select: { lastOkAt: true },
      });
      return s?.lastOkAt ?? null;
    },
  },
  {
    key: "prices",
    label: "Fiyat endeksi ve göstergeler",
    maxAgeHours: 36,
    auto: true,
    action: "/api/cron/prices ucunu elle tetikleyin",
    read: async () => {
      const p = await prisma.priceIndex.findFirst({
        orderBy: { fetchedAt: "desc" },
        select: { fetchedAt: true },
      });
      return p?.fetchedAt ?? null;
    },
  },
  {
    key: "tariffs",
    label: "Şarj operatörü tarifeleri",
    // Operatörler tarifelerini ayda bir mertebesinde değiştiriyor.
    maxAgeHours: 30 * 24,
    auto: false,
    action: "Tarifeleri doğrulayıp `npm run db:tariffs` çalıştırın veya /admin/tarifeler'den güncelleyin",
    read: async () => {
      const t = await prisma.operatorTariff.findFirst({
        orderBy: { verifiedAt: "desc" },
        select: { verifiedAt: true },
      });
      return t?.verifiedAt ?? null;
    },
  },
  {
    key: "vehicles",
    label: "Araç kataloğu",
    // Marka fiyat listeleri aylık güncelleniyor; 45 gün üstü kesin bayattır.
    maxAgeHours: 45 * 24,
    auto: false,
    action: "Marka fiyat listelerinden kataloğu güncelleyin (/admin/araclar)",
    read: async () => {
      const v = await prisma.vehicle.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      });
      return v?.createdAt ?? null;
    },
  },
];

export async function checkFreshness(): Promise<DatasetHealth[]> {
  const now = Date.now();

  return Promise.all(
    PROBES.map(async ({ read, ...probe }) => {
      const updatedAt = await read();
      const ageHours =
        updatedAt != null ? Math.round(((now - updatedAt.getTime()) / HOUR) * 10) / 10 : null;

      return {
        ...probe,
        updatedAt,
        ageHours,
        // Zaman damgası hiç yoksa "bayat" demek yanlış olur — ölçemiyoruz.
        status:
          ageHours == null
            ? ("unknown" as const)
            : ageHours > probe.maxAgeHours
              ? ("stale" as const)
              : ("fresh" as const),
      };
    }),
  );
}

/** Tek satırlık özet — cron yanıtında ve panelde kullanılır. */
export function summarize(report: DatasetHealth[]) {
  const stale = report.filter((r) => r.status === "stale");
  const unknown = report.filter((r) => r.status === "unknown");
  return {
    ok: stale.length === 0,
    stale: stale.map((r) => r.key),
    unknown: unknown.map((r) => r.key),
  };
}
