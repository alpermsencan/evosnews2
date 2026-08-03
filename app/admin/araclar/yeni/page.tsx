import EntityForm from "@/components/admin/EntityForm";
import { vehicleFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">Yeni Araç</h2>
      <EntityForm
        fields={vehicleFields}
        endpoint="/api/vehicles"
        method="POST"
        redirectTo="/admin/araclar"
        submitLabel="ARACI EKLE"
      />
    </div>
  );
}
