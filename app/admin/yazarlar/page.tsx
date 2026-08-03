import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import EntityForm from "@/components/admin/EntityForm";
import { authorFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function AdminAuthors() {
  const authors = await prisma.author.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  const rows = authors.map((a) => ({
    id: a.id,
    label: a.name,
    search: `${a.name} ${a.title ?? ""}`,
    cells: [
      <span key="n" className="font-bold text-neutral-900">
        {a.name}
      </span>,
      a.title ?? "—",
      a.slug,
      a._count.articles,
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-neutral-900">
          Yazarlar ({authors.length})
        </h2>
        <AdminTable
          endpoint="/api/authors"
          deleteQueryParam
          columns={["AD SOYAD", "UNVAN", "SLUG", "HABER"]}
          rows={rows}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-black text-neutral-900">Yeni Yazar</h2>
        <EntityForm
          fields={authorFields}
          endpoint="/api/authors"
          method="POST"
          redirectTo="/admin/yazarlar"
          submitLabel="YAZAR EKLE"
        />
      </div>
    </div>
  );
}
