import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import EntityForm from "@/components/admin/EntityForm";
import { categoryFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  const rows = categories.map((c) => ({
    id: c.id,
    label: c.name,
    search: `${c.name} ${c.slug}`,
    cells: [
      <span key="n" className="flex items-center gap-2 font-bold text-neutral-900">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: c.color }}
        />
        {c.name}
      </span>,
      c.slug,
      c._count.articles,
      c.order,
      c.isMainNav ? "Evet" : "Hayır",
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-neutral-900">
          Kategoriler ({categories.length})
        </h2>
        <AdminTable
          endpoint="/api/categories"
          editBase="/admin/kategoriler"
          columns={["AD", "SLUG", "HABER", "SIRA", "ÜST MENÜ"]}
          rows={rows}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-black text-neutral-900">Yeni Kategori</h2>
        <EntityForm
          fields={categoryFields}
          endpoint="/api/categories"
          method="POST"
          redirectTo="/admin/kategoriler"
          submitLabel="KATEGORİ EKLE"
        />
      </div>
    </div>
  );
}
