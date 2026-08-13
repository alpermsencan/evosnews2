import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/utils";
import ListingRowActions from "@/components/admin/ListingRowActions";
import VoltScoreBadge from "@/components/listings/VoltScoreBadge";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-volt/10 text-volt-dark",
  REJECTED: "bg-evos/10 text-evos",
  SOLD: "bg-neutral-200 text-neutral-600",
};

export default async function AdminListings({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filter = sp.durum;

  const listings = await prisma.listing.findMany({
    where: filter ? { status: filter } : {},
    // Moderasyon bekleyenler en üstte: panelin asıl işi onlar.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      batteryReport: { select: { verifiedAt: true, sohPercent: true } },
      user: { select: { username: true } },
    },
  });

  const counts = await prisma.listing.groupBy({ by: ["status"], _count: true });
  const byStatus = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900">
          İlanlar ({listings.length})
        </h2>
        <div className="flex flex-wrap gap-1.5">
          <Filter active={!filter} href="/admin/ilanlar" label={`Tümü`} />
          {["PENDING", "PUBLISHED", "REJECTED", "SOLD"].map((s) => (
            <Filter
              key={s}
              active={filter === s}
              href={`/admin/ilanlar?durum=${s}`}
              label={`${s} (${byStatus[s] ?? 0})`}
            />
          ))}
        </div>
      </div>

      <p className="rounded-lg border border-neutral-200 bg-white p-4 text-[13px] leading-relaxed text-neutral-600">
        Üyeden gelen ilanlar <strong>PENDING</strong> olarak düşer ve
        onaylanmadan sitede görünmez. Batarya raporunu ilanın kendi sayfasından
        girin — kalan ömür ve risk seviyesi ölçümlerden otomatik hesaplanır.
      </p>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-[13px]">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-black tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">İLAN</th>
              <th className="px-3 py-2">SATICI</th>
              <th className="px-3 py-2">DURUM</th>
              <th className="px-3 py-2">FİYAT</th>
              <th className="px-3 py-2">PUAN</th>
              <th className="px-3 py-2">BATARYA</th>
              <th className="px-3 py-2">İŞLEM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-neutral-50">
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/ilanlar/${l.id}`}
                    className="font-bold text-neutral-900 hover:text-evos"
                  >
                    {l.title}
                  </Link>
                  <span className="block text-[11px] text-neutral-400">
                    {l.brand} {l.model} · {l.year} · {l.city}
                  </span>
                </td>
                <td className="px-3 py-2 text-neutral-600">
                  {l.sellerName}
                  <span className="block text-[11px] text-neutral-400">
                    {l.user ? `@${l.user.username}` : l.sellerType}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-1 text-[10px] font-black ${
                      STATUS_TONE[l.status] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {l.status}
                  </span>
                  {l.isSponsored && (
                    <span className="ml-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                      VİTRİN
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-black text-neutral-900">
                  {formatTL(l.price)}
                </td>
                <td className="px-3 py-2">
                  <VoltScoreBadge score={l.voltScore} />
                </td>
                <td className="px-3 py-2 text-[11px] text-neutral-500">
                  {l.batteryReport?.verifiedAt
                    ? `✓ %${l.batteryReport.sohPercent}`
                    : l.batteryReport
                      ? "Onay bekliyor"
                      : "—"}
                </td>
                <td className="px-3 py-2">
                  <ListingRowActions
                    id={l.id}
                    status={l.status}
                    isSponsored={l.isSponsored}
                  />
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-400">
                  Bu durumda ilan yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filter({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded px-2.5 py-1.5 text-[11px] font-black transition ${
        active ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
      }`}
    >
      {label}
    </Link>
  );
}
