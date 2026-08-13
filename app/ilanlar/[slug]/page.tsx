import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatTL } from "@/lib/utils";
import { readBreakdown } from "@/lib/listings";
import { RISK_LABEL, riskTone, EOL_SOH } from "@/lib/battery-report";
import VoltScoreBadge from "@/components/listings/VoltScoreBadge";
import FavoriteButton from "@/components/listings/FavoriteButton";
import CompareButton from "@/components/compare/CompareButton";
import SectionTitle from "@/components/news/SectionTitle";
import { IconBattery, IconCheck, IconMap, IconShield } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await prisma.listing.findUnique({
    where: { slug },
    select: { title: true, price: true, city: true, year: true, status: true },
  });
  if (!l || l.status !== "PUBLISHED") return { title: "İlan bulunamadı" };
  return {
    title: l.title,
    description: `${l.year} model, ${l.city}. ${formatTL(l.price)}. Batarya sağlığı, gerçek menzil ve VoltScore güven puanıyla.`,
  };
}

export default async function ListingDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await getCurrentUser();

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      batteryReport: true,
      vehicle: true,
      user: { select: { username: true, name: true, avatar: true } },
    },
  });

  // Yayında olmayan ilanı yalnızca sahibi görebilir (önizleme).
  if (!listing) notFound();
  const isOwner = !!viewer && listing.userId === viewer.id;
  if (listing.status !== "PUBLISHED" && !isOwner) notFound();

  const favorited = viewer
    ? !!(await prisma.listingFavorite.findUnique({
        where: { listingId_userId: { listingId: listing.id, userId: viewer.id } },
        select: { id: true },
      }))
    : false;

  const breakdown = readBreakdown(listing.voltScoreBreakdown);
  const report = listing.batteryReport;
  const verified = !!report?.verifiedAt;
  const gallery = [listing.image, ...listing.images].filter(Boolean).slice(0, 6);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      {listing.status !== "PUBLISHED" && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-800">
          Bu ilan {listing.status === "PENDING" ? "moderasyonda" : listing.status.toLowerCase()} —
          yalnızca siz görüyorsunuz.
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="relative aspect-[16/10] w-full bg-neutral-100">
              <Image
                src={listing.image}
                alt={listing.title}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 720px"
                className="object-cover"
              />
              {verified && (
                <span className="absolute left-3 top-3 rounded bg-volt px-2.5 py-1 text-[11px] font-black text-white">
                  ✓ EVOS DOĞRULAMALI BATARYA RAPORU
                </span>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-neutral-100"
                  >
                    <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <h1 className="text-xl font-black leading-tight text-neutral-900 sm:text-2xl">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold text-neutral-500">
              <span className="rounded bg-neutral-100 px-2 py-1">
                {listing.condition === "SIFIR" ? "Sıfır" : "İkinci el"}
              </span>
              <span>{listing.year}</span>
              <span>{listing.km.toLocaleString("tr-TR")} km</span>
              <span className="flex items-center gap-1">
                <IconMap className="h-3.5 w-3.5" />
                {listing.city}
              </span>
              <span>{listing.color}</span>
              <span>{listing.damage}</span>
            </div>

            <span className="text-2xl font-black text-neutral-900 sm:text-3xl">
              {formatTL(listing.price)}
            </span>

            <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
              <FavoriteButton listingId={listing.id} slug={listing.slug} initial={favorited} />
              <CompareButton kind="listing" slug={listing.slug} />
              {isOwner && (
                <Link
                  href="/ilanlarim"
                  className="rounded-md bg-neutral-100 px-2.5 py-1.5 text-[11px] font-black text-neutral-600 transition hover:bg-neutral-200"
                >
                  İLANLARIM
                </Link>
              )}
            </div>
          </div>

          {/* BATARYA RAPORU */}
          <section className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <IconBattery className="h-5 w-5 text-volt-dark" />
              <h2 className="text-base font-black text-neutral-900">Batarya Raporu</h2>
            </div>

            {report ? (
              <>
                {!verified && (
                  <p className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] font-bold text-amber-800">
                    Bu rapor henüz Evos tarafından doğrulanmadı; değerler
                    VoltScore hesabına KATILMAZ.
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Metric label="Ölçülen SOH" value={`%${report.sohPercent}`} strong />
                  <Metric
                    label="Tahmini kalan ömür"
                    value={
                      report.estimatedYearsLeft != null
                        ? `${report.estimatedYearsLeft} yıl`
                        : "—"
                    }
                  />
                  <Metric
                    label="Çevrim sayısı"
                    value={report.cycleCount?.toLocaleString("tr-TR") ?? "—"}
                  />
                  <Metric
                    label="DC hızlı şarj oranı"
                    value={report.fastChargeRatio != null ? `%${report.fastChargeRatio}` : "—"}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2.5 py-1 text-[11px] font-black ${riskTone(report.riskLevel)}`}
                  >
                    {RISK_LABEL[report.riskLevel ?? ""] ?? "Risk hesaplanamadı"}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {report.measuredBy} · {report.measuredAt.toLocaleDateString("tr-TR")}
                    {verified &&
                      ` · Evos doğruladı: ${report.verifiedAt!.toLocaleDateString("tr-TR")}`}
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed text-neutral-400">
                  Kalan ömür, ölçülen kapasite kaybı hızından %{EOL_SOH} sınırına
                  kalan süre olarak SUNUCUDA hesaplanır; satıcı veya ekspertiz
                  bu değeri elle giremez. Tahmindir, garanti değildir.
                </p>
              </>
            ) : (
              <p className="text-[13px] leading-relaxed text-neutral-500">
                Bu ilanda doğrulanmış batarya raporu yok. Satıcının beyanı:{" "}
                <strong className="font-black text-neutral-800">
                  %{listing.batteryHealth} batarya sağlığı
                </strong>
                . Beyan, ölçülmüş değerin yerini tutmaz —{" "}
                <Link href="/batarya-raporu" className="font-bold text-volt-dark hover:underline">
                  batarya raporu nedir?
                </Link>
              </p>
            )}
          </section>

          {listing.description && (
            <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="text-base font-black text-neutral-900">Satıcı açıklaması</h2>
              <p className="whitespace-pre-line text-[14px] leading-relaxed text-neutral-700">
                {listing.description}
              </p>
            </section>
          )}
        </div>

        {/* SAĞ SÜTUN — VOLTSCORE */}
        <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[340px]">
          <section className="flex flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-black tracking-wide text-neutral-800">
              VOLTSCORE™ GÜVEN PUANI
            </h2>
            <VoltScoreBadge score={listing.voltScore} coverage={breakdown?.coverage} size="lg" />

            {breakdown ? (
              <ul className="flex w-full flex-col divide-y divide-neutral-100">
                {breakdown.criteria.map((c) => (
                  <li key={c.key} className="flex items-center justify-between gap-2 py-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-[12px] font-bold text-neutral-700">
                        {c.label}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        ağırlık %{c.weight} · {c.display}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[13px] font-black ${
                        c.score == null ? "text-neutral-300" : "text-neutral-900"
                      }`}
                    >
                      {c.score == null ? "veri yok" : Math.round(c.score)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-neutral-500">
                Puanı hesaplamak için yeterli veri yok.
              </p>
            )}

            <p className="text-[10px] leading-relaxed text-neutral-400">
              Puan sunucuda hesaplanır ve her araca aynı formül uygulanır. Verisi
              olmayan kriter puana KATILMAZ, ağırlığı diğerlerine dağıtılır —
              bu yüzden kapsam oranı ayrıca gösterilir.
            </p>
          </section>

          <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="text-sm font-black tracking-wide text-neutral-800">SATICI</h2>
            <span className="text-[15px] font-black text-neutral-900">
              {listing.sellerName}
            </span>
            <span className="text-[12px] text-neutral-500">{listing.sellerType}</span>
            {listing.user && (
              <Link
                href={`/profil/${listing.user.username}`}
                className="text-[12px] font-bold text-evos hover:underline"
              >
                Profili gör
              </Link>
            )}
            <p className="mt-1 rounded bg-neutral-50 p-2 text-[11px] leading-relaxed text-neutral-500">
              Evos ilanı yayımlar, satışa aracılık etmez. Ödeme ve devir
              işlemlerini satıcıyla doğrudan yürütün.
            </p>
          </section>

          {listing.vehicle && (
            <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-volt-dark" />
                <h2 className="text-sm font-black tracking-wide text-neutral-800">
                  KATALOG VERİSİ
                </h2>
              </div>
              <Row label="İlan menzili (WLTP)" value={`${listing.vehicle.rangeKm} km`} />
              <Row label="Batarya" value={`${listing.vehicle.batteryKwh} kWh`} />
              <Row
                label="DC şarj"
                value={listing.vehicle.dcChargeKw ? `${listing.vehicle.dcChargeKw} kW` : "—"}
              />
              <Link
                href={`/araclar/${listing.vehicle.slug}`}
                className="mt-1 text-[12px] font-bold text-evos hover:underline"
              >
                Model sayfasına git
              </Link>
            </section>
          )}

          <Link
            href="/evos-protect"
            className="flex flex-col gap-2 rounded-lg bg-blue-700 p-5 text-white transition hover:bg-blue-800"
          >
            <IconShield className="h-6 w-6" />
            <span className="text-[15px] font-black leading-tight">
              Bu aracı Evos Protect ile güvenceye alın
            </span>
            <span className="text-[12px] text-white/80">
              Batarya ve şarj ekosistemini kapsayan paketleri inceleyin.
            </span>
          </Link>
        </aside>
      </div>

      <section>
        <SectionTitle title="BENZER İLANLAR" href="/ilanlar" color="#0f172a" />
        <SimilarListings brand={listing.brand} excludeId={listing.id} />
      </section>
    </div>
  );
}

async function SimilarListings({ brand, excludeId }: { brand: string; excludeId: string }) {
  const items = await prisma.listing.findMany({
    where: { status: "PUBLISHED", brand, NOT: { id: excludeId } },
    orderBy: { voltScore: "desc" },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      year: true,
      km: true,
      city: true,
      voltScore: true,
    },
  });

  if (items.length === 0) {
    return (
      <p className="rounded-lg bg-white p-6 text-center text-sm text-neutral-500">
        Bu markadan başka yayında ilan yok.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((l) => (
        <Link
          key={l.id}
          href={`/ilanlar/${l.slug}`}
          className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-4 transition hover:shadow-md"
        >
          <span className="line-clamp-2 text-[13px] font-black text-neutral-900">
            {l.title}
          </span>
          <span className="text-[11px] text-neutral-500">
            {l.year} · {l.km.toLocaleString("tr-TR")} km · {l.city}
          </span>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[14px] font-black text-neutral-900">
              {formatTL(l.price)}
            </span>
            <VoltScoreBadge score={l.voltScore} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col rounded bg-neutral-50 px-3 py-2">
      <span className="text-[10px] font-semibold text-neutral-500">{label}</span>
      <span className={`font-black ${strong ? "text-lg text-volt-dark" : "text-sm text-neutral-900"}`}>
        {value}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-neutral-500">{label}</span>
      <span className="font-black text-neutral-900">{value}</span>
    </div>
  );
}
