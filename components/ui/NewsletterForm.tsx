"use client";

import { useState } from "react";

export default function NewsletterForm({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kayıt yapılamadı");
      setState("ok");
      setMsg(data.message || "Bültene kaydınız alındı.");
      setEmail("");
    } catch (err) {
      setState("err");
      setMsg(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const dark = variant === "dark";

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-2">
      <span
        className={`text-xs font-bold ${dark ? "text-white/80" : "text-neutral-600"}`}
      >
        Günlük elektrikli mobilite bülteni
      </span>
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className={`min-w-0 flex-1 rounded-md px-3 py-2.5 text-sm outline-none ${
            dark
              ? "bg-white/10 text-white placeholder:text-white/40 focus:bg-white/15"
              : "border border-neutral-300 bg-white text-neutral-800 focus:border-evos"
          }`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 rounded-md bg-evos px-5 py-2.5 text-sm font-bold text-white transition hover:bg-evos-dark disabled:opacity-60"
        >
          {state === "loading" ? "Gönderiliyor..." : "Kaydol"}
        </button>
      </div>
      {state === "ok" && (
        <span className="text-xs font-semibold text-volt">{msg}</span>
      )}
      {state === "err" && (
        <span className="text-xs font-semibold text-evos">{msg}</span>
      )}
    </form>
  );
}
