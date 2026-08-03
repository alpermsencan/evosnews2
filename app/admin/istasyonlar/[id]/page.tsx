import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { stationFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function EditStationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const s = await prisma.chargeStation.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">{s.name} — Düzenle</h2>
      <EntityForm
        fields={stationFields}
        initial={{
          name: s.name,
          slug: s.slug,
          operator: s.operator,
          city: s.city,
          district: s.district,
          address: s.address,
          lat: s.lat,
          lng: s.lng,
          socketCount: s.socketCount,
          maxPowerKw: s.maxPowerKw,
          pricePerKwh: s.pricePerKwh,
          status: s.status,
          socketTypes: s.socketTypes,
          amenities: s.amenities,
          isFast: s.isFast,
          is24h: s.is24h,
        }}
        endpoint={`/api/stations/${s.id}`}
        method="PUT"
        redirectTo="/admin/istasyonlar"
      />
    </div>
  );
}
