"use client";

import Image from "next/image";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";

export type Post = {
  id: string;
  title: string;
  slug: string;
  body: string;
  author: string;
  avatar: string | null;
  topic: string;
  likes: number;
  replies: number;
  isPinned: boolean;
  createdAt: string;
};

export default function CommunityBoard({
  initialPosts,
  topics,
}: {
  initialPosts: Post[];
  topics: string[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", author: "", topic: topics[0] ?? "Genel" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shown = filter ? posts.filter((p) => p.topic === filter) : posts;

  const like = async (id: string) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
    await fetch(`/api/community/${id}`, { method: "POST" }).catch(() => {});
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPosts((ps) => [data.post, ...ps]);
      setForm({ title: "", body: "", author: "", topic: topics[0] ?? "Genel" });
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderi eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Konu filtreleri + yeni gönderi */}
      <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter("")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              !filter ? "bg-orange-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Tümü
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filter === t ? "bg-orange-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => setOpen((o) => !o)}
            className="ml-auto rounded-md bg-evos px-4 py-2 text-xs font-black text-white transition hover:bg-evos-dark"
          >
            {open ? "VAZGEÇ" : "+ YENİ KONU AÇ"}
          </button>
        </div>

        {open && (
          <form onSubmit={submit} className="flex flex-col gap-3 border-t border-neutral-100 pt-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                required
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Adınız"
                className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos sm:w-52"
              />
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos sm:w-48"
              >
                {topics.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Konu başlığı"
                className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
              />
            </div>
            <textarea
              required
              rows={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Deneyiminizi paylaşın..."
              className="resize-y rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
            />
            {error && <span className="text-xs font-bold text-evos">{error}</span>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-orange-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-orange-700 disabled:opacity-60 sm:w-fit"
            >
              {loading ? "PAYLAŞILIYOR..." : "PAYLAŞ"}
            </button>
          </form>
        )}
      </div>

      {/* Gönderiler */}
      <div className="flex flex-col gap-3">
        {shown.map((p) => (
          <article
            key={p.id}
            id={p.slug}
            className="flex gap-3 rounded-lg border border-neutral-200 bg-white p-4"
          >
            {p.avatar ? (
              <Image
                src={p.avatar}
                alt={p.author}
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 font-black text-orange-700">
                {p.author.charAt(0)}
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {p.isPinned && (
                  <span className="rounded bg-evos px-1.5 py-0.5 text-[10px] font-black text-white">
                    SABİT
                  </span>
                )}
                <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-black text-orange-700">
                  {p.topic.toUpperCase()}
                </span>
                <span className="text-[11px] font-semibold text-neutral-400">
                  {p.author} · {timeAgo(p.createdAt)}
                </span>
              </div>

              <h3 className="text-[16px] font-black leading-snug text-neutral-900">
                {p.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-neutral-600">{p.body}</p>

              <div className="flex items-center gap-4 pt-1">
                <button
                  onClick={() => like(p.id)}
                  className="text-[12px] font-bold text-neutral-400 transition hover:text-evos"
                >
                  ♥ {p.likes}
                </button>
                <span className="text-[12px] font-bold text-neutral-400">
                  {p.replies} yanıt
                </span>
              </div>
            </div>
          </article>
        ))}

        {shown.length === 0 && (
          <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
            Bu konuda henüz gönderi yok. İlk konuyu siz açın.
          </p>
        )}
      </div>
    </div>
  );
}
