import { prisma } from "@/lib/prisma";
import GarageAdmin from "@/components/admin/GarageAdmin";

export const dynamic = "force-dynamic";

export default async function AdminGarage() {
  const [features, vehicles] = await Promise.all([
    prisma.garageFeature.findMany({
      orderBy: [{ brand: "asc" }, { model: "asc" }, { order: "asc" }],
    }),
    prisma.vehicle.findMany({
      select: { slug: true, brand: true, model: true },
      orderBy: [{ brand: "asc" }, { model: "asc" }],
    }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-black text-neutral-900">
          Dijital Garaj — Yazılım Özellikleri ({features.length})
        </h2>
        <p className="text-sm text-neutral-500">
          Marka/model bazlı yazılım özellikleri. Bilgi marka donanım listesinden
          doğrulanarak girilir; kaynağı belirsiz özellik eklenmez.
        </p>
      </div>

      <GarageAdmin
        features={features.map((f) => ({
          id: f.id,
          brand: f.brand,
          model: f.model,
          name: f.name,
          status: f.status,
          note: f.note,
          source: f.source,
        }))}
        vehicles={vehicles}
      />
    </div>
  );
}
