"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { SessionUser } from "@/lib/auth";

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

interface RedditCommunityProps {
  initialPosts: Post[];
  topics: string[];
  viewer?: SessionUser | null;
}

export default function RedditCommunity({
  initialPosts,
  topics,
  viewer,
}: RedditCommunityProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");

  // Oylama Durumları (Post ID -> 'up' | 'down' | null)
  const [votes, setVotes] = useState<Record<string, "up" | "down" | null>>({});
  const [scoreOffsets, setScoreOffsets] = useState<Record<string, number>>({});

  // Açık Yorumlar & Yorum Listesi
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsMap, setCommentsMap] = useState<
    Record<
      string,
      { id: string; author: string; avatar?: string | null; text: string; time: string; upvotes: number }[]
    >
  >({
    "1": [
      {
        id: "c1",
        author: "Caner Aydın",
        text: "Kışın ısı pompası tüketimi yaklaşık %15-20 oranında rahatlatıyor, tecrübe ile sabit.",
        time: "2 saat önce",
        upvotes: 14,
      },
      {
        id: "c2",
        author: "Murat Demir",
        text: "Hızlı şarjda batarya ön ısıtmasını navigasyon üzerinden açmayı unutmayın.",
        time: "1 saat önce",
        upvotes: 8,
      },
    ],
  });
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});

  // Auth Guard Modal & Yeni Gönderi Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("etkileşim kurmak");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newTopic, setNewTopic] = useState(topics[0] || "Genel");
  const [submitting, setSubmitting] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // Filtreleme & Sıralama
  let displayedPosts = selectedTopic
    ? posts.filter((p) => p.topic.toLowerCase() === selectedTopic.toLowerCase())
    : posts;

  if (sortBy === "top") {
    displayedPosts = [...displayedPosts].sort(
      (a, b) =>
        b.likes + (scoreOffsets[b.id] || 0) - (a.likes + (scoreOffsets[a.id] || 0))
    );
  } else if (sortBy === "new") {
    displayedPosts = [...displayedPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else {
    // Hot (Pinned first, then weighted by likes + replies)
    displayedPosts = [...displayedPosts].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (
        b.likes * 2 +
        b.replies * 3 +
        (scoreOffsets[b.id] || 0) -
        (a.likes * 2 + a.replies * 3 + (scoreOffsets[a.id] || 0))
      );
    });
  }

  // Oy verme işlemi
  const handleVote = (postId: string, direction: "up" | "down") => {
    if (!viewer) {
      setAuthModalReason("oy vermek (upvote / downvote)");
      setShowAuthModal(true);
      return;
    }

    const currentVote = votes[postId] || null;
    let newVote: "up" | "down" | null = direction;
    let offsetChange = 0;

    if (currentVote === direction) {
      // Oyu geri al
      newVote = null;
      offsetChange = direction === "up" ? -1 : 1;
    } else if (currentVote === null) {
      offsetChange = direction === "up" ? 1 : -1;
    } else {
      // Karşı yöne çevir
      offsetChange = direction === "up" ? 2 : -2;
    }

    setVotes((prev) => ({ ...prev, [postId]: newVote }));
    setScoreOffsets((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + offsetChange,
    }));
  };

  // Yorum gönderme işlemi
  const handleSendComment = (postId: string) => {
    if (!viewer) {
      setAuthModalReason("yorum yazmak");
      setShowAuthModal(true);
      return;
    }

    const text = commentInput[postId]?.trim();
    if (!text) return;

    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: viewer.name,
      avatar: viewer.avatar,
      text,
      time: "Az önce",
      upvotes: 1,
    };

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, replies: p.replies + 1 } : p))
    );

    setCommentInput((prev) => ({ ...prev, [postId]: "" }));
  };

  // Yeni gönderi oluşturma
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewer) {
      setAuthModalReason("yeni gönderi paylaşmak");
      setShowAuthModal(true);
      return;
    }

    if (!newTitle.trim() || !newBody.trim()) return;
    setSubmitting(true);

    const post: Post = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      body: newBody.trim(),
      author: viewer.name,
      avatar: viewer.avatar,
      topic: newTopic,
      likes: 1,
      replies: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [post, ...prev]);
    setVotes((prev) => ({ ...prev, [post.id]: "up" }));
    setNewTitle("");
    setNewBody("");
    setShowCreateModal(false);
    setSubmitting(false);
  };

  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText?.(window.location.origin + `/topluluk#post-${postId}`);
    setShareNotice("Gönderi bağlantısı kopyalandı!");
    setTimeout(() => setShareNotice(null), 3000);
  };

  // Konu rengi eşleştirici
  const getTopicColor = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes("togg")) return "bg-red-500/10 text-red-600 border-red-500/30";
    if (t.includes("tesla")) return "bg-rose-500/10 text-rose-600 border-rose-500/30";
    if (t.includes("şarj")) return "bg-sky-500/10 text-sky-600 border-sky-500/30";
    if (t.includes("menzil") || t.includes("kış")) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
    if (t.includes("batarya")) return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    return "bg-neutral-100 text-neutral-700 border-neutral-200";
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto px-3 sm:px-0">
      {/* 1. REDDIT SUBREDDIT BANNER (r/e-aracim) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-neutral-900 to-sky-950 border border-neutral-800 shadow-xl text-white">
        <div className="h-28 sm:h-36 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-600/30 via-transparent to-transparent flex items-end p-4 sm:p-6" />

        <div className="px-5 sm:px-8 pb-5 pt-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 relative z-10">
          <div className="flex items-end gap-4">
            {/* r/ Amblemi */}
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-1 ring-4 ring-neutral-950 shadow-2xl flex items-center justify-center shrink-0">
              <div className="h-full w-full rounded-full bg-neutral-950 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black text-sky-400 leading-none">r/</span>
                <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">EV</span>
                <span className="text-[8px] font-black text-neutral-400 tracking-widest mt-0.5">PILOT</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  r/e-aracim
                </h1>
                <span className="rounded-full bg-sky-500/20 border border-sky-400/40 px-2.5 py-0.5 text-[10px] font-black text-sky-300">
                  Resmî Topluluk
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                Türkiye&apos;nin bağımsız elektrikli araç sahipleri, meraklıları ve uzmanları topluluğu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!viewer) {
                  setAuthModalReason("toplulukta gönderi paylaşmak");
                  setShowAuthModal(true);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-xs sm:text-sm font-black text-white hover:from-sky-400 hover:to-blue-500 transition shadow-lg shadow-sky-500/20 active:scale-95 border border-sky-400/40"
            >
              + Gönderi Oluştur
            </button>
          </div>
        </div>

        {/* Alt Metrik Barı */}
        <div className="flex flex-wrap items-center gap-6 px-6 sm:px-8 py-3 bg-neutral-950/60 border-t border-neutral-800/80 text-xs font-semibold text-neutral-400">
          <div className="flex items-center gap-2">
            <strong className="text-white font-black">15.2K</strong>
            <span>Pilot Üye</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-white font-black">340</strong>
            <span>Şu Anda Çevrimiçi</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Türkiye Sıralaması:</span>
            <strong className="text-sky-400 font-black">#1 Otomotiv &amp; EV</strong>
          </div>
        </div>
      </div>

      {shareNotice && (
        <div className="rounded-xl bg-blue-600 text-white p-3 text-center text-xs font-black shadow-lg">
          {shareNotice}
        </div>
      )}

      {/* 2. ANA İÇERİK IZGARASI (Feed + Sağ Sidebar) */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SOL: POST FEED */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Gönderi Açma Giriş Çubuğu (Reddit Style) */}
          <div
            onClick={() => {
              if (!viewer) {
                setAuthModalReason("yeni gönderi oluşturmak");
                setShowAuthModal(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 px-4 shadow-sm cursor-pointer hover:border-neutral-300 transition"
          >
            <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center font-black text-neutral-600 text-xs shrink-0">
              {viewer ? viewer.name.slice(0, 2).toUpperCase() : "EV"}
            </div>
            <input
              type="text"
              readOnly
              placeholder="r/e-aracim topluluğunda bir konu aç veya soru sor..."
              className="flex-1 bg-neutral-100/70 hover:bg-neutral-100 rounded-xl px-4 py-2 text-xs text-neutral-700 outline-none cursor-pointer"
            />
            <button
              type="button"
              className="text-neutral-400 hover:text-blue-600 p-1.5 transition"
              title="Fotoğraf Ekle"
            >
              📷
            </button>
            <button
              type="button"
              className="text-neutral-400 hover:text-blue-600 p-1.5 transition"
              title="Bağlantı Paylaş"
            >
              🔗
            </button>
          </div>

          {/* Sıralama Barı (Hot / New / Top) & Konu Filtreleri */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs">
            {/* Sort Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSortBy("hot")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                  sortBy === "hot"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>🔥</span>
                <span>Sıcak</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("new")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                  sortBy === "new"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>✨</span>
                <span>Yeni</span>
              </button>

              <button
                type="button"
                onClick={() => setSortBy("top")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition ${
                  sortBy === "top"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <span>🏆</span>
                <span>En İyi</span>
              </button>
            </div>

            {/* Konu Flairs Çubuğu */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
              <button
                type="button"
                onClick={() => setSelectedTopic("")}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-black transition shrink-0 ${
                  selectedTopic === ""
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                Tümü
              </button>
              {topics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTopic(selectedTopic === t ? "" : t)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition shrink-0 ${
                    selectedTopic === t
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* POST LİSTESİ (Reddit Tarzı Kartlar) */}
          <div className="flex flex-col gap-3">
            {displayedPosts.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-neutral-500">
                <span className="text-3xl mb-2 block">📭</span>
                <p className="text-sm font-bold text-neutral-800">Bu konuda henüz gönderi yok.</p>
                <p className="text-xs text-neutral-400 mt-1">İlk gönderiyi sen paylaşarak tartışmayı başlat!</p>
              </div>
            ) : (
              displayedPosts.map((post) => {
                const currentScore = post.likes + (scoreOffsets[post.id] || 0);
                const userVote = votes[post.id] || null;
                const postComments = commentsMap[post.id] || [];
                const isCommentsOpen = !!openComments[post.id];

                return (
                  <article
                    key={post.id}
                    id={`post-${post.id}`}
                    className="flex flex-col rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition shadow-xs overflow-hidden"
                  >
                    <div className="flex">
                      {/* Sol Oylama Sütunu (Reddit Upvote / Downvote Pillar) */}
                      <div className="flex flex-col items-center justify-start gap-1 p-2 sm:p-3 bg-neutral-50/70 border-r border-neutral-100 w-11 sm:w-13 shrink-0 select-none">
                        <button
                          type="button"
                          onClick={() => handleVote(post.id, "up")}
                          aria-label="Yukarı Oy"
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black transition ${
                            userVote === "up"
                              ? "bg-orange-500 text-white"
                              : "text-neutral-500 hover:bg-neutral-200 hover:text-orange-600"
                          }`}
                        >
                          ▲
                        </button>
                        <span
                          className={`text-xs font-black ${
                            userVote === "up"
                              ? "text-orange-600"
                              : userVote === "down"
                              ? "text-blue-600"
                              : "text-neutral-800"
                          }`}
                        >
                          {currentScore}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleVote(post.id, "down")}
                          aria-label="Aşağı Oy"
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-black transition ${
                            userVote === "down"
                              ? "bg-blue-600 text-white"
                              : "text-neutral-500 hover:bg-neutral-200 hover:text-blue-600"
                          }`}
                        >
                          ▼
                        </button>
                      </div>

                      {/* Gönderi Gövdesi */}
                      <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
                        {/* Başlık Üstü Bilgi (Subreddit, Author, Flair, Time) */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                          {post.isPinned && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-black text-emerald-800 text-[10px]">
                              📌 SABİTLENDİ
                            </span>
                          )}
                          <span className="font-bold text-neutral-900">r/e-aracim</span>
                          <span>•</span>
                          <span>Gönderen u/{post.author}</span>
                          <span>•</span>
                          <span>{timeAgo(post.createdAt)}</span>
                          <span
                            className={`rounded-md border px-2 py-0.5 font-black text-[10px] uppercase tracking-wider ${getTopicColor(
                              post.topic
                            )}`}
                          >
                            {post.topic}
                          </span>
                        </div>

                        {/* Gönderi Başlığı */}
                        <h2 className="text-base sm:text-lg font-black text-neutral-900 leading-snug hover:text-blue-600 transition cursor-pointer">
                          {post.title}
                        </h2>

                        {/* Gönderi Metni */}
                        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                          {post.body}
                        </p>

                        {/* Alt Aksiyon Çubuğu (Yorumlar, Paylaş, Kaydet) */}
                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 text-xs font-bold text-neutral-500 select-none">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenComments((prev) => ({
                                ...prev,
                                [post.id]: !prev[post.id],
                              }))
                            }
                            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                              isCommentsOpen
                                ? "bg-blue-50 text-blue-700"
                                : "hover:bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            <span>💬</span>
                            <span>{post.replies} Yorum</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShare(post.id)}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-600 transition"
                          >
                            <span>↗</span>
                            <span>Paylaş</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!viewer) {
                                setAuthModalReason("gönderiyi kaydetmek");
                                setShowAuthModal(true);
                              } else {
                                setShareNotice("Gönderi kaydedildi!");
                                setTimeout(() => setShareNotice(null), 2500);
                              }
                            }}
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-neutral-100 text-neutral-600 transition"
                          >
                            <span>🔖</span>
                            <span>Kaydet</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Genişletilebilir Reddit Yorum Alanı */}
                    {isCommentsOpen && (
                      <div className="bg-neutral-50/60 border-t border-neutral-200 p-4 pl-6 sm:pl-12 flex flex-col gap-3">
                        {/* Yorum Ekleme Kutusu */}
                        <div className="flex flex-col gap-2">
                          <textarea
                            rows={2}
                            value={commentInput[post.id] || ""}
                            onChange={(e) =>
                              setCommentInput((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder={
                              viewer
                                ? "Düşüncelerini veya deneyimini paylaş..."
                                : "Yorum yapmak için giriş yapmalısınız..."
                            }
                            className="w-full rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-800 placeholder-neutral-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleSendComment(post.id)}
                              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white hover:bg-blue-700 transition"
                            >
                              Yorum Yap
                            </button>
                          </div>
                        </div>

                        {/* Var olan yorumlar */}
                        <div className="flex flex-col gap-2.5 pt-2">
                          {postComments.length === 0 ? (
                            <p className="text-xs text-neutral-400 italic">
                              Henüz yorum yapılmamış. İlk yorumu sen yap!
                            </p>
                          ) : (
                            postComments.map((c) => (
                              <div
                                key={c.id}
                                className="flex gap-2.5 rounded-xl border border-neutral-200/80 bg-white p-3 text-xs"
                              >
                                <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-[10px] shrink-0">
                                  {c.author.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-neutral-900">
                                      u/{c.author}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">
                                      {c.time}
                                    </span>
                                  </div>
                                  <p className="text-neutral-700 leading-relaxed">
                                    {c.text}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* SAĞ: SUBREDDIT DETAY SIDEBAR'I */}
        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5">
          {/* Topluluk Hakkında Kartı */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
              r/e-aracim Hakkında
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Türkiye&apos;de elektrikli araç kullanıcılarını, test sürüş deneyimlerini, gerçek şarj ve menzil verilerini bir araya getiren bağımsız forum ve paylaşım platformu.
            </p>

            <div className="flex items-center justify-between border-t border-b border-neutral-100 py-3 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400">Kuruluş</span>
                <strong className="text-neutral-800">2026</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400">Üyeler</span>
                <strong className="text-neutral-800">15.2k Pilot</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400">Durum</span>
                <strong className="text-emerald-600">Herkese Açık</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!viewer) {
                  setAuthModalReason("gönderi oluşturmak");
                  setShowAuthModal(true);
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition text-center shadow-xs"
            >
              + Gönderi Oluştur
            </button>
          </div>

          {/* Topluluk Kuralları */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
              r/e-aracim Kuralları
            </h3>
            <ol className="flex flex-col gap-2 text-xs text-neutral-600 divide-y divide-neutral-100">
              <li className="pt-1.5 flex items-start gap-2">
                <strong className="text-neutral-900">1.</strong>
                <span>Saygılı, yapıcı ve tarafsız olun.</span>
              </li>
              <li className="pt-1.5 flex items-start gap-2">
                <strong className="text-neutral-900">2.</strong>
                <span>Yanıltıcı menzil ve tüketim verisi paylaşmayın.</span>
              </li>
              <li className="pt-1.5 flex items-start gap-2">
                <strong className="text-neutral-900">3.</strong>
                <span>Spam, yetkisiz reklam ve referans linkleri yasaktır.</span>
              </li>
              <li className="pt-1.5 flex items-start gap-2">
                <strong className="text-neutral-900">4.</strong>
                <span>Konuya uygun flair etiketini doğru seçin.</span>
              </li>
            </ol>
          </div>

          {/* Hızlı Linkler & Araçlar */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs flex flex-col gap-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
              Faydalı Araçlar
            </h3>
            <Link
              href="/ilanlar"
              className="flex items-center justify-between text-xs font-bold text-neutral-700 hover:text-blue-600 transition py-1"
            >
              <span>🚗 İkinci El Elektrikli Araçlar</span>
              <span>→</span>
            </Link>
            <Link
              href="/otv-rehberi"
              className="flex items-center justify-between text-xs font-bold text-neutral-700 hover:text-blue-600 transition py-1"
            >
              <span>⚡ 2026 EV ÖTV &amp; Vergi Rehberi</span>
              <span>→</span>
            </Link>
            <Link
              href="/istasyonlar"
              className="flex items-center justify-between text-xs font-bold text-neutral-700 hover:text-blue-600 transition py-1"
            >
              <span>📍 Şarj İstasyonları Haritası</span>
              <span>→</span>
            </Link>
          </div>
        </aside>
      </div>

      {/* 3. AUTH MODAL (Giriş Yapmamış Ziyaretçiler Etkileşime Bastığında Çıkar) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-2xl flex flex-col gap-4 text-center">
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-lg font-black p-1"
            >
              ✕
            </button>

            <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 text-2xl flex items-center justify-center mx-auto">
              ⚡
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-black text-neutral-900">
                Topluluğa Katılın
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                r/e-aracim topluluğunda <strong>{authModalReason}</strong> için lütfen üye girişi yapın veya ücretsiz hesap oluşturun.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href="/giris?next=/topluluk"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-xs sm:text-sm font-black text-white hover:bg-blue-700 transition shadow-md shadow-blue-500/20 active:scale-95 text-center"
              >
                GİRİŞ YAP
              </Link>
              <Link
                href="/kayit?next=/topluluk"
                className="rounded-2xl border border-neutral-300 bg-white px-5 py-3 text-xs sm:text-sm font-black text-neutral-700 hover:bg-neutral-50 transition active:scale-95 text-center"
              >
                ÜCRETSİZ KAYIT OL
              </Link>
            </div>

            <p className="text-[11px] text-neutral-400">
              Giriş yapmadan tüm gönderileri, yorumları ve tartışmaları serbestçe okuyabilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* 4. YENİ GÖNDERİ OLUŞTURMA MODAL'I */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-2xl flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-lg font-black p-1"
            >
              ✕
            </button>

            <div>
              <h3 className="text-lg font-black text-neutral-900">
                r/e-aracim&apos;ta Gönderi Paylaş
              </h3>
              <p className="text-xs text-neutral-500">
                Sorunuzu, incelemenizi veya menzil tecrübenizi toplulukla paylaşın.
              </p>
            </div>

            <form onSubmit={handleCreatePost} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-black text-neutral-500 uppercase">
                  Konu Başlığı *
                </span>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="ör. Togg T10X ile kış menzili deneyimlerim ve şarj tüketimi"
                  className="rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-black text-neutral-500 uppercase">
                  Kategori / Flair *
                </span>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="rounded-xl border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 outline-none focus:border-blue-600 bg-white"
                >
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-black text-neutral-500 uppercase">
                  İçerik *
                </span>
                <textarea
                  required
                  rows={5}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Detayları, rotanızı, tüketim verilerinizi veya sormak istediğiniz soruları buraya yazın..."
                  className="rounded-xl border border-neutral-300 p-3 text-xs text-neutral-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim() || !newBody.trim()}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {submitting ? "Paylaşılıyor..." : "YAYINLA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
