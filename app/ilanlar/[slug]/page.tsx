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
import SectionTitle from "@/components/news/SectionTitle";
import { IconBattery, IconCheck, IconMap, IconShield } from "@/components/ui/Icons";
import ListingGallery from "@/components/listings/ListingGallery";
import ListingStickyHeader from "@/components/listings/ListingStickyHeader";
import ListingTouchGallery from "@/components/listings/ListingTouchGallery";
import VoltScoreWidget from "@/components/listings/VoltScoreWidget";
import ListingContactBox from "@/components/listings/ListingContactBox";
import ListingLocationMap from "@/components/listings/ListingLocationMap";
import ListingDetailTabs from "@/components/listings/ListingDetailTabs";

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
    description: `${l.year} model, ${l.city}. ${formatTL(l.price)}. Doğrulanmış batarya ve teknik verileriyle.`,
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
    <div className="flex flex-col gap-4 px-3 sm:px-0">
      {/* SABİT ÜST SÜTUN (Mobilde ve masaüstünde sayfayla birlikte hareket eden sticky bar) */}
      <ListingStickyHeader title={listing.title} slug={listing.slug} />

      {listing.status !== "PUBLISHED" && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-800">
          Bu ilan {listing.status === "PENDING" ? "moderasyonda" : listing.status.toLowerCase()} —
          yalnızca siz görüyorsunuz.
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* PARMAKLA GEZİLEN TOUCH SWIPE RESİM GALERİSİ */}
          <div className="relative">
            <ListingTouchGallery defaultImage={listing.image} images={listing.images} alt={listing.title} />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
            <h1 className="text-xl font-black uppercase tracking-tight leading-tight text-neutral-900 sm:text-2xl">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-500">
              <span className="rounded-lg bg-neutral-100 px-2.5 py-1 text-neutral-700">
                {listing.condition === "SIFIR" ? "Sıfır" : "İkinci el"}
              </span>
              <span>{listing.year}</span>
              <span>•</span>
              <span>{listing.km.toLocaleString("tr-TR")} km</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-neutral-700">
                <IconMap className="h-3.5 w-3.5 text-neutral-400" />
                {listing.city}
              </span>
              {listing.color && (
                <>
                  <span>•</span>
                  <span>{listing.color}</span>
                </>
              )}
              {listing.damage && (
                <>
                  <span>•</span>
                  <span>{listing.damage}</span>
                </>
              )}
            </div>

            {/* MAVİ KALIN BÜYÜK FİYAT */}
            <div className="pt-1">
              <span className="text-2xl font-black text-blue-600 sm:text-4xl tracking-tight">
                {formatTL(listing.price)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
              <FavoriteButton listingId={listing.id} slug={listing.slug} initial={favorited} />
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

          {/* İLAN İÇERİK SEKMELERİ (TEKNİK BİLGİLER, AÇIKLAMA, KONUM, EKSPERTİZ) */}
          <ListingDetailTabs listing={listing as any} />

        </div>

        {/* SAĞ SÜTUN — DETAYLAR & SATICI */}
        <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[340px]">

          {/* SATICI BİLGİSİ, TELEFON, WHATSAPP & DİREKT MESAJ GÖNDERME */}
          <ListingContactBox
            listingId={listing.id}
            listingSlug={listing.slug}
            sellerName={listing.sellerName}
            sellerType={listing.sellerType}
            sellerPhone={listing.sellerPhone}
            sellerUserId={listing.userId}
            viewerId={viewer?.id}
          />

          {/* HARİTALI ARAÇ KONUM BİLGİSİ (Masaüstünde Sağ Sütunda Kalır, Mobilde Sekmede Gösterilir) */}
          <div className="hidden lg:block">
            <ListingLocationMap
              city={listing.city}
              district={listing.district}
            />
          </div>

          {listing.vehicle && (
            <section className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
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
                Model sayfasına git →
              </Link>
            </section>
          )}

          <div className="flex flex-col gap-2 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <IconShield className="h-5 w-5 text-blue-700" />
              <span className="text-[14px] font-black text-blue-900">
                e-aracım Güvenli İlan
              </span>
            </div>
            <span className="text-[12px] leading-relaxed text-blue-800/80">
              Bu ilandaki araç bilgileri, ekspertiz şeması ve teknik özellikler satıcı beyanı ve doğrulanmış katalog verileriyle eşleştirilmiştir.
            </span>
          </div>
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
