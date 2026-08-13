import EntityForm from "@/components/admin/EntityForm";
import { tariffFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default function NewTariffPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">Yeni Şarj Tarifesi</h2>
      <EntityForm
        fields={tariffFields}
        initial={{ isActive: true }}
        endpoint="/api/tariffs"
        method="POST"
        redirectTo="/admin/tarifeler"
        submitLabel="TARİFEYİ EKLE"
      />
    </div>
  );
}
