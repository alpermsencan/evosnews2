import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminSubscribers() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = subscribers.map((s) => ({
    id: s.id,
    label: s.email,
    search: `${s.email} ${s.city ?? ""}`,
    cells: [
      <span key="e" className="font-bold text-neutral-900">
        {s.email}
      </span>,
      s.city ?? "—",
      <span key="d" className="text-[12px] text-neutral-500">
        {formatDate(s.createdAt)}
      </span>,
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black text-neutral-900">
          Bülten Aboneleri ({subscribers.length})
        </h2>
        <p className="text-sm text-neutral-500">
          Site genelindeki bülten formlarından gelen kayıtlar.
        </p>
      </div>

      <AdminTable
        endpoint="/api/newsletter"
        deleteQueryParam
        columns={["E-POSTA", "ŞEHİR", "KAYIT TARİHİ"]}
        rows={rows}
      />
    </div>
  );
}
