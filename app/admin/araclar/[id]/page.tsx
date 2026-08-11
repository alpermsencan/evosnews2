import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { vehicleFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = await prisma.vehicle.findUnique({ where: { id } });
  if (!v) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">
        {v.brand} {v.model} — Düzenle
      </h2>
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
          image: v.image,
          isFeatured: v.isFeatured,
          pros: v.pros,
          cons: v.cons,
          description: v.description,
        }}
        endpoint={`/api/vehicles/${v.id}`}
        method="PUT"
        redirectTo="/admin/araclar"
      />
    </div>
  );
}
