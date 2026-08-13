"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Dijital garaj özellik yönetimi.
 *
 * Özellikler tek tek değil, model seçilip ARDIŞIK olarak girilir — bir modelin
 * donanım listesi baştan sona işlenirken her seferinde marka/model yazmak
 * gereksiz sürtünme yaratırdı. Form kaydettikten sonra marka/model seçili
 * kalır, yalnızca özellik adı temizlenir.
 */

type Feature = {
  id: string;
  brand: string;
  model: string;
  name: string;
  status: string;
  note: string | null;
  source: string | null;
};

const STATUSES = [
  { value: "AKTIF", label: "Aktif" },
  { value: "OPSIYONEL", label: "Opsiyonel (donanım paketi)" },
  { value: "ABONELIK", label: "Abonelik gerektirir" },
  { value: "PASIF", label: "Pasif (bu modelde yok)" },
];

const cls = "w-full rounded-md border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-evos";

export default function GarageAdmin({
  features,
  vehicles,
}: {
  features: Feature[];
  vehicles: { slug: string; brand: string; model: string }[];
}) {
  const router = useRouter();
  const [brand, setBrand] = useState(vehicles[0]?.brand ?? "");
  const [model, setModel] = useState(vehicles[0]?.model ?? "");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("AKTIF");
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/garage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brand, model, name, status, note, source }),
      });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Eklenemedi");
      // Marka/model korunur; sıradaki özellik hızlıca girilebilsin.
      setName("");
      setNote("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, label: string) {
    if (!confirm(`"${label}" silinecek. Onaylıyor musunuz?`)) return;
    await fetch(`/api/garage?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  const grouped = features.reduce<Record<string, Feature[]>>((acc, f) => {
    const key = `${f.brand} ${f.model}`;
    (acc[key] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={add} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
        <h3 className="text-[15px] font-black text-neutral-900">Özellik ekle</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <L label="KATALOG ARACI">
            <select
              className={cls}
              value={`${brand}|${model}`}
              onChange={(e) => {
                const [b, m] = e.target.value.split("|");
                setBrand(b);
                setModel(m);
              }}
            >
              {vehicles.map((v) => (
                <option key={v.slug} value={`${v.brand}|${v.model}`}>
                  {v.brand} {v.model}
                </option>
              ))}
            </select>
          </L>
          <L label="ÖZELLİK ADI">
            <input value={name} onChange={(e) => setName(e.target.value)} required className={cls}
              placeholder="OTA Yazılım Güncellemeleri" />
          </L>
          <L label="DURUM">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={cls}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </L>
          <L label="KOŞUL NOTU">
            <input value={note} onChange={(e) => setNote(e.target.value)} className={cls}
              placeholder="GT-Line paketi / Uygulamadan" />
          </L>
          <L label="KAYNAK">
            <input value={source} onChange={(e) => setSource(e.target.value)} className={cls}
              placeholder="Marka donanım listesi 2026" />
          </L>
        </div>
        {error && <p className="text-[12px] font-bold text-evos">{error}</p>}
        <button type="submit" disabled={busy}
          className="self-start rounded-md bg-neutral-900 px-5 py-2.5 text-[13px] font-black text-white disabled:opacity-60">
          {busy ? "EKLENİYOR…" : "ÖZELLİĞİ EKLE"}
        </button>
      </form>

      {Object.entries(grouped).map(([key, items]) => (
        <div key={key} className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
            <h3 className="text-[14px] font-black text-neutral-900">{key}</h3>
            <span className="text-[11px] font-bold text-neutral-400">
              {items.length} özellik
            </span>
          </div>
          <ul className="divide-y divide-neutral-100">
            {items.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="text-[13px] font-bold text-neutral-800">{f.name}</span>
                  <span className="text-[11px] text-neutral-400">
                    {f.status}
                    {f.note && ` · ${f.note}`}
                    {f.source && ` · kaynak: ${f.source}`}
                  </span>
                </div>
                <button type="button" onClick={() => remove(f.id, f.name)}
                  className="shrink-0 rounded bg-neutral-100 px-2 py-1 text-[10px] font-black text-neutral-600 hover:bg-evos/10 hover:text-evos">
                  SİL
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {features.length === 0 && (
        <p className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          Henüz özellik girilmedi. Yukarıdaki formdan başlayın.
        </p>
      )}
    </div>
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
