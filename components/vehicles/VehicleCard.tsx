import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { IconBattery, IconBolt, IconGauge } from "@/components/ui/Icons";
import CompareButton from "@/components/compare/CompareButton";
import BrandBadge from "@/components/ui/BrandBadge";

export type VehicleLite = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  price: number;
  rangeKm: number;
  batteryKwh: number;
  acceleration: number;
  segment: string;
  motorPowerHp: number;
  marketStatus?: string;
  /** Operatör girmediyse boştur — kartta uydurma değer gösterilmez. */
  dcChargeKw: number | null;
  /** Editör puanı; gerçek bir inceleme yoksa boştur. */
  rating: number | null;
  syncImages?: {
    id: string;
    url: string;
    type: string;
    isPrimary: boolean;
  }[];
};

export default function VehicleCard({ vehicle }: { vehicle: VehicleLite }) {
  // Prioritize verified syncImages over legacy static image URL
  const syncImages = (vehicle.syncImages || []).filter(
    (img) => img.type !== "ignored" && img.type !== "deleted"
  );

  let displayImage = vehicle.image;
  if (syncImages.length > 0) {
    let coverImg = syncImages.find((img) => img.isPrimary && img.type === "exterior");
    if (!coverImg) {
      coverImg = syncImages.find((img) => img.isPrimary && img.type !== "interior");
    }
    if (!coverImg) {
      coverImg = syncImages.find((img) => img.type === "exterior");
    }
    if (!coverImg) {
      coverImg = syncImages.find((img) => img.type !== "interior");
    }
    if (!coverImg) {
      coverImg = syncImages[0];
    }

    if (coverImg) {
      displayImage = coverImg.url;
    }
  }

  const isPlaceholder = (url: string) => {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes("placeholder") || lower.includes("unspl");
  };

  if (isPlaceholder(displayImage) && vehicle.image && !isPlaceholder(vehicle.image)) {
    displayImage = vehicle.image;
  } else if (isPlaceholder(displayImage)) {
    displayImage = "/arac-placeholder.svg";
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg">
      <Link
        href={`/araclar/${vehicle.slug}`}
        className="relative block aspect-[16/10] w-full bg-neutral-100"
      >
        <Image
          src={displayImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width:640px) 100vw, 340px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded bg-evos-ink/85 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
          {vehicle.segment}
        </span>
        <span className={`absolute left-2 bottom-2 rounded px-2 py-0.5 text-[10px] font-black text-white backdrop-blur ${
          vehicle.marketStatus === "TR_YOK" ? "bg-neutral-600/85" : "bg-teal-600/85"
        }`}>
          {vehicle.marketStatus === "TR_YOK" ? "TR'de Yok" : "TR'de Var"}
        </span>
        {vehicle.rating != null && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-volt px-2 py-0.5 text-[10px] font-black text-white">
            ★ {vehicle.rating.toFixed(1)}
          </span>
        )}
      </Link>


      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <BrandBadge brand={vehicle.brand} size="sm" />
        </div>

        <Link href={`/araclar/${vehicle.slug}`}>
          <h3 className="text-[15px] font-black leading-tight text-neutral-900 transition group-hover:text-evos">
            {vehicle.brand}{" "}
            <span className="font-bold text-neutral-600">{vehicle.model}</span>
          </h3>
        </Link>

        <div className="grid grid-cols-3 gap-1 border-y border-neutral-100 py-2">
          <div className="flex flex-col items-center gap-0.5">
            <IconGauge className="h-4 w-4 text-volt" />
            <span className="text-[13px] font-black text-neutral-800">
              {vehicle.rangeKm}
            </span>
            <span className="text-[9px] font-semibold text-neutral-400">km</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 border-x border-neutral-100">
            <IconBattery className="h-4 w-4 text-volt" />
            <span className="text-[13px] font-black text-neutral-800">
              {vehicle.batteryKwh}
            </span>
            <span className="text-[9px] font-semibold text-neutral-400">kWh</span>
          </div>
          {/* DC şarj gücü bilinmiyorsa yerine motor gücü gösterilir. */}
          <div className="flex flex-col items-center gap-0.5">
            <IconBolt className="h-4 w-4 text-volt" />
            <span className="text-[13px] font-black text-neutral-800">
              {vehicle.dcChargeKw ?? vehicle.motorPowerHp}
            </span>
            <span className="text-[9px] font-semibold text-neutral-400">
              {vehicle.dcChargeKw != null ? "kW DC" : "HP"}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-neutral-400">
              Anahtar teslim
            </span>
            <span className="text-base font-black text-evos">
              {formatTL(vehicle.price)}
            </span>
          </div>
          <span className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-600">
            0-100: {vehicle.acceleration}s
          </span>
        </div>

        {/* Sıfır model, pazaryerindeki ikinci el ilanlarla aynı sepete girer;
            "sıfır mı ikinci el mi" karşılaştırması bu sayede mümkün olur. */}
        <div className="border-t border-neutral-100 pt-2">
          <CompareButton kind="vehicle" slug={vehicle.slug} className="w-full" />
        </div>
      </div>
    </article>
  );
}
