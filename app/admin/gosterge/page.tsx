import { prisma } from "@/lib/prisma";
import AdminTable from "@/components/admin/AdminTable";
import EntityForm from "@/components/admin/EntityForm";
import { tickerFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function AdminTicker() {
  const [tickers, polls] = await Promise.all([
    prisma.ticker.findMany({ orderBy: { order: "asc" } }),
    prisma.poll.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const rows = tickers.map((t) => ({
    id: t.id,
    label: t.label,
    search: t.label,
    cells: [
      <span key="l" className="font-bold text-neutral-900">
        {t.label}
      </span>,
      `${t.value}${t.unit ? " " + t.unit : ""}`,
      <span
        key="c"
        className={`rounded px-2 py-1 text-[11px] font-black text-white ${
          t.changePct >= 0 ? "bg-volt" : "bg-evos"
        }`}
      >
        %{t.changePct}
      </span>,
      t.order,
    ],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900">
            Veri Şeridi ({tickers.length})
          </h2>
          <p className="text-sm text-neutral-500">
            Sitenin üst kısmındaki gösterge şeridinde yayınlanan veriler.
          </p>
        </div>
        <AdminTable
          endpoint="/api/ticker"
          deleteQueryParam
          columns={["ETİKET", "DEĞER", "DEĞİŞİM", "SIRA"]}
          rows={rows}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-black text-neutral-900">Yeni Veri Kalemi</h2>
        <EntityForm
          fields={tickerFields}
          endpoint="/api/ticker"
          method="POST"
          redirectTo="/admin/gosterge"
          submitLabel="EKLE"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-black text-neutral-900">Anketler</h2>
        <div className="flex flex-col gap-3">
          {polls.map((p) => {
            const total = p.votes.reduce((a, b) => a + b, 0) || 1;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-neutral-900">
                    {p.question}
                  </h3>
                  <span className="rounded bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-500">
                    {p.isActive ? "AKTİF" : "PASİF"}
                  </span>
                </div>
                {p.options.map((o, i) => (
                  <div key={o} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600">
                      <span>{o}</span>
                      <span>
                        {p.votes[i] ?? 0} oy · %
                        {Math.round(((p.votes[i] ?? 0) / total) * 100)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-volt"
                        style={{ width: `${((p.votes[i] ?? 0) / total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                <span className="text-[11px] text-neutral-400">
                  Toplam {total.toLocaleString("tr-TR")} oy
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
