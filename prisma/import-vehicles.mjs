/**
 * Doğrulanmış elektrikli araç kataloğunu veritabanına aktarır.
 *
 *   node --env-file=.env prisma/import-vehicles.mjs        # ekle / güncelle
 *   node --env-file=.env prisma/import-vehicles.mjs --dry  # prova
 *
 * İdempotenttir: Araç slug'ı anahtar olarak kullanılır, tekrar çalıştırmak
 * mükerrer kayıt oluşturmaz.
 */

import { PrismaClient } from "@prisma/client";
import {
  vehicles,
  VEHICLES_SOURCE,
  VEHICLES_VERIFIED_AT,
} from "./vehicles.data.mjs";

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
  const priceUpdatedAt = new Date(`${VEHICLES_VERIFIED_AT}T00:00:00.000Z`);
  let created = 0;
  let updated = 0;

  for (const item of vehicles) {
    const slug = slugify(`${item.brand}-${item.model}`);

    const existing = await prisma.vehicle.findUnique({
      where: { slug },
      select: { id: true },
    });

    const data = {
      ...item,
      slug,
      priceSource: VEHICLES_SOURCE,
      priceUpdatedAt,
    };

    if (dry) {
      console.log(`${existing ? "güncellenecek" : "eklenecek"}: ${item.brand} ${item.model} (${slug})`);
      existing ? updated++ : created++;
      continue;
    }

    if (existing) {
      await prisma.vehicle.update({
        where: { id: existing.id },
        data,
      });
      updated++;
    } else {
      await prisma.vehicle.create({
        data,
      });
      created++;
    }
  }

  console.log(
    `${dry ? "[PROVA] " : ""}Araç kataloğu: ${created} eklendi, ${updated} güncellendi (Toplam: ${vehicles.length})`,
  );
}

main()
  .catch((e) => {
    console.error("Araç aktarımı başarısız:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
