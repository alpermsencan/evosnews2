import { prisma } from "@/lib/prisma";
import { emptyStats, type IngestContext, type IngestResult, type SourceJob } from "../types";
import { tierSummary } from "../../tariffs";

/**
 * PAZAR GÖSTERGELERİ — TÜRETİLMİŞ VERİ
 *
 * Bu iş dışarıdan veri çekmez: sitedeki GERÇEK kayıtlardan (araç kataloğu ve
 * şarj istasyonu envanteri) sayaç üretir. Böylece şeritteki her rakamın
 * arkasında sayfada görülebilen bir kayıt kümesi olur.
 *
 * Kaynağı olmayan piyasa göstergeleri (batarya $/kWh, EV pazar payı, benzinli
 * ortalama fiyat) burada ÜRETİLMEZ; bunlar için ücretsiz ve güvenilir bir veri
 * kaynağı yok, uydurmak yerine boş bırakılırlar.
 */

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** Şeritte türetilmiş göstergelerin kur satırlarından sonra gelmesi için. */
const TICKER_ORDER_BASE = 10;

type Row = {
  key: string;
  label: string;
  value: string;
  unit: string | null;
  order: number;
};

const trNumber = (n: number, digits = 0) =>
  n.toLocaleString("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

async function upsertTicker(row: Row, stats: ReturnType<typeof emptyStats>) {
  stats.fetched++;

  const existing = await prisma.ticker.findFirst({ where: { key: row.key } });

  if (existing?.value === row.value) {
    stats.skipped++;
    return;
  }

  // Değişim yüzdesi bir önceki kayıtlı değere göre hesaplanır.
  const parse = (v: string) => Number(v.replace(/\./g, "").replace(",", "."));
  const previous = existing ? parse(existing.value) : null;
  const current = parse(row.value);
  const changePct =
    previous && previous > 0 && Number.isFinite(current)
      ? Number((((current - previous) / previous) * 100).toFixed(2))
      : 0;

  const data = { ...row, changePct, source: "katalog", fetchedAt: new Date() };

  if (existing) {
    await prisma.ticker.update({ where: { id: existing.id }, data });
    stats.updated++;
  } else {
    await prisma.ticker.create({ data });
    stats.created++;
  }
}

async function run(_ctx: IngestContext): Promise<IngestResult> {
  const stats = emptyStats();
  const notes: string[] = [];

  const [vehicles, stationAgg, stationCount, fastCount, tariffs] = await Promise.all([
    prisma.vehicle.findMany({ select: { price: true, rangeKm: true } }),
    prisma.chargeStation.aggregate({ _sum: { socketCount: true } }),
    prisma.chargeStation.count(),
    prisma.chargeStation.count({ where: { isFast: true } }),
    prisma.operatorTariff.findMany({ where: { isActive: true } }),
  ]);

  const rows: Row[] = [];

  // Şarj maliyeti: operatörlerin ilan ettiği tarifelerin ORTANCASI.
  // Ortalama değil ortanca — tek bir operatörün yüksek sabit tarifesi
  // "tipik fiyat"ı yanıltacak kadar yukarı çekiyor. Tarife girilmemişse
  // gösterge hiç üretilmez, uydurma bir sayı yazılmaz.
  const acMedian = tierSummary(tariffs, "ac")?.median ?? null;
  const dcMedian = tierSummary(tariffs, "dc")?.median ?? null;

  // --- Araç kataloğundan türetilenler ---
  if (vehicles.length > 0) {
    const avgPrice = Math.round(
      vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length,
    );
    const avgRange = Math.round(
      vehicles.reduce((sum, v) => sum + v.rangeKm, 0) / vehicles.length,
    );

    rows.push(
      {
        key: "ev-avg-price",
        label: "EV ORT. FİYAT",
        value: trNumber(avgPrice),
        unit: "₺",
        order: TICKER_ORDER_BASE,
      },
      {
        key: "ev-avg-range",
        label: "ORT. MENZİL",
        value: trNumber(avgRange),
        unit: "km",
        order: TICKER_ORDER_BASE + 1,
      },
      {
        key: "ev-model-count",
        label: "KATALOG",
        value: trNumber(vehicles.length),
        unit: "model",
        order: TICKER_ORDER_BASE + 2,
      },
    );
  } else {
    notes.push("Araç kataloğu boş — fiyat/menzil göstergeleri üretilmedi");
  }

  // --- Şarj envanterinden türetilenler ---
  if (stationCount > 0) {
    rows.push(
      {
        key: "station-count",
        label: "ŞARJ NOKTASI",
        value: trNumber(stationCount),
        unit: "adet",
        order: TICKER_ORDER_BASE + 3,
      },
      {
        key: "socket-count",
        label: "TOPLAM SOKET",
        value: trNumber(stationAgg._sum.socketCount ?? 0),
        unit: "adet",
        order: TICKER_ORDER_BASE + 4,
      },
      {
        key: "fast-station-count",
        label: "HIZLI ŞARJ",
        value: trNumber(fastCount),
        unit: "nokta",
        order: TICKER_ORDER_BASE + 5,
      },
    );
  } else {
    notes.push("Şarj envanteri boş — istasyon göstergeleri üretilmedi");
  }

  // --- Operatör tarifelerinden türetilenler ---
  if (acMedian != null || dcMedian != null) {
    if (acMedian != null) {
      rows.push({
        key: "ac-charge-cost",
        label: "AC ŞARJ",
        value: trNumber(acMedian, 2),
        unit: "₺/kWh",
        order: TICKER_ORDER_BASE + 6,
      });
    }
    if (dcMedian != null) {
      rows.push({
        key: "dc-charge-cost",
        label: "DC ŞARJ",
        value: trNumber(dcMedian, 2),
        unit: "₺/kWh",
        order: TICKER_ORDER_BASE + 7,
      });
    }
  } else {
    notes.push("Operatör tarifesi yok — şarj maliyeti göstergeleri üretilmedi");
  }

  for (const row of rows) await upsertTicker(row, stats);

  // --- Aylık fiyat endeksi anlık görüntüsü ---
  if (vehicles.length > 0) {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const avgEvPrice = Math.round(
      vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length,
    );
    const avgRangeKm = Math.round(
      vehicles.reduce((sum, v) => sum + v.rangeKm, 0) / vehicles.length,
    );

    const snapshot = {
      month: TR_MONTHS[now.getMonth()].slice(0, 3),
      // Kronolojik sıralama için ay sayısı; yıl dönümünde de artmaya devam eder.
      order: now.getFullYear() * 12 + now.getMonth(),
      avgEvPrice,
      avgRangeKm,
      modelCount: vehicles.length,
      // Kaynağı olmayan alanlar (batarya $/kWh, EV pazar payı) boş kalır;
      // şarj maliyeti ise doğrulanmış operatör tarifelerinden gelir.
      acChargeCost: acMedian,
      dcChargeCost: dcMedian,
      source: "katalog",
      fetchedAt: new Date(),
    };

    await prisma.priceIndex.upsert({
      where: { period },
      update: snapshot,
      create: { period, ...snapshot },
    });
    stats.fetched++;
    stats.updated++;
  }

  return { ...stats, notes };
}

export const marketStatsSource: SourceJob = {
  key: "market-stats",
  name: "Pazar Göstergeleri (katalogdan türetilmiş)",
  kind: "prices",
  schedule: "0 4 * * *",
  attribution: "Evos kataloğu ve şarj envanterinden hesaplanmıştır",
  run,
};
