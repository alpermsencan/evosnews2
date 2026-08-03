import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { listingFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const l = await prisma.listing.findUnique({ where: { id } });
  if (!l) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">İlanı Düzenle</h2>
      <EntityForm
        fields={listingFields}
        initial={{
          title: l.title,
          brand: l.brand,
          model: l.model,
          year: l.year,
          km: l.km,
          price: l.price,
          city: l.city,
          color: l.color,
          rangeKm: l.rangeKm,
          batteryHealth: l.batteryHealth,
          sellerType: l.sellerType,
          sellerName: l.sellerName,
          damage: l.damage,
          image: l.image,
          images: l.images,
          isSponsored: l.isSponsored,
          description: l.description,
        }}
        endpoint={`/api/listings/${l.id}`}
        method="PUT"
        redirectTo="/admin/ilanlar"
      />
    </div>
  );
}
