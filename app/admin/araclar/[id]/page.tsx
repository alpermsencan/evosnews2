import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { vehicleFields } from "@/components/admin/fieldSets";
import VehicleImagesManager from "@/components/admin/VehicleImagesManager";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = await prisma.vehicle.findUnique({
    where: { id },
    include: { syncImages: true },
  });
  if (!v) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <h2 className="text-lg font-black text-neutral-900">
            {v.brand} {v.model} — Düzenle
          </h2>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Canlı URL: /araclar/{v.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/araclar/${v.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-700 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/40 transition shadow-xs"
          >
            <span>Sitede Canlı Gör</span>
            <span>↗</span>
          </Link>
          <Link
            href="/admin/araclar"
            className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-200 transition"
          >
            ← Araç Listesi
          </Link>
        </div>
      </div>
      <EntityForm
        fields={vehicleFields}
        initial={{
          brand: v.brand,
          model: v.model,
          slug: v.slug,
          year: v.year,
          segment: v.segment,
          bodyType: v.bodyType,
          price: v.price,
          otvRate: v.otvRate,
          rangeKm: v.rangeKm,
          rangeSummerKm: v.rangeSummerKm,
          rangeWinterKm: v.rangeWinterKm,
          rangeSource: v.rangeSource,
          batteryKwh: v.batteryKwh,
          motorPowerKw: v.motorPowerKw,
          motorPowerHp: v.motorPowerHp,
          acceleration: v.acceleration,
          topSpeed: v.topSpeed,
          dcChargeKw: v.dcChargeKw,
          chargeMin: v.chargeMin,
          consumption: v.consumption,
          trunkLiter: v.trunkLiter,
          driveType: v.driveType,
          warranty: v.warranty,
          rating: v.rating,
          image: v.image || (v.syncImages.find((img) => img.isPrimary)?.url) || "",
          gallery: v.images || [],
          isFeatured: v.isFeatured,
          pros: v.pros,
          cons: v.cons,
          description: v.description,
        }}
        endpoint={`/api/vehicles/${v.id}`}
        method="PUT"
        redirectTo="/admin/araclar"
      />
      <VehicleImagesManager vehicleId={v.id} />
    </div>
  );
}
