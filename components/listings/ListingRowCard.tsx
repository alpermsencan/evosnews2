import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { IconMap } from "@/components/ui/Icons";
import { ListingLite } from "./ListingCard";

export default function ListingRowCard({ listing }: { listing: ListingLite }) {
  const verified = !!listing.batteryReport?.verifiedAt;

  return (
    <Link
      href={`/ilanlar/${listing.slug}`}
      className="group flex flex-row items-stretch overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-md w-full"
    >
      {/* Sol Taraf: Sütuna Tam Sığan Resim */}
      <div className="relative w-36 sm:w-52 h-28 sm:h-36 shrink-0 bg-neutral-100 overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 150px, 220px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {/* Rozetler */}
        {listing.isSponsored && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
              VİTRİN
            </span>
          </div>
        )}
      </div>

      {/* Sağ Taraf: İlan Bilgileri */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 min-w-0">
        <div>
          {/* BÜYÜK HARFLERLE BAŞLIK */}
          <h3 className="text-xs sm:text-base font-black uppercase text-neutral-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
            {listing.title}
          </h3>

          {/* Yazının sol altında küçük konum logosu ve il / ilçe bilgisi */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] sm:text-xs font-bold text-neutral-500 mt-1.5">
            <span className="flex items-center gap-1 text-neutral-600">
              <IconMap className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
              <span>{listing.city}</span>
            </span>
            <span className="text-neutral-300">•</span>
            <span>{listing.year}</span>
            <span className="text-neutral-300">•</span>
            <span>{listing.km.toLocaleString("tr-TR")} km</span>
            {listing.rangeKm > 0 && (
              <>
                <span className="text-neutral-300 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-teal-700">{listing.rangeKm} km menzil</span>
              </>
            )}
          </div>
        </div>

        {/* İlan sütununun sağ alt kısmında kalın mavi büyük fiyat */}
        <div className="mt-2 flex items-end justify-between border-t border-neutral-100 pt-2 sm:mt-auto">
          <div className="flex items-center gap-2">
            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-neutral-600 uppercase">
              {listing.condition === "SIFIR" ? "Sıfır" : "2. El"}
            </span>
          </div>

          <span className="text-base sm:text-xl font-black text-blue-600 tracking-tight">
            {formatTL(listing.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
