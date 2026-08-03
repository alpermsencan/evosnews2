import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLeads() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const rows = leads.map((l) => ({
    id: l.id,
    label: `${l.name} talebi`,
    search: `${l.name} ${l.email} ${l.topic} ${l.message}`,
    cells: [
      <span key="n" className="font-bold text-neutral-900">
        {l.name}
      </span>,
      l.email,
      l.phone ?? "—",
      <span
        key="t"
        className="rounded bg-indigo-100 px-2 py-1 text-[10px] font-black text-indigo-700"
      >
        {l.topic}
      </span>,
      <span key="m" className="line-clamp-2 block max-w-sm text-neutral-600">
        {l.message}
      </span>,
      <span key="d" className="text-[11px] text-neutral-500">
        {formatDate(l.createdAt)}
      </span>,
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black text-neutral-900">
          Talepler ({leads.length})
        </h2>
        <p className="text-sm text-neutral-500">
          İletişim, teklif ve ilan mesajı formlarından gelen talepler.
        </p>
      </div>

      <AdminTable
        endpoint="/api/leads"
        deleteQueryParam
        columns={["AD SOYAD", "E-POSTA", "TELEFON", "KONU", "MESAJ", "TARİH"]}
        rows={rows}
      />
    </div>
  );
}
