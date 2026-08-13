import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { tariffFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function EditTariffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await prisma.operatorTariff.findUnique({ where: { id } });
  if (!t) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-black text-neutral-900">{t.operator} — Düzenle</h2>
      <EntityForm
        fields={tariffFields}
        initial={{
          operator: t.operator,
          slug: t.slug,
          website: t.website,
          acPrice: t.acPrice,
          acPriceMax: t.acPriceMax,
          dcPrice: t.dcPrice,
          dcPriceMax: t.dcPriceMax,
          ultraPrice: t.ultraPrice,
          ultraPriceMax: t.ultraPriceMax,
          sourceUrl: t.sourceUrl,
          isActive: t.isActive,
          aliases: t.aliases,
          note: t.note,
        }}
        endpoint={`/api/tariffs/${t.id}`}
        method="PUT"
        redirectTo="/admin/tarifeler"
      />
    </div>
  );
}
