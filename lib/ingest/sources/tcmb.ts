import { prisma } from "@/lib/prisma";
import { fetchText } from "../http";
import { extractBlocks, tagText } from "../xml";
import { emptyStats, type IngestContext, type IngestResult, type SourceJob } from "../types";

const TCMB_TODAY = "https://www.tcmb.gov.tr/kurlar/today.xml";

/** Şeritte gösterilecek kurlar. `order` şerit sırasını belirler. */
const WANTED = [
  { code: "USD", label: "DOLAR", order: 0 },
  { code: "EUR", label: "EURO", order: 1 },
  { code: "GBP", label: "STERLİN", order: 2 },
];

function parseTrNumber(raw: string) {
  // TCMB XML'i ondalık ayırıcı olarak nokta kullanır: "41.8342"
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatTry(n: number) {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

/**
 * TCMB günlük döviz kurları.
 * Resmî, ücretsiz, anahtar gerektirmez. Hafta sonu/tatilde TCMB yeni bülten
 * yayınlamaz; bu durumda son bülten aynen döner ve kayıtlar "skipped" sayılır.
 */
async function run({ source }: IngestContext): Promise<IngestResult> {
  const stats = emptyStats();
  const notes: string[] = [];

  const xml = await fetchText(source.endpoint || TCMB_TODAY, { timeoutMs: 12_000 });
  const blocks = extractBlocks(xml, "Currency");

  if (!blocks.length) {
    throw new Error("TCMB yanıtında Currency bloğu bulunamadı (format değişmiş olabilir)");
  }

  for (const { code, label, order } of WANTED) {
    stats.fetched++;

    const block = blocks.find((b) => new RegExp(`Kod="${code}"`, "i").test(b));
    if (!block) {
      stats.failed++;
      notes.push(`${code} bültende yok`);
      continue;
    }

    const rate = parseTrNumber(tagText(block, "ForexSelling", "BanknoteSelling"));
    if (!rate) {
      stats.failed++;
      notes.push(`${code} kuru okunamadı`);
      continue;
    }

    const key = code.toLowerCase();
    const existing = await prisma.ticker.findFirst({ where: { key } });

    // Değişim yüzdesi bir önceki kayıtlı değere göre hesaplanır.
    const previous = existing ? parseTrNumber(existing.value) : null;
    const changePct =
      previous && previous > 0 ? ((rate - previous) / previous) * 100 : (existing?.changePct ?? 0);

    const value = formatTry(rate);
    if (existing && existing.value === value) {
      stats.skipped++;
      continue;
    }

    const data = {
      label,
      value,
      unit: "₺",
      changePct: Number(changePct.toFixed(2)),
      order,
      key,
      source: "tcmb",
      fetchedAt: new Date(),
    };

    if (existing) {
      await prisma.ticker.update({ where: { id: existing.id }, data });
      stats.updated++;
    } else {
      await prisma.ticker.create({ data });
      stats.created++;
    }
  }

  return { ...stats, notes };
}

export const tcmbSource: SourceJob = {
  key: "tcmb",
  name: "TCMB Döviz Kurları",
  kind: "fx",
  schedule: "0 6 * * 1-5",
  endpoint: TCMB_TODAY,
  attribution: "Kaynak: TCMB",
  run,
};
