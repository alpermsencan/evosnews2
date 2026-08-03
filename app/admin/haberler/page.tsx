import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticles() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    include: { category: { select: { name: true, color: true } } },
  });

  const rows = articles.map((a) => {
    const flags = [
      a.isHeadline && "MANŞET",
      a.isBreaking && "SON DAKİKA",
      a.isFeatured && "ÖNE ÇIKAN",
      a.isVideo && "VİDEO",
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      id: a.id,
      label: a.title,
      search: `${a.title} ${a.category.name}`,
      cells: [
        <Link
          key="t"
          href={`/haber/${a.slug}`}
          target="_blank"
          className="line-clamp-2 block max-w-md font-bold text-neutral-900 hover:text-evos"
        >
          {a.title}
        </Link>,
        <span
          key="c"
          className="rounded px-2 py-1 text-[10px] font-black text-white"
          style={{ backgroundColor: a.category.color }}
        >
          {a.category.name.toUpperCase()}
        </span>,
        <span key="f" className="text-[11px] font-bold text-neutral-500">
          {flags || "—"}
        </span>,
        a.views.toLocaleString("tr-TR"),
        <span key="d" className="text-[11px] text-neutral-500">
          {formatDate(a.publishedAt)}
        </span>,
      ],
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900">
          Haberler ({articles.length})
        </h2>
        <Link
          href="/admin/haberler/yeni"
          className="rounded-md bg-evos px-5 py-2.5 text-sm font-black text-white transition hover:bg-evos-dark"
        >
          + YENİ HABER
        </Link>
      </div>

      <AdminTable
        endpoint="/api/articles"
        editBase="/admin/haberler"
        columns={["BAŞLIK", "KATEGORİ", "ETİKET", "OKUNMA", "TARİH"]}
        rows={rows}
      />
    </div>
  );
}
