import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatTL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminListings() {
  const listings = await prisma.listing.findMany({
    orderBy: [{ isSponsored: "desc" }, { createdAt: "desc" }],
  });

  const rows = listings.map((l) => ({
    id: l.id,
    label: l.title,
    search: `${l.title} ${l.brand} ${l.city}`,
    cells: [
      <Link
        key="t"
        href={`/marketplace/${l.slug}`}
        target="_blank"
        className="line-clamp-2 block max-w-sm font-bold text-neutral-900 hover:text-evos"
      >
        {l.title}
      </Link>,
      l.brand,
      l.city,
      l.km.toLocaleString("tr-TR"),
      <span
        key="h"
        className="rounded bg-volt/10 px-2 py-1 text-[11px] font-black text-volt-dark"
      >
        %{l.batteryHealth}
      </span>,
      <span key="p" className="font-black text-evos">
        {formatTL(l.price)}
      </span>,
      l.isSponsored ? "Vitrin" : "—",
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900">
          Market İlanları ({listings.length})
        </h2>
        <Link
          href="/admin/ilanlar/yeni"
          className="rounded-md bg-rose-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-rose-700"
        >
          + YENİ İLAN
        </Link>
      </div>

      <AdminTable
        endpoint="/api/listings"
        editBase="/admin/ilanlar"
        columns={["İLAN", "MARKA", "ŞEHİR", "KM", "BATARYA", "FİYAT", "VİTRİN"]}
        rows={rows}
      />
    </div>
  );
}
