import EntityForm from "@/components/admin/EntityForm";
import { stationFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default function NewStationPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">Yeni Şarj İstasyonu</h2>
      <EntityForm
        fields={stationFields}
        endpoint="/api/stations"
        method="POST"
        redirectTo="/admin/istasyonlar"
        submitLabel="İSTASYONU EKLE"
      />
    </div>
  );
}
