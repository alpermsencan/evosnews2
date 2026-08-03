import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { articleFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">Yeni Haber</h2>
      <EntityForm
        fields={articleFields(
          categories.map((c) => ({ value: c.id, label: c.name })),
          authors.map((a) => ({ value: a.id, label: a.name }))
        )}
        endpoint="/api/articles"
        method="POST"
        redirectTo="/admin/haberler"
        submitLabel="HABERİ YAYINLA"
      />
    </div>
  );
}
