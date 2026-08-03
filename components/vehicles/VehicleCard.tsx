import Image from "next/image";
import Link from "next/link";
import { formatTL } from "@/lib/utils";
import { IconBattery, IconBolt, IconGauge } from "@/components/ui/Icons";

export type VehicleLite = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  price: number;
  rangeKm: number;
  batteryKwh: number;
  dcChargeKw: number;
  acceleration: number;
  segment: string;
  rating: number;
};

export default function VehicleCard({ vehicle }: { vehicle: VehicleLite }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg">
      <Link
        href={`/araclar/${vehicle.slug}`}
        className="relative block aspect-[16/10] w-full bg-neutral-100"
      >
        <Image
          src={vehicle.image}
          alt={`${vehicle.brand} ${vehicle.model}`}
          fill
          sizes="(max-width:640px) 100vw, 340px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded bg-evos-ink/85 px-2 py-0.5 text-[10px] font-black text-white backdrop-blur">
          {vehicle.segment}
        </span>
        <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-volt px-2 py-0.5 text-[10px] font-black text-white">
          ★ {vehicle.rating.toFixed(1)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
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
          <div className="flex flex-col items-center gap-0.5">
            <IconBolt className="h-4 w-4 text-volt" />
            <span className="text-[13px] font-black text-neutral-800">
              {vehicle.dcChargeKw}
            </span>
            <span className="text-[9px] font-semibold text-neutral-400">kW DC</span>
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
      </div>
    </article>
  );
}
