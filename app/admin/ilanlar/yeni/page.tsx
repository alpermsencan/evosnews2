import EntityForm from "@/components/admin/EntityForm";
import { listingFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default function NewListingPage() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">Yeni İlan</h2>
      <EntityForm
        fields={listingFields}
        endpoint="/api/listings"
        method="POST"
        redirectTo="/admin/ilanlar"
        submitLabel="İLANI YAYINLA"
      />
    </div>
  );
}
