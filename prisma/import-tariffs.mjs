/**
 * Şarj operatörü tarifelerini veritabanına aktarır.
 *
 *   node --env-file=.env prisma/import-tariffs.mjs        # ekle / güncelle
 *   node --env-file=.env prisma/import-tariffs.mjs --dry  # prova
 *
 * İdempotenttir: operatör adı anahtar olarak kullanılır, tekrar çalıştırmak
 * kayıt çoğaltmaz. Panelden ELLE düzenlenmiş satırların üzerine yazmaz —
 * `source` alanı "manuel" ise o kayıt atlanır, çünkü operatörden doğrudan
 * teyit edilmiş bir fiyat, derleme verisinden daha güvenilirdir.
 */

import { PrismaClient } from "@prisma/client";
import {
  tariffs,
  TARIFFS_SOURCE,
  TARIFFS_SOURCE_URL,
  TARIFFS_VERIFIED_AT,
} from "./tariffs.data.mjs";

const prisma = new PrismaClient();
const dry = process.argv.includes("--dry");

function slugify(text) {
  const map = { ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i", ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u" };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

async function main() {
  const verifiedAt = new Date(`${TARIFFS_VERIFIED_AT}T00:00:00.000Z`);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of tariffs) {
    const existing = await prisma.operatorTariff.findUnique({
      where: { operator: row.operator },
      select: { id: true, source: true },
    });

    if (existing?.source === "manuel") {
      skipped++;
      continue;
    }

    const data = {
      ...row,
      slug: slugify(row.operator),
      source: TARIFFS_SOURCE,
      sourceUrl: TARIFFS_SOURCE_URL,
      verifiedAt,
      isActive: true,
    };

    if (dry) {
      console.log(`${existing ? "güncellenecek" : "eklenecek"}: ${row.operator}`);
      existing ? updated++ : created++;
      continue;
    }

    if (existing) {
      await prisma.operatorTariff.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.operatorTariff.create({ data });
      created++;
    }
  }

  console.log(
    `${dry ? "[PROVA] " : ""}tarife: ${created} eklendi, ${updated} güncellendi, ${skipped} elle girilmiş kayıt korundu`,
  );
}

main()
  .catch((e) => {
    console.error("Tarife aktarımı başarısız:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
