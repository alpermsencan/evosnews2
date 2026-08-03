"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type Field = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "checkbox"
    | "select"
    | "tags"
    | "color"
    | "date"
    | "url";
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  rows?: number;
  required?: boolean;
  full?: boolean;
};

type Value = string | number | boolean | string[] | null | undefined;

export default function EntityForm({
  fields,
  initial = {},
  endpoint,
  method = "POST",
  redirectTo,
  submitLabel = "KAYDET",
}: {
  fields: Field[];
  initial?: Record<string, Value>;
  endpoint: string;
  method?: "POST" | "PUT";
  redirectTo: string;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, Value>>(() => {
    const base: Record<string, Value> = {};
    for (const f of fields) {
      const v = initial[f.name];
      if (f.type === "tags") {
        base[f.name] = Array.isArray(v) ? (v as string[]).join(", ") : (v as string) ?? "";
      } else if (f.type === "date" && v) {
        base[f.name] = new Date(v as string).toISOString().slice(0, 16);
      } else {
        base[f.name] = (v as Value) ?? (f.type === "checkbox" ? false : "");
      }
    }
    return base;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const set = (name: string, v: Value) =>
    setValues((s) => ({ ...s, [name]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOkMsg("");

    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.type === "tags") {
        payload[f.name] = String(v ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === "number") {
        payload[f.name] = v === "" ? 0 : Number(v);
      } else if (f.type === "checkbox") {
        payload[f.name] = !!v;
      } else {
        payload[f.name] = v;
      }
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kaydedilemedi");
      setOkMsg("Kaydedildi.");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label
            key={f.name}
            className={`flex flex-col gap-1.5 ${f.full ? "sm:col-span-2" : ""}`}
          >
            <span className="text-[11px] font-black tracking-wide text-neutral-500">
              {f.label}
              {f.required && <span className="text-evos"> *</span>}
            </span>

            {f.type === "textarea" ? (
              <textarea
                required={f.required}
                rows={f.rows ?? 5}
                value={String(values[f.name] ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                className="resize-y rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
              />
            ) : f.type === "select" ? (
              <select
                required={f.required}
                value={String(values[f.name] ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
                className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
              >
                <option value="">Seçiniz</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === "checkbox" ? (
              <span className="flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={!!values[f.name]}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="h-4 w-4 accent-evos"
                />
                <span className="text-sm text-neutral-600">
                  {f.placeholder ?? "Aktif"}
                </span>
              </span>
            ) : (
              <input
                required={f.required}
                type={
                  f.type === "number"
                    ? "number"
                    : f.type === "date"
                    ? "datetime-local"
                    : f.type === "color"
                    ? "color"
                    : "text"
                }
                step={f.type === "number" ? "any" : undefined}
                value={String(values[f.name] ?? "")}
                onChange={(e) => set(f.name, e.target.value)}
                placeholder={f.placeholder}
                className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
              />
            )}

            {f.help && (
              <span className="text-[11px] text-neutral-400">{f.help}</span>
            )}
          </label>
        ))}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-4 py-2 text-sm font-bold text-evos">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="rounded-md bg-green-50 px-4 py-2 text-sm font-bold text-volt-dark">
          {okMsg}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-evos px-6 py-3 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
        >
          {loading ? "KAYDEDİLİYOR..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push(redirectTo)}
          className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-bold text-neutral-600 transition hover:border-evos hover:text-evos"
        >
          VAZGEÇ
        </button>
      </div>
    </form>
  );
}
