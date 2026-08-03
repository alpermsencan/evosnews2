"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Avatar from "@/components/user/Avatar";
import { useSession } from "@/components/user/SessionProvider";
import { IconHeart, IconReply, IconTrash } from "@/components/ui/Icons";
import { timeAgo } from "@/lib/utils";

export type CommentUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
} | null;

export type C = {
  id: string;
  name: string;
  body: string;
  likes: number;
  createdAt: string;
  parentId: string | null;
  user: CommentUser;
  likedByMe: boolean;
};

/** Yorum + yanıt zinciri, beğeni ve silme */
export default function CommentSection({
  articleId,
  articleSlug,
  initialComments,
}: {
  articleId: string;
  articleSlug: string;
  initialComments: C[];
}) {
  const { user } = useSession();
  const router = useRouter();

  const [comments, setComments] = useState<C[]>(initialComments);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<C | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kök yorumlar + altlarındaki yanıtlar
  const threads = useMemo(() => {
    const roots = comments.filter((c) => !c.parentId);
    const byParent = new Map<string, C[]>();
    for (const c of comments) {
      if (!c.parentId) continue;
      const list = byParent.get(c.parentId) ?? [];
      list.push(c);
      byParent.set(c.parentId, list);
    }
    for (const list of byParent.values())
      list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    return roots.map((r) => ({ root: r, replies: byParent.get(r.id) ?? [] }));
  }, [comments]);

  const post = async (text: string, parentId?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, body: text, parentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorum gönderilemedi");

      setComments((c) => [{ ...data.comment, likedByMe: false }, ...c]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await post(body)) setBody("");
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTo) return;
    if (await post(replyBody, replyTo.id)) {
      setReplyBody("");
      setReplyTo(null);
    }
  };

  const like = async (id: string) => {
    if (!user) {
      router.push(`/giris?devam=/haber/${articleSlug}`);
      return;
    }
    const before = comments;
    // İyimser güncelleme; hata olursa eski hâle döner
    setComments((cs) =>
      cs.map((c) =>
        c.id === id
          ? {
              ...c,
              likedByMe: !c.likedByMe,
              likes: Math.max(0, c.likes + (c.likedByMe ? -1 : 1)),
            }
          : c
      )
    );
    try {
      const res = await fetch(`/api/comments/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments((cs) =>
        cs.map((c) =>
          c.id === id ? { ...c, likedByMe: data.liked, likes: data.likes } : c
        )
      );
    } catch {
      setComments(before);
    }
  };

  const remove = async (id: string) => {
    const before = comments;
    setComments((cs) => cs.filter((c) => c.id !== id && c.parentId !== id));
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" }).catch(
      () => null
    );
    if (!res || !res.ok) setComments(before);
  };

  const CommentCard = ({ c, isReply }: { c: C; isReply?: boolean }) => {
    const mine = Boolean(user && c.user && c.user.id === user.id);
    return (
      <div
        id={`yorum-${c.id}`}
        className={`flex scroll-mt-32 gap-3 rounded-lg border border-neutral-200 p-3 ${
          isReply
            ? "ml-6 border-l-2 border-l-evos/30 bg-white sm:ml-10"
            : "bg-neutral-50"
        }`}
      >
        {c.user ? (
          <Link href={`/profil/${c.user.username}`} className="shrink-0">
            <Avatar src={c.user.avatar} name={c.user.name} size="sm" />
          </Link>
        ) : (
          <Avatar name={c.name} size="sm" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            {c.user ? (
              <Link
                href={`/profil/${c.user.username}`}
                className="text-[13px] font-black text-neutral-800 hover:text-evos"
              >
                {c.user.name}
              </Link>
            ) : (
              <span className="text-[13px] font-black text-neutral-800">
                {c.name}
              </span>
            )}
            {c.user && (
              <span className="text-[11px] text-neutral-400">
                @{c.user.username}
              </span>
            )}
            <span className="text-[11px] text-neutral-400">
              {timeAgo(c.createdAt)}
            </span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
            {c.body}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => like(c.id)}
              aria-pressed={c.likedByMe}
              className={`flex items-center gap-1 text-[11px] font-bold transition ${
                c.likedByMe ? "text-evos" : "text-neutral-400 hover:text-evos"
              }`}
            >
              <IconHeart className="h-3.5 w-3.5" filled={c.likedByMe} />
              {c.likes}
            </button>

            {!isReply && (
              <button
                onClick={() => {
                  if (!user) {
                    router.push(`/giris?devam=/haber/${articleSlug}`);
                    return;
                  }
                  setReplyTo(replyTo?.id === c.id ? null : c);
                  setReplyBody("");
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 transition hover:text-evos"
              >
                <IconReply className="h-3.5 w-3.5" />
                Yanıtla
              </button>
            )}

            {mine && (
              <button
                onClick={() => remove(c.id)}
                className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 transition hover:text-evos"
              >
                <IconTrash className="h-3.5 w-3.5" />
                Sil
              </button>
            )}
          </div>

          {replyTo?.id === c.id && (
            <form onSubmit={submitReply} className="mt-2 flex flex-col gap-2">
              <textarea
                required
                autoFocus
                rows={2}
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={`${c.user?.name ?? c.name} kullanıcısına yanıt yaz...`}
                className="w-full resize-y rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-evos"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-evos px-4 py-2 text-[11px] font-black text-white transition hover:bg-evos-dark disabled:opacity-60"
                >
                  {loading ? "GÖNDERİLİYOR..." : "YANITLA"}
                </button>
                <button
                  type="button"
                  onClick={() => setReplyTo(null)}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-[11px] font-bold text-neutral-500 transition hover:border-evos hover:text-evos"
                >
                  VAZGEÇ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      id="yorumlar"
      className="scroll-mt-32 border-t border-neutral-200 px-4 py-6"
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-neutral-900">
        YORUMLAR
        <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-500">
          {comments.length}
        </span>
      </h3>

      {user ? (
        <form onSubmit={submitRoot} className="mb-6 flex gap-3">
          <Avatar src={user.avatar} name={user.name} size="sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder={`${user.name.split(" ")[0]}, bu haber hakkında ne düşünüyorsun?`}
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
          </div>
        </form>
      ) : (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-5 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-neutral-600">
            Yorum yapmak, beğenmek ve tartışmaya katılmak için üye ol veya giriş yap.
          </p>
          <div className="flex gap-2">
            <Link
              href={`/giris?devam=/haber/${articleSlug}`}
              className="rounded-md bg-evos px-5 py-2.5 text-[12px] font-black text-white transition hover:bg-evos-dark"
            >
              GİRİŞ YAP
            </Link>
            <Link
              href="/kayit"
              className="rounded-md border border-neutral-300 px-5 py-2.5 text-[12px] font-black text-neutral-600 transition hover:border-evos hover:text-evos"
            >
              ÜYE OL
            </Link>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {threads.length === 0 && (
          <li className="rounded-md bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
            Henüz yorum yok. İlk yorumu sen yap.
          </li>
        )}
        {threads.map(({ root, replies }) => (
          <li key={root.id} className="flex flex-col gap-2">
            <CommentCard c={root} />
            {replies.map((r) => (
              <CommentCard key={r.id} c={r} isReply />
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
