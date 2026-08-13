import { prisma } from "@/lib/prisma";
import SourcePanel, { type SourceRow } from "@/components/admin/SourcePanel";
import FreshnessBoard from "@/components/admin/FreshnessBoard";
import { checkFreshness } from "@/lib/freshness";

export const dynamic = "force-dynamic";

export default async function AdminSources() {
  const [sources, runs, health] = await Promise.all([
    prisma.dataSource.findMany({ orderBy: [{ kind: "asc" }, { key: "asc" }] }),
    prisma.ingestRun.findMany({ orderBy: { startedAt: "desc" }, take: 200 }),
    // Beslemesi olmayan veri kümeleri (araç kataloğu, tarifeler) buradaki
    // kaynak listesinde görünmez; tazelikleri ayrıca denetlenir.
    checkFreshness(),
  ]);

  const recentRuns = runs.slice(0, 20);

  // Her kaynağın en son çalışması — tek sorgudan türetilir.
  const latestByKey = new Map<string, (typeof runs)[number]>();
  for (const run of runs) {
    if (!latestByKey.has(run.sourceKey)) latestByKey.set(run.sourceKey, run);
  }

  const rows: SourceRow[] = sources.map((s) => {
    const run = latestByKey.get(s.key);
    return {
      id: s.id,
      key: s.key,
      name: s.name,
      kind: s.kind,
      endpoint: s.endpoint,
      categorySlug: s.categorySlug,
      keywords: s.keywords,
      isActive: s.isActive,
      autoPublish: s.autoPublish,
      schedule: s.schedule,
      lastRunAt: s.lastRunAt?.toISOString() ?? null,
      lastOkAt: s.lastOkAt?.toISOString() ?? null,
      lastError: s.lastError,
      lastRun: run
        ? {
            status: run.status,
            fetched: run.fetched,
            created: run.created,
            updated: run.updated,
            skipped: run.skipped,
            failed: run.failed,
            durationMs: run.durationMs,
          }
        : null,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-black text-neutral-900">
          Veri Kaynakları ({sources.length})
        </h2>
        <p className="text-sm text-neutral-500">
          Otomatik veri akışı. Zamanlama Vercel Cron tarafından tetiklenir; buradan
          elle de çalıştırabilirsiniz.
        </p>
      </div>

      <FreshnessBoard report={health} />

      <SourcePanel sources={rows} />

      <div className="flex flex-col gap-2">
        <h3 className="text-[15px] font-black text-neutral-900">Son Çalışmalar</h3>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-[12px]">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-black tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">KAYNAK</th>
                <th className="px-3 py-2">DURUM</th>
                <th className="px-3 py-2">ÇEKİLEN</th>
                <th className="px-3 py-2">YENİ</th>
                <th className="px-3 py-2">GÜNCEL</th>
                <th className="px-3 py-2">SÜRE</th>
                <th className="px-3 py-2">ZAMAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentRuns.map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2 font-bold text-neutral-800">{r.sourceKey}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-black text-white ${
                        r.status === "ok"
                          ? "bg-volt"
                          : r.status === "error"
                            ? "bg-evos"
                            : "bg-amber-500"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.fetched}</td>
                  <td className="px-3 py-2">{r.created}</td>
                  <td className="px-3 py-2">{r.updated}</td>
                  <td className="px-3 py-2 text-neutral-500">{r.durationMs} ms</td>
                  <td className="px-3 py-2 text-neutral-500">
                    {r.startedAt.toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
              {recentRuns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-neutral-400">
                    Henüz çalışma kaydı yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
