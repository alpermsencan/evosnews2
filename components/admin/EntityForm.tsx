"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { contentToHtml } from "@/lib/utils";
import ImageUpload from "./ImageUpload";
import MultiImageUpload from "./MultiImageUpload";
import RichEditor from "./RichEditor";

export type Field = {
  name: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "richtext"
    | "number"
    | "checkbox"
    | "select"
    | "tags"
    | "color"
    | "date"
    | "url"
    | "image"
    | "images";
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  rows?: number;
  required?: boolean;
  full?: boolean;
  /** Cloudinary klasörü (image / images / richtext alanları için) */
  folder?: string;
};

type Value = string | number | boolean | string[] | null | undefined;

/** Quill boş içerikte "<p><br></p>" döndürür */
function isEmptyHtml(html: string) {
  return !html.replace(/<(p|br|div|span)[^>]*>/gi, "").replace(/<\/[^>]+>/g, "").replace(/&nbsp;|\s/g, "");
}

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
      if (f.type === "images") {
        // Mevcut görsel URL'leri olduğu gibi korunur
        base[f.name] = Array.isArray(v)
          ? (v as string[])
          : String(v ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
      } else if (f.type === "tags") {
        base[f.name] = Array.isArray(v) ? (v as string[]).join(", ") : (v as string) ?? "";
      } else if (f.type === "richtext") {
        // Eski düz metin içerikler editörde paragraflara dönüştürülür
        base[f.name] = contentToHtml(String(v ?? ""));
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
      if (f.type === "images") {
        payload[f.name] = Array.isArray(v) ? v : [];
      } else if (f.type === "tags") {
        payload[f.name] = String(v ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (f.type === "number") {
        payload[f.name] = v === "" ? 0 : Number(v);
      } else if (f.type === "checkbox") {
        payload[f.name] = !!v;
      } else if (f.type === "richtext") {
        const html = String(v ?? "");
        payload[f.name] = isEmptyHtml(html) ? "" : html;
      } else {
        payload[f.name] = v;
      }
    }

    // Zorunlu editör alanlarını tarayıcı doğrulaması yakalayamıyor
    const missing = fields.find(
      (f) => f.required && f.type === "richtext" && !payload[f.name]
    );
    if (missing) {
      setError(`${missing.label} alanı zorunludur`);
      setLoading(false);
      return;
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

  const renderControl = (f: Field) => {
    if (f.type === "image")
      return (
        <ImageUpload
          value={String(values[f.name] ?? "")}
          onChange={(url) => set(f.name, url)}
          folder={f.folder}
          placeholder={f.placeholder}
        />
      );

    if (f.type === "images")
      return (
        <MultiImageUpload
          value={(values[f.name] as string[]) ?? []}
          onChange={(urls) => set(f.name, urls)}
          folder={f.folder}
        />
      );

    if (f.type === "richtext")
      return (
        <RichEditor
          value={String(values[f.name] ?? "")}
          onChange={(html) => set(f.name, html)}
          placeholder={f.placeholder}
          folder={f.folder}
        />
      );

    if (f.type === "textarea")
      return (
        <textarea
          required={f.required}
          rows={f.rows ?? 5}
          value={String(values[f.name] ?? "")}
          onChange={(e) => set(f.name, e.target.value)}
          placeholder={f.placeholder}
          className="resize-y rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
        />
      );

    if (f.type === "select")
      return (
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
      );

    if (f.type === "checkbox")
      return (
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
      );

    return (
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
    );
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          // Karmaşık alanlarda label sarmalamak tıklamaları bozar
          const complex =
            f.type === "image" || f.type === "images" || f.type === "richtext";
          const Wrapper = complex ? "div" : "label";
          const wide = f.full || complex;

          return (
            <Wrapper
              key={f.name}
              className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}
            >
              <span className="text-[11px] font-black tracking-wide text-neutral-500">
                {f.label}
                {f.required && <span className="text-evos"> *</span>}
              </span>

              {renderControl(f)}

              {f.help && (
                <span className="text-[11px] text-neutral-400">{f.help}</span>
              )}
            </Wrapper>
          );
        })}
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
