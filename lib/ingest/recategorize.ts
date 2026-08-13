import { prisma } from "../prisma";
import { routeCategory } from "./route-category";

/**
 * ARŞİVİ KONU KURALLARINA GÖRE YENİDEN DAĞITIR
 *
 * Kaynak tanımındaki `categorySlug` bir beslemenin tamamı için tek hedef
 * belirlediğinden, konu yönlendirmesi devreye girmeden önce çekilmiş haberler
 * tek kategoride yığılmıştı. Bu iş onları başlık/spot/etiketlerine bakarak
 * doğru kategoriye taşır.
 *
 * Günlük cron'un parçasıdır ve idempotenttir: kural değişmediyse ikinci
 * çalışma hiçbir kaydı yazmaz.
 *
 * ELLE girilen haberlere (`ingestedAt` boş) DOKUNMAZ — editörün seçtiği
 * kategori bir kuraldan daha güvenilirdir.
 */
export async function recategorizeArchive() {
  const [categories, articles] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.article.findMany({
      where: { ingestedAt: { not: null } },
      select: {
        id: true,
        title: true,
        spot: true,
        tags: true,
        category: { select: { slug: true } },
      },
    }),
  ]);

  const bySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const moves: Record<string, number> = {};
  let moved = 0;

  for (const a of articles) {
    const target = routeCategory(a.category.slug, a.title, a.spot, a.tags.join(" "));
    const targetId = bySlug.get(target);
    if (target === a.category.slug || !targetId) continue;

    await prisma.article.update({ where: { id: a.id }, data: { categoryId: targetId } });
    const key = `${a.category.slug} → ${target}`;
    moves[key] = (moves[key] ?? 0) + 1;
    moved++;
  }

  return { scanned: articles.length, moved, moves };
}
