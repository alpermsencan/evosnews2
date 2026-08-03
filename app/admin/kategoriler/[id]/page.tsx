import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { categoryFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">Kategoriyi Düzenle</h2>
      <EntityForm
        fields={categoryFields}
        initial={{
          name: category.name,
          slug: category.slug,
          color: category.color,
          order: category.order,
          href: category.href ?? "",
          isMainNav: category.isMainNav,
          description: category.description ?? "",
        }}
        endpoint={`/api/categories/${category.id}`}
        method="PUT"
        redirectTo="/admin/kategoriler"
      />
    </div>
  );
}
