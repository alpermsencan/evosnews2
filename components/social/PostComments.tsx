"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/user/Avatar";
import { useSession } from "@/components/user/SessionProvider";
import { IconTrash } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/utils";
import type { PostComment } from "./types";

/** Gönderi altındaki yorum listesi; ilk açılışta sunucudan çeker */
export default function PostComments({
  postId,
  onCountChange,
  compact = false,
}: {
  postId: string;
  onCountChange?: (n: number) => void;
  compact?: boolean;
}) {
  const { user } = useSession();
  const [items, setItems] = useState<PostComment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/posts/${postId}/comments`);
        const data = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(data.error || "Yorumlar yüklenemedi");
        setItems(data.items ?? []);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Hata oluştu");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || busy) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorum eklenemedi");
      setItems((c) => [...c, data.comment]);
      setBody("");
      onCountChange?.(data.commentCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const before = items;
    setItems((c) => c.filter((i) => i.id !== id));
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?commentId=${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCountChange?.(data.commentCount);
    } catch {
      setItems(before);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${compact ? "" : "pt-1"}`}>
      {loading ? (
        <span className="text-[12px] font-bold text-neutral-400">
          Yorumlar yükleniyor...
        </span>
      ) : items.length === 0 ? (
        <span className="text-[12px] text-neutral-400">
          Henüz yorum yok. İlk yorumu sen yaz.
        </span>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {items.map((c) => (
            <li key={c.id} className="flex items-start gap-2.5">
              <Link href={`/profil/${c.user.username}`} className="shrink-0">
                <Avatar src={c.user.avatar} name={c.user.name} size="xs" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg bg-neutral-100 px-3 py-2">
                <span className="flex items-center gap-2">
                  <Link
                    href={`/profil/${c.user.username}`}
                    className="text-[12px] font-black text-neutral-800 hover:text-evos"
                  >
                    {c.user.name}
                  </Link>
                  <span className="text-[10px] font-bold text-neutral-400">
                    {timeAgo(c.createdAt)}
                  </span>
                  {c.isMine && (
                    <button
                      onClick={() => void remove(c.id)}
                      aria-label="Yorumu sil"
                      className="ml-auto text-neutral-300 transition hover:text-evos"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
                <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-neutral-700">
                  {c.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={submit} className="flex items-center gap-2">
          <Avatar src={user.avatar} name={user.name} size="xs" />
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={600}
            placeholder="Yorum yaz..."
            className="min-w-0 flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-[13px] outline-none focus:border-evos"
          />
          <button
            type="submit"
            disabled={busy || !body.trim()}
            className="shrink-0 rounded-full bg-evos px-4 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark disabled:opacity-40"
          >
            GÖNDER
          </button>
        </form>
      ) : (
        <Link
          href="/giris"
          className="text-[12px] font-black text-evos hover:underline"
        >
          Yorum yapmak için giriş yap
        </Link>
      )}

      {error && <span className="text-[11px] font-bold text-evos">{error}</span>}
    </div>
  );
}
