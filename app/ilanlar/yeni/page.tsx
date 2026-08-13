import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ListingForm from "@/components/listings/ListingForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "İlan Ver",
  description: "Elektrikli aracınızı Evos pazaryerinde satışa çıkarın.",
};

export default async function NewListingPage() {
  // Katalogla eşleştirme, satıcının teknik veriyi yeniden girmesini önler ve
  // gerçek menzil uyumunun hesaplanabilmesi için referans menzili sağlar.
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, brand: true, model: true, year: true, rangeKm: true },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  });

  return (
    <div className="flex flex-col gap-5 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-2">
        <nav className="flex items-center gap-2 text-[11px] font-bold text-neutral-400">
          <Link href="/ilanlar" className="hover:text-evos">İLANLAR</Link>
          <span>›</span>
          <span className="text-neutral-600">İLAN VER</span>
        </nav>
        <h1 className="text-2xl font-black text-neutral-900">İlan Ver</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
          Elektrikli aracınızı yayınlayın. Batarya sağlığı, servis geçmişi ve
          şarj alışkanlığı gibi bilgiler aracınızın VoltScore güven puanını
          oluşturur — bu bilgileri paylaşan ilanlar alıcı tarafından daha çok
          tercih edilir.
        </p>
      </header>

      <ListingForm
        vehicles={vehicles.map((v) => ({
          id: v.id,
          label: `${v.brand} ${v.model} (${v.year})`,
          rangeKm: v.rangeKm,
        }))}
      />
    </div>
  );
}
