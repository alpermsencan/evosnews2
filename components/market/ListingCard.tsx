import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { IconBattery, IconGauge, IconMap } from "@/components/ui/Icons";

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
  sellerType: string;
  batteryHealth: number;
  isSponsored: boolean;
};

export default function ListingCard({ listing }: { listing: ListingLite }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg">
      <Link
        href={`/marketplace/${listing.slug}`}
        className="relative block aspect-[4/3] w-full bg-neutral-100"
      >
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width:640px) 100vw, 320px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {listing.isSponsored && (
          <span className="absolute left-2 top-2 rounded bg-evos px-2 py-0.5 text-[10px] font-black text-white">
            VİTRİN
          </span>
        )}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-white/90 px-2 py-0.5 text-[10px] font-black text-neutral-700 backdrop-blur">
          <IconBattery className="h-3 w-3 text-volt" />
          BATARYA %{listing.batteryHealth}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={`/marketplace/${listing.slug}`}>
          <h3 className="line-clamp-2 text-[14px] font-black leading-snug text-neutral-900 transition group-hover:text-evos">
            {listing.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-neutral-500">
          <span className="flex items-center gap-1">
            <IconGauge className="h-3 w-3" />
            {listing.km.toLocaleString("tr-TR")} km
          </span>
          <span>{listing.year}</span>
          <span className="flex items-center gap-1">
            <IconMap className="h-3 w-3" />
            {listing.city}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-black text-evos">
            {formatTL(listing.price)}
          </span>
          <span className="rounded bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600">
            {listing.sellerType}
          </span>
        </div>
      </div>
    </article>
  );
}
