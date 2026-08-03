import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import EntityForm from "@/components/admin/EntityForm";
import { communityFields } from "@/components/admin/fieldSets";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCommunity() {
  const posts = await prisma.communityPost.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  const rows = posts.map((p) => ({
    id: p.id,
    label: p.title,
    search: `${p.title} ${p.author} ${p.topic}`,
    cells: [
      <span key="t" className="line-clamp-2 block max-w-sm font-bold text-neutral-900">
        {p.title}
      </span>,
      p.author,
      <span
        key="c"
        className="rounded bg-orange-100 px-2 py-1 text-[10px] font-black text-orange-700"
      >
        {p.topic.toUpperCase()}
      </span>,
      p.likes,
      p.replies,
      p.isPinned ? "Sabit" : "—",
      <span key="d" className="text-[11px] text-neutral-500">
        {formatDate(p.createdAt, false)}
      </span>,
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-black text-neutral-900">
          Topluluk Gönderileri ({posts.length})
        </h2>
        <AdminTable
          endpoint="/api/community"
          columns={["KONU", "YAZAR", "KATEGORİ", "BEĞENİ", "YANIT", "DURUM", "TARİH"]}
          rows={rows}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-black text-neutral-900">Yeni Gönderi</h2>
        <EntityForm
          fields={communityFields}
          endpoint="/api/community"
          method="POST"
          redirectTo="/admin/topluluk"
          submitLabel="GÖNDERİYİ EKLE"
        />
      </div>
    </div>
  );
}
