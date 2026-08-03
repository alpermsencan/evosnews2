"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/utils";

type C = {
  id: string;
  name: string;
  body: string;
  likes: number;
  createdAt: string;
};

export default function CommentSection({
  articleId,
  initialComments,
}: {
  articleId: string;
  initialComments: C[];
}) {
  const [comments, setComments] = useState<C[]>(initialComments);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, name, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorum gönderilemedi");
      setComments((c) => [data.comment, ...c]);
      setName("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const like = async (id: string) => {
    setComments((cs) =>
      cs.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
    await fetch(`/api/comments/${id}/like`, { method: "POST" }).catch(() => {});
  };

  return (
    <section className="border-t border-neutral-200 px-4 py-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-neutral-900">
        YORUMLAR
        <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-500">
          {comments.length}
        </span>
      </h3>

      <form onSubmit={submit} className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
            className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos sm:w-56"
          />
        </div>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Yorumunuzu yazın..."
          className="w-full resize-y rounded-md border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-evos"
        />
        {error && <span className="text-xs font-bold text-evos">{error}</span>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-evos px-6 py-2.5 text-sm font-black text-white transition hover:bg-evos-dark disabled:opacity-60 sm:w-fit"
        >
          {loading ? "GÖNDERİLİYOR..." : "YORUM YAP"}
        </button>
      </form>

      <ul className="flex flex-col gap-3">
        {comments.length === 0 && (
          <li className="rounded-md bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
            Henüz yorum yok. İlk yorumu siz yapın.
          </li>
        )}
        {comments.map((c) => (
          <li
            key={c.id}
            className="flex gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-evos/10 text-sm font-black text-evos">
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black text-neutral-800">
                  {c.name}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {timeAgo(c.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700">{c.body}</p>
              <button
                onClick={() => like(c.id)}
                className="w-fit text-[11px] font-bold text-neutral-400 transition hover:text-evos"
              >
                ♥ {c.likes} beğeni
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
