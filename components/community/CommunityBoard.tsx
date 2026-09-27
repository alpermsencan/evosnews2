"use client";

import Image from "next/image";
import { useState } from "react";
import { timeAgo } from "@/lib/utils";
import { IconBolt, IconClose, IconMessage, IconShare, IconUsers } from "@/components/ui/Icons";

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
  const [form, setForm] = useState({
    title: "",
    body: "",
    author: "",
    topic: topics[0] ?? "Genel",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Beğeni durumu ve yorum açık olan postlar
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [postComments, setPostComments] = useState<Record<string, { author: string; text: string; time: string }[]>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const shown = filter ? posts.filter((p) => p.topic === filter) : posts;

  const handleLike = async (id: string) => {
    const isLiked = likedPosts[id];
    setLikedPosts((prev) => ({ ...prev, [id]: !isLiked }));
    setPosts((ps) =>
      ps.map((p) =>
        p.id === id
          ? { ...p, likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p
      )
    );
    if (!isLiked) {
      await fetch(`/api/community/${id}`, { method: "POST" }).catch(() => {});
    }
  };

  const handleToggleComments = (id: string) => {
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPostComments((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        { author: "Siz (Kullanıcı)", text, time: "Az önce" },
      ],
    }));

    setPosts((ps) =>
      ps.map((p) => (p.id === postId ? { ...p, replies: p.replies + 1 } : p))
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleShare = (post: Post) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/topluluk#${post.id}`);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
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
      if (!res.ok) throw new Error(data.error || "Gönderi paylaşılamadı");
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
      {/* FACEBOOK TARZI "NE DÜŞÜNÜYORSUNUZ?" KUTUSU */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-blue-700 text-base font-black text-white shadow-sm">
            E
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-100/80 px-4 py-2.5 text-left text-sm font-semibold text-neutral-500 transition hover:bg-neutral-200/70"
          >
            Ne düşünüyorsunuz? Deneyim veya sorunuzu paylaşın...
          </button>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-neutral-150 pt-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100"
          >
            <span className="text-base text-emerald-600">📷</span>
            <span>Görsel / Not</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100"
          >
            <span className="text-base text-sky-600">🏷️</span>
            <span>Konu Başlığı</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-neutral-600 transition hover:bg-neutral-100"
          >
            <span className="text-base text-amber-500">⚡</span>
            <span>EV Deneyimi</span>
          </button>
        </div>
      </div>

      {/* FACEBOOK TARZI PAYLAŞIM POPUP MODALI */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
              <h3 className="text-base font-black text-neutral-900">
                Gönderi Oluştur
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={submit} className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {form.author ? form.author.charAt(0).toUpperCase() : "E"}
                </div>
                <div className="flex flex-col flex-1">
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Adınız veya Kullanıcı Adınız"
                    className="w-full text-xs font-black text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                  <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
                    <span>🌐</span> Herkese Açık Paylaşım
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Başlık (ör. Togg T10X ile 800 km kış seyahatim)"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-bold text-neutral-900 outline-none focus:border-sky-500 focus:bg-white"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500">Konu:</span>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:border-sky-500"
                  >
                    {topics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    {!topics.includes("Genel") && <option value="Genel">Genel</option>}
                    {!topics.includes("Şarj Deneyimi") && (
                      <option value="Şarj Deneyimi">Şarj Deneyimi</option>
                    )}
                    {!topics.includes("Batarya & Menzil") && (
                      <option value="Batarya & Menzil">Batarya & Menzil</option>
                    )}
                  </select>
                </div>

                <textarea
                  required
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Neler konuşmak istersiniz? Elektrikli araç deneyiminizi, şarj tecrübenizi veya bir sorunuzu yazın..."
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-sm font-medium text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-sky-500 focus:bg-white resize-none"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "PAYLAŞILIYOR..." : "PAYLAŞ"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* KONU FİLTRELEME ETİKETLERİ (HIZLI GEÇİŞ) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setFilter("")}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-black transition ${
            !filter
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
          }`}
        >
          Tüm Akış
        </button>
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-black transition ${
              filter === t
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            #{t}
          </button>
        ))}
      </div>

      {/* FACEBOOK TARZI GÖNDERİ LİSTESİ */}
      <div className="flex flex-col gap-4">
        {shown.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm font-semibold text-neutral-500 shadow-sm">
            Bu kategoride henüz gönderi yok. İlk paylaşımı siz yapın!
          </div>
        ) : (
          shown.map((p) => {
            const isLiked = likedPosts[p.id];
            const areCommentsOpen = openComments[p.id];
            const currentComments = postComments[p.id] || [];

            return (
              <article
                key={p.id}
                id={p.id}
                className="flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md overflow-hidden"
              >
                {/* Gönderi Üst Başlık (Yazar Bilgisi) */}
                <div className="flex items-start justify-between p-4 pb-2">
                  <div className="flex items-center gap-3">
                    {p.avatar ? (
                      <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-sky-500/20">
                        <Image
                          src={p.avatar}
                          alt={p.author}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-indigo-700 text-base font-black text-white shadow-inner">
                        {p.author.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-neutral-900 text-sm hover:underline cursor-pointer">
                          {p.author}
                        </span>
                        <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 text-[10px] font-black">
                          #{p.topic}
                        </span>
                        {p.isPinned && (
                          <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-black">
                            📌 Sabit
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1 mt-0.5">
                        <span>{timeAgo(p.createdAt)}</span>
                        <span>·</span>
                        <span>🌐 Herkese Açık</span>
                      </span>
                    </div>
                  </div>

                  <button className="text-neutral-400 hover:text-neutral-600 p-1 text-sm font-bold">
                    •••
                  </button>
                </div>

                {/* Gönderi İçeriği */}
                <div className="px-4 py-2 flex flex-col gap-2">
                  <h3 className="text-base font-black text-neutral-950 leading-snug">
                    {p.title}
                  </h3>
                  <p className="whitespace-pre-line text-[14px] leading-relaxed text-neutral-700 font-normal">
                    {p.body}
                  </p>
                </div>

                {/* Beğeni ve Yorum Sayıları Çubuğu */}
                <div className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-neutral-500 border-b border-neutral-100 mx-4">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                      👍
                    </span>
                    <span>{p.likes} beğeni</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleComments(p.id)}
                      className="hover:underline"
                    >
                      {p.replies + currentComments.length} yorum
                    </button>
                    {copiedId === p.id && (
                      <span className="text-emerald-600 font-bold text-[11px]">
                        ✓ Link kopyalandı!
                      </span>
                    )}
                  </div>
                </div>

                {/* FACEBOOK ETKİLEŞİM BUTONLARI (BEĞEN, YORUM YAP, PAYLAŞ) */}
                <div className="grid grid-cols-3 gap-1 px-4 py-1 text-xs font-black">
                  <button
                    type="button"
                    onClick={() => handleLike(p.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition active:scale-95 ${
                      isLiked
                        ? "text-blue-600 bg-blue-50/70"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="text-base">{isLiked ? "👍" : "👍🏻"}</span>
                    <span>Beğen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleComments(p.id)}
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-neutral-600 hover:bg-neutral-100 transition active:scale-95"
                  >
                    <span className="text-base">💬</span>
                    <span>Yorum Yap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(p)}
                    className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-neutral-600 hover:bg-neutral-100 transition active:scale-95"
                  >
                    <span className="text-base">↗️</span>
                    <span>Paylaş</span>
                  </button>
                </div>

                {/* YORUMLAR BÖLÜMÜ (Tıklanınca açılır veya doğrudan yazılabilir) */}
                {areCommentsOpen && (
                  <div className="flex flex-col gap-3 bg-neutral-50/70 p-4 border-t border-neutral-150">
                    {/* Önceki Yorumlar */}
                    {currentComments.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {currentComments.map((c, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-xs font-bold text-neutral-700">
                              {c.author.charAt(0)}
                            </div>
                            <div className="flex flex-col rounded-2xl bg-white px-3.5 py-2 border border-neutral-200 text-xs shadow-2xs">
                              <span className="font-black text-neutral-900">{c.author}</span>
                              <span className="text-neutral-700 mt-0.5">{c.text}</span>
                              <span className="text-[10px] text-neutral-400 mt-1">{c.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Yorum Yazma Kutusu */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        S
                      </div>
                      <div className="flex flex-1 items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 focus-within:border-blue-500 shadow-2xs">
                        <input
                          type="text"
                          value={commentInputs[p.id] || ""}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [p.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(p.id);
                          }}
                          placeholder="Bir yorum yazın..."
                          className="w-full text-xs font-semibold text-neutral-900 outline-none placeholder:text-neutral-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(p.id)}
                          className="text-xs font-black text-blue-600 hover:text-blue-700 px-1 shrink-0"
                        >
                          Gönder
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
