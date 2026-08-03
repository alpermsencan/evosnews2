import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatTL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminVehicles() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { brand: "asc" } });

  const rows = vehicles.map((v) => ({
    id: v.id,
    label: `${v.brand} ${v.model}`,
    search: `${v.brand} ${v.model} ${v.segment}`,
    cells: [
      <Link
        key="n"
        href={`/araclar/${v.slug}`}
        target="_blank"
        className="font-bold text-neutral-900 hover:text-evos"
      >
        {v.brand} {v.model}
      </Link>,
      v.segment,
      `${v.rangeKm} km`,
      `%${v.otvRate}`,
      <span key="p" className="font-black text-evos">
        {formatTL(v.price)}
      </span>,
      v.isFeatured ? "Evet" : "—",
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900">
          Araçlar ({vehicles.length})
        </h2>
        <Link
          href="/admin/araclar/yeni"
          className="rounded-md bg-teal-700 px-5 py-2.5 text-sm font-black text-white transition hover:bg-teal-800"
        >
          + YENİ ARAÇ
        </Link>
      </div>

      <AdminTable
        endpoint="/api/vehicles"
        editBase="/admin/araclar"
        columns={["ARAÇ", "SEGMENT", "MENZİL", "ÖTV", "FİYAT", "VİTRİN"]}
        rows={rows}
      />
    </div>
  );
}
