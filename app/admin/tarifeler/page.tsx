import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import { formatTariff } from "@/lib/tariffs";

export const dynamic = "force-dynamic";

export default async function AdminTariffs() {
  const tariffs = await prisma.operatorTariff.findMany({
    orderBy: { operator: "asc" },
  });

  const rows = tariffs.map((t) => ({
    id: t.id,
    label: t.operator,
    search: `${t.operator} ${t.aliases.join(" ")}`,
    cells: [
      <span key="o" className="font-bold text-neutral-900">
        {t.operator}
      </span>,
      formatTariff(t.acPrice, t.acPriceMax),
      formatTariff(t.dcPrice, t.dcPriceMax),
      formatTariff(t.ultraPrice, t.ultraPriceMax),
      // Kaynağı görünür tutmak önemli: "manuel" satırlar toplu içe aktarımda
      // korunur, derleme satırları güncellenir.
      <span
        key="s"
        className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-black text-neutral-500"
      >
        {t.source ?? "—"}
      </span>,
      t.verifiedAt ? t.verifiedAt.toLocaleDateString("tr-TR") : "—",
      t.isActive ? "Yayında" : "Gizli",
    ],
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-neutral-900">
          Şarj Tarifeleri ({tariffs.length})
        </h2>
        <Link
          href="/admin/tarifeler/yeni"
          className="rounded-md bg-volt px-5 py-2.5 text-sm font-black text-white transition hover:bg-volt-dark"
        >
          + YENİ TARİFE
        </Link>
      </div>

      <p className="rounded-lg border border-neutral-200 bg-white p-4 text-[13px] leading-relaxed text-neutral-600">
        Fiyatlar <Link href="/sarj-fiyatlari" className="font-bold text-volt-dark hover:underline">Şarj Fiyatları</Link>{" "}
        sayfasında ve şarj ağı operatör özetinde görünür. Burada düzenlenen her
        satır &quot;manuel&quot; olarak işaretlenir ve toplu içe aktarım
        (<code className="rounded bg-neutral-100 px-1">npm run db:tariffs</code>)
        üzerine yazmaz. Operatörün o kademede hizmeti yoksa alanı BOŞ bırakın —
        0 yazmak &quot;ücretsiz şarj&quot; anlamına gelir.
      </p>

      <AdminTable
        endpoint="/api/tariffs"
        editBase="/admin/tarifeler"
        columns={["OPERATÖR", "AC ≤22 kW", "DC <150 kW", "DC ≥150 kW", "KAYNAK", "DOĞRULAMA", "DURUM"]}
        rows={rows}
      />
    </div>
  );
}
