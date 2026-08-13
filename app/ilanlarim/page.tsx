import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatTL } from "@/lib/utils";
import VoltScoreBadge from "@/components/listings/VoltScoreBadge";
import SectionTitle from "@/components/news/SectionTitle";
import ListingCard from "@/components/listings/ListingCard";
import { listingCardSelect } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata = { title: "İlanlarım" };

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Moderasyonda", tone: "bg-amber-100 text-amber-700" },
  PUBLISHED: { label: "Yayında", tone: "bg-volt/10 text-volt-dark" },
  REJECTED: { label: "Reddedildi", tone: "bg-evos/10 text-evos" },
  SOLD: { label: "Satıldı", tone: "bg-neutral-200 text-neutral-600" },
};

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const viewer = await getCurrentUser();
  if (!viewer) redirect("/giris?devam=/ilanlarim");

  const sp = await searchParams;

  const [listings, favorites] = await Promise.all([
    prisma.listing.findMany({
      where: { userId: viewer.id },
      orderBy: { createdAt: "desc" },
      include: { batteryReport: { select: { verifiedAt: true } } },
    }),
    prisma.listingFavorite.findMany({
      where: { userId: viewer.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        listing: {
          select: {
            ...listingCardSelect,
            status: true,
            batteryReport: { select: { verifiedAt: true, sohPercent: true, riskLevel: true } },
          },
        },
      },
    }),
  ]);

  // Yayından kaldırılmış ilan favorilerde de görünmesin.
  const favoriteListings = favorites
    .map((f) => f.listing)
    .filter((l) => l.status === "PUBLISHED");

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-neutral-900">İlanlarım</h1>
        <Link
          href="/ilanlar/yeni"
          className="rounded-md bg-evos px-5 py-2.5 text-sm font-black text-white transition hover:bg-evos-dark"
        >
          + YENİ İLAN
        </Link>
      </header>

      {sp.yeni === "1" && (
        <p className="rounded-lg border border-volt/40 bg-volt/10 px-4 py-3 text-[13px] font-bold text-volt-dark">
          İlanınız alındı ve moderasyona gönderildi. Onaylandığında yayına çıkar.
        </p>
      )}

      <section className="flex flex-col gap-3">
        {listings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
            Henüz ilan vermediniz.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-neutral-50 text-[10px] font-black tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">İLAN</th>
                  <th className="px-4 py-3">DURUM</th>
                  <th className="px-4 py-3">FİYAT</th>
                  <th className="px-4 py-3">VOLTSCORE</th>
                  <th className="px-4 py-3">BATARYA RAPORU</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {listings.map((l) => {
                  const s = STATUS_LABEL[l.status] ?? {
                    label: l.status,
                    tone: "bg-neutral-100 text-neutral-600",
                  };
                  return (
                    <tr key={l.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/ilanlar/${l.slug}`}
                          className="font-bold text-neutral-900 hover:text-evos"
                        >
                          {l.title}
                        </Link>
                        <span className="block text-[11px] text-neutral-400">
                          {l.year} · {l.km.toLocaleString("tr-TR")} km · {l.city}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-1 text-[10px] font-black ${s.tone}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-black text-neutral-900">
                        {formatTL(l.price)}
                      </td>
                      <td className="px-4 py-3">
                        <VoltScoreBadge score={l.voltScore} />
                      </td>
                      <td className="px-4 py-3 text-[12px] text-neutral-500">
                        {l.batteryReport?.verifiedAt
                          ? "✓ Doğrulandı"
                          : l.batteryReport
                            ? "Doğrulama bekliyor"
                            : "Yok"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <SectionTitle title="FAVORİLERİM" href="/ilanlar" color="#0f172a" />
        {favoriteListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {favoriteListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-white p-6 text-center text-sm text-neutral-500">
            Favorilediğiniz ilan yok.
          </p>
        )}
      </section>
    </div>
  );
}
