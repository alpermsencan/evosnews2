import Link from "next/link";
import EntityForm from "@/components/admin/EntityForm";
import { listingFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yeni İlan Ekle — Yönetim Paneli",
};

export default function AdminNewListingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <Link href="/admin/ilanlar" className="text-[11px] font-bold text-neutral-400 hover:text-evos">
            ← İLANLAR
          </Link>
          <h2 className="text-xl font-black text-neutral-900">Yeni İkinci El / Sıfır İlan Ekle</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Admin panelinden doğrudan yayında veya taslak olarak araç ilanı oluşturun.
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs">
        <EntityForm
          fields={listingFields}
          initial={{
            status: "PUBLISHED",
            condition: "IKINCI_EL",
            sellerType: "Galeri",
            damage: "Hasarsız",
            batteryHealth: 100,
            rangeKm: 450,
          }}
          endpoint="/api/listings"
          method="POST"
          redirectTo="/admin/ilanlar"
          submitLabel="İLAN OLUŞTUR VE YAYINLA"
        />
      </section>
    </div>
  );
}
