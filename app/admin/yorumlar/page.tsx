import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminComments() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { article: { select: { title: true, slug: true } } },
  });

  const rows = comments.map((c) => ({
    id: c.id,
    label: `${c.name} yorumu`,
    search: `${c.name} ${c.body} ${c.article.title}`,
    cells: [
      <span key="n" className="font-bold text-neutral-900">
        {c.name}
      </span>,
      <span key="b" className="line-clamp-2 block max-w-md text-neutral-600">
        {c.body}
      </span>,
      <Link
        key="a"
        href={`/haber/${c.article.slug}`}
        target="_blank"
        className="line-clamp-1 block max-w-[220px] text-[12px] font-bold text-evos hover:underline"
      >
        {c.article.title}
      </Link>,
      c.likes,
      <span key="d" className="text-[11px] text-neutral-500">
        {formatDate(c.createdAt)}
      </span>,
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">
        Yorumlar ({comments.length})
      </h2>

      <AdminTable
        endpoint="/api/comments"
        columns={["KULLANICI", "YORUM", "HABER", "BEĞENİ", "TARİH"]}
        rows={rows}
      />
    </div>
  );
}
