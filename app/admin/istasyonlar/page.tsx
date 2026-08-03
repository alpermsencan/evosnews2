import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";

export const dynamic = "force-dynamic";

export default async function AdminStations() {
  const stations = await prisma.chargeStation.findMany({
    orderBy: [{ city: "asc" }, { name: "asc" }],
  });

  const rows = stations.map((s) => ({
    id: s.id,
    label: s.name,
    search: `${s.name} ${s.city} ${s.operator}`,
    cells: [
      <span key="n" className="font-bold text-neutral-900">
        {s.name}
      </span>,
      `${s.city} / ${s.district}`,
      s.operator,
      <span
        key="p"
        className="rounded bg-volt/10 px-2 py-1 text-[11px] font-black text-volt-dark"
      >
        {s.maxPowerKw} kW
      </span>,
      s.socketCount,
      `${s.pricePerKwh.toFixed(2)} ₺/kWh`,
      s.status,
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900">
          Şarj İstasyonları ({stations.length})
        </h2>
        <Link
          href="/admin/istasyonlar/yeni"
          className="rounded-md bg-volt px-5 py-2.5 text-sm font-black text-white transition hover:bg-volt-dark"
        >
          + YENİ İSTASYON
        </Link>
      </div>

      <AdminTable
        endpoint="/api/stations"
        editBase="/admin/istasyonlar"
        columns={["İSTASYON", "KONUM", "OPERATÖR", "GÜÇ", "SOKET", "TARİFE", "DURUM"]}
        rows={rows}
      />
    </div>
  );
}
