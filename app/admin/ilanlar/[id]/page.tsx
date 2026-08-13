import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatTL } from "@/lib/utils";
import { readBreakdown } from "@/lib/listings";
import BatteryReportForm from "@/components/admin/BatteryReportForm";
import ListingRowActions from "@/components/admin/ListingRowActions";
import VoltScoreBadge from "@/components/listings/VoltScoreBadge";

export const dynamic = "force-dynamic";

export default async function AdminListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { batteryReport: true, user: { select: { username: true } } },
  });
  if (!listing) notFound();

  const breakdown = readBreakdown(listing.voltScoreBreakdown);
  const r = listing.batteryReport;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/ilanlar" className="text-[11px] font-bold text-neutral-400 hover:text-evos">
            ← İLANLAR
          </Link>
          <h2 className="text-lg font-black text-neutral-900">{listing.title}</h2>
          <p className="text-[13px] text-neutral-500">
            {listing.brand} {listing.model} · {listing.year} ·{" "}
            {listing.km.toLocaleString("tr-TR")} km · {listing.city} ·{" "}
            {formatTL(listing.price)}
            {listing.user && ` · @${listing.user.username}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/ilanlar/${listing.slug}`}
            className="text-[11px] font-bold text-evos hover:underline"
          >
            SİTEDE GÖR →
          </Link>
          <ListingRowActions id={listing.id} status={listing.status} isSponsored={listing.isSponsored} />
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <section className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
          <h3 className="text-[15px] font-black text-neutral-900">Batarya Raporu</h3>
          <p className="text-[12px] leading-relaxed text-neutral-500">
            Yalnızca ölçülen değerleri girin. Kalan ömür ve risk seviyesi
            sunucuda hesaplanır; bu alanlar formda bilerek yoktur.
          </p>
          <BatteryReportForm
            listingId={listing.id}
            initial={
              r && {
                sohPercent: r.sohPercent,
                cycleCount: r.cycleCount,
                fastChargeRatio: r.fastChargeRatio,
                odometerKm: r.odometerKm,
                measuredBy: r.measuredBy,
                measuredAt: r.measuredAt.toISOString(),
                verifiedAt: r.verifiedAt?.toISOString() ?? null,
                estimatedYearsLeft: r.estimatedYearsLeft,
                riskLevel: r.riskLevel,
              }
            }
          />
        </section>

        <aside className="flex w-full shrink-0 flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 lg:w-[340px]">
          <h3 className="text-[15px] font-black text-neutral-900">VoltScore</h3>
          <VoltScoreBadge score={listing.voltScore} coverage={breakdown?.coverage} size="lg" />
          {breakdown ? (
            <ul className="flex flex-col divide-y divide-neutral-100">
              {breakdown.criteria.map((c) => (
                <li key={c.key} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-[12px] text-neutral-600">
                    {c.label}{" "}
                    <span className="text-[10px] text-neutral-400">%{c.weight}</span>
                  </span>
                  <span
                    className={`text-[12px] font-black ${
                      c.score == null ? "text-neutral-300" : "text-neutral-900"
                    }`}
                  >
                    {c.score == null ? "veri yok" : Math.round(c.score)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-neutral-500">Puan hesaplanamadı.</p>
          )}
          <p className="text-[11px] text-neutral-400">
            Puan, ilan veya rapor her değiştiğinde otomatik yeniden hesaplanır.
          </p>
        </aside>
      </div>
    </div>
  );
}
