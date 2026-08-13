import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { IconBattery, IconMap } from "@/components/ui/Icons";
import VoltScoreBadge from "./VoltScoreBadge";
import CompareButton from "@/components/compare/CompareButton";

export type ListingLite = {
  id: string;
  title: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  km: number;
  price: number;
  city: string;
  image: string;
  condition: string;
  sellerType: string;
  sellerName: string;
  damage: string;
  rangeKm: number;
  batteryHealth: number;
  isSponsored: boolean;
  voltScore: number | null;
  batteryReport?: {
    verifiedAt: Date | string | null;
    sohPercent: number;
    riskLevel: string | null;
  } | null;
};

export default function ListingCard({ listing }: { listing: ListingLite }) {
  // Rozet YALNIZCA doğrulanmış raporda çıkar; ölçüm girilmiş ama Evos
  // doğrulamamışsa satıcı beyanından farkı yoktur.
  const verified = !!listing.batteryReport?.verifiedAt;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg">
      <Link
        href={`/ilanlar/${listing.slug}`}
        className="relative block aspect-[16/10] w-full bg-neutral-100"
      >
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width:640px) 100vw, 340px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {listing.isSponsored && (
            <span className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
              VİTRİN
            </span>
          )}
          <span className="rounded bg-evos-ink/85 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
            {listing.condition === "SIFIR" ? "SIFIR" : "İKİNCİ EL"}
          </span>
          {verified && (
            <span className="rounded bg-volt px-2 py-0.5 text-[10px] font-black text-white">
              ✓ BATARYA RAPORLU
            </span>
          )}
        </div>

        <div className="absolute right-2 top-2">
          <VoltScoreBadge score={listing.voltScore} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/ilanlar/${listing.slug}`}>
          <h3 className="line-clamp-2 text-[14px] font-black leading-snug text-neutral-900 group-hover:text-evos">
            {listing.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-500">
          <span>{listing.year}</span>
          <span>{listing.km.toLocaleString("tr-TR")} km</span>
          <span className="flex items-center gap-1">
            <IconMap className="h-3 w-3" />
            {listing.city}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Chip>{listing.sellerType}</Chip>
          <Chip>{listing.damage}</Chip>
          {listing.rangeKm > 0 && <Chip>{listing.rangeKm} km menzil</Chip>}
          <Chip>
            <IconBattery className="mr-1 inline h-3 w-3" />
            {verified
              ? `%${listing.batteryReport!.sohPercent} ölçülü`
              : `%${listing.batteryHealth} beyan`}
          </Chip>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-neutral-100 pt-2">
          <span className="text-[15px] font-black text-neutral-900">
            {formatTL(listing.price)}
          </span>
          <CompareButton kind="listing" slug={listing.slug} />
        </div>
      </div>
    </article>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600">
      {children}
    </span>
  );
}
