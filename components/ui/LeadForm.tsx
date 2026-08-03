"use client";

import { useState } from "react";

export default function LeadForm({
  topic = "genel",
  compact = false,
}: {
  topic?: string;
  compact?: boolean;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderilemedi");
      setState("ok");
      setMsg(data.message);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setState("err");
      setMsg(err instanceof Error ? err.message : "Hata oluştu");
    }
  };

  if (state === "ok") {
    return (
      <div className="rounded-md bg-volt/10 p-4 text-sm font-semibold text-volt-dark">
        {msg}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className={`flex flex-col gap-3 ${compact ? "" : "sm:flex-row"}`}>
        <input
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ad Soyad"
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="E-posta"
          className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
        />
      </div>
      <input
        value={form.phone}
        onChange={(e) => set("phone", e.target.value)}
        placeholder="Telefon (opsiyonel)"
        className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
      />
      <textarea
        required
        rows={compact ? 3 : 4}
        value={form.message}
        onChange={(e) => set("message", e.target.value)}
        placeholder="Mesajınız"
        className="resize-y rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
      />
      {state === "err" && (
        <span className="text-xs font-bold text-evos">{msg}</span>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="rounded-md bg-evos px-5 py-2.5 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
      >
        {state === "loading" ? "GÖNDERİLİYOR..." : "GÖNDER"}
      </button>
    </form>
  );
}
