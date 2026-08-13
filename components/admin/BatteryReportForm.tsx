"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Batarya raporu giriş formu (panel).
 *
 * Yalnızca ÖLÇÜLEN değerler istenir. Kalan ömür ve risk seviyesi formda YOKTUR
 * — sunucu bunları ölçümlerden hesaplar (bkz. lib/battery-report.ts). Kaydettikten
 * sonra hesaplanan değerler geri gösterilir ki operatör sonucu görebilsin.
 */
export default function BatteryReportForm({
  listingId,
  initial,
}: {
  listingId: string;
  initial?: {
    sohPercent: number;
    cycleCount: number | null;
    fastChargeRatio: number | null;
    odometerKm: number | null;
    measuredBy: string;
    measuredAt: string;
    verifiedAt: string | null;
    estimatedYearsLeft: number | null;
    riskLevel: string | null;
  } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    estimatedYearsLeft: number | null;
    riskLevel: string | null;
    rationale: string[];
  } | null>(null);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch(`/api/listings/${listingId}/battery-report`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Kaydedilemedi");
      setResult(json.assessment);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/battery-report`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ verifiedBy: "Evos" }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Doğrulanamadı");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  const cls = "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-volt";

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <L label="ÖLÇÜLEN SOH (%)">
          <input name="sohPercent" type="number" step="0.1" min={1} max={100} required
            defaultValue={initial?.sohPercent} className={cls} />
        </L>
        <L label="ÇEVRİM SAYISI">
          <input name="cycleCount" type="number" min={0} defaultValue={initial?.cycleCount ?? ""} className={cls} />
        </L>
        <L label="DC HIZLI ŞARJ ORANI (%)">
          <input name="fastChargeRatio" type="number" min={0} max={100}
            defaultValue={initial?.fastChargeRatio ?? ""} className={cls} />
        </L>
        <L label="ÖLÇÜM KİLOMETRESİ">
          <input name="odometerKm" type="number" min={0} defaultValue={initial?.odometerKm ?? ""} className={cls} />
        </L>
        <L label="ÖLÇÜMÜ YAPAN KURUM">
          <input name="measuredBy" required defaultValue={initial?.measuredBy ?? ""} className={cls}
            placeholder="Yetkili servis / ekspertiz firması" />
        </L>
        <L label="ÖLÇÜM TARİHİ">
          <input name="measuredAt" type="date" required
            defaultValue={initial?.measuredAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)}
            className={cls} />
        </L>
      </div>

      {error && <p className="text-[12px] font-bold text-evos">{error}</p>}

      {(result || initial) && (
        <div className="rounded-md bg-neutral-50 p-3 text-[12px] text-neutral-600">
          <strong className="font-black text-neutral-900">Hesaplanan:</strong>{" "}
          kalan ömür {result?.estimatedYearsLeft ?? initial?.estimatedYearsLeft ?? "—"} yıl ·
          risk {result?.riskLevel ?? initial?.riskLevel ?? "—"}
          {result?.rationale && (
            <ul className="mt-1 list-disc pl-4">
              {result.rationale.map((r) => <li key={r}>{r}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy}
          className="rounded-md bg-neutral-900 px-4 py-2 text-[12px] font-black text-white disabled:opacity-60">
          {busy ? "KAYDEDİLİYOR…" : "ÖLÇÜMÜ KAYDET"}
        </button>
        {initial && !initial.verifiedAt && (
          <button type="button" onClick={verify} disabled={busy}
            className="rounded-md bg-volt px-4 py-2 text-[12px] font-black text-white disabled:opacity-60">
            RAPORU DOĞRULA
          </button>
        )}
        {initial?.verifiedAt && (
          <span className="text-[12px] font-bold text-volt-dark">
            ✓ Doğrulandı — ilanda rozet görünüyor
          </span>
        )}
      </div>
      <p className="text-[11px] text-neutral-400">
        Ölçüm değiştirilirse doğrulama düşer ve rapor yeniden onaylanmalıdır.
      </p>
    </form>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-black tracking-wide text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
