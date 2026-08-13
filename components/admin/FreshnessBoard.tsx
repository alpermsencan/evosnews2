import type { DatasetHealth } from "@/lib/freshness";

/**
 * Veri tazeliği tablosu.
 *
 * "Cron çalıştı" ile "veri güncel" aynı şey değildir; bu tablo ikincisini
 * gösterir. Bayat bir küme varsa operatörün ne yapması gerektiği satırda yazar.
 */

function age(hours: number | null) {
  if (hours == null) return "—";
  if (hours < 1) return "az önce";
  if (hours < 24) return `${Math.round(hours)} saat önce`;
  return `${Math.round(hours / 24)} gün önce`;
}

const TONE: Record<DatasetHealth["status"], { chip: string; label: string }> = {
  fresh: { chip: "bg-volt text-white", label: "GÜNCEL" },
  stale: { chip: "bg-evos text-white", label: "BAYAT" },
  unknown: { chip: "bg-neutral-300 text-neutral-700", label: "ÖLÇÜLEMEDİ" },
};

export default function FreshnessBoard({ report }: { report: DatasetHealth[] }) {
  const stale = report.filter((r) => r.status !== "fresh");

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-black text-neutral-900">Veri Tazeliği</h3>
        <span
          className={`rounded px-2 py-1 text-[11px] font-black ${
            stale.length === 0 ? "bg-volt/10 text-volt-dark" : "bg-evos/10 text-evos"
          }`}
        >
          {stale.length === 0
            ? "Tüm veri kümeleri güncel"
            : `${stale.length} küme ilgi bekliyor`}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-[12px]">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] font-black tracking-wide text-neutral-500">
            <tr>
              <th className="px-3 py-2">VERİ KÜMESİ</th>
              <th className="px-3 py-2">DURUM</th>
              <th className="px-3 py-2">SON TAZELEME</th>
              <th className="px-3 py-2">EŞİK</th>
              <th className="px-3 py-2">TAZELEME</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {report.map((r) => (
              <tr key={r.key} className={r.status === "stale" ? "bg-evos/5" : undefined}>
                <td className="px-3 py-2">
                  <span className="font-bold text-neutral-800">{r.label}</span>
                  {r.status !== "fresh" && (
                    <span className="block text-[11px] text-neutral-500">{r.action}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${TONE[r.status].chip}`}>
                    {TONE[r.status].label}
                  </span>
                </td>
                <td className="px-3 py-2 text-neutral-600">
                  {age(r.ageHours)}
                  {r.updatedAt && (
                    <span className="block text-[10px] text-neutral-400">
                      {r.updatedAt.toLocaleString("tr-TR")}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-neutral-500">
                  {r.maxAgeHours >= 24
                    ? `${Math.round(r.maxAgeHours / 24)} gün`
                    : `${r.maxAgeHours} saat`}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                      r.auto ? "bg-neutral-100 text-neutral-600" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.auto ? "OTOMATİK" : "ELLE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-neutral-400">
        &quot;ELLE&quot; işaretli kümeleri hiçbir cron tazelemez; eşiği aştıklarında
        operatörün güncellemesi gerekir. Aynı rapor{" "}
        <code className="rounded bg-neutral-100 px-1">/api/cron/health</code>{" "}
        ucundan JSON olarak da alınır (bayat küme varsa HTTP 207 döner).
      </p>
    </section>
  );
}
