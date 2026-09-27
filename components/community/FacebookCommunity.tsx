"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

// Facebook Hikayeleri (Stories)
const STORIES = [
  {
    id: "create",
    user: "Hikaye Oluştur",
    isCreate: true,
    bg: "bg-neutral-100",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "1",
    user: "Caner Aydın",
    title: "Togg Kış Sürüşü",
    bg: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "2",
    user: "Selin Yılmaz",
    title: "Bolu Dağı Şarjı",
    bg: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=300&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "3",
    user: "Murat Demir",
    title: "Tesla Model Y 20k",
    bg: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=300&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "4",
    user: "Ece Korkmaz",
    title: "BYD Atto 3 Test",
    bg: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300&auto=format&fit=crop&q=80",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  },
];

// Çevrimiçi Topluluk Üyeleri (Facebook Contacts)
const CONTACTS = [
  { name: "Burak Özdemir", status: "online", car: "Togg T10X", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" },
  { name: "Deniz Kara", status: "online", car: "Tesla Model Y", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" },
  { name: "Emre Aktaş", status: "online", car: "Renault Megane E-Tech", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" },
  { name: "Zeynep Arslan", status: "online", car: "Hyundai Ioniq 5", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80" },
  { name: "Okan Yılmaz", status: "idle", car: "MG4 Electric", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80" },
  { name: "Ayşe Çetin", status: "online", car: "Kia EV6", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" },
];

export default function FacebookCommunity({
  initialPosts,
  topics,
}: {
  initialPosts: Post[];
  topics: string[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    author: "",
    topic: topics[0] ?? "Genel",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sosyal Etkileşim Durumları
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentsMap, setCommentsMap] = useState<
    Record<string, { author: string; text: string; time: string; avatar?: string }[]>
  >({});
  const [shareToast, setShareToast] = useState<string | null>(null);

  const shownPosts = filter ? posts.filter((p) => p.topic === filter) : posts;

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

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        {
          author: "Alper Şencan",
          text,
          time: "Az önce",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        },
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
      setShareToast("Gönderi bağlantısı panoya kopyalandı!");
      setTimeout(() => setShareToast(null), 3000);
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
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderi eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-2 sm:px-4 py-4 text-[#050505]">
      {/* PAYLAŞIM BİLDİRİM TOAST'I */}
      {shareToast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-neutral-900/90 text-white px-4 py-2.5 text-xs font-bold shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          ✓ {shareToast}
        </div>
      )}

      {/* 3 SÜTUNLU FACEBOOK DÜZENİ */}
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================= SOL SÜTUN (FACEBOOK KISAYOLLAR & MENÜ) ================= */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 flex flex-col gap-2">
          {/* Kullanıcı Profili */}
          <Link
            href="/hesabim"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-200/60 transition"
          >
            <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-neutral-900">Alper Şencan</span>
              <span className="text-[11px] text-neutral-500 font-medium">Profiliniz</span>
            </div>
          </Link>

          {/* Menü Kısayolları */}
          <nav className="flex flex-col gap-0.5 pt-1">
            <button
              onClick={() => setFilter("")}
              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-left transition font-semibold text-sm ${
                !filter ? "bg-neutral-200/70 text-[#1877F2] font-bold" : "hover:bg-neutral-200/50 text-neutral-800"
              }`}
            >
              <span className="text-xl">📰</span>
              <span>Haber Kaynağı (Tümü)</span>
            </button>

            <Link
              href="/araclar"
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-200/50 transition font-semibold text-sm text-neutral-800"
            >
              <span className="text-xl">🚗</span>
              <span>Araçları Keşfet</span>
            </Link>

            <Link
              href="/ilanlar"
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-200/50 transition font-semibold text-sm text-neutral-800"
            >
              <span className="text-xl">🏷️</span>
              <span>2.El Pazaryeri</span>
            </Link>

            <Link
              href="/sarj-agi"
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-200/50 transition font-semibold text-sm text-neutral-800"
            >
              <span className="text-xl">⚡</span>
              <span>Şarj İstasyonları</span>
            </Link>

            <Link
              href="/bana-ozel"
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-200/50 transition font-semibold text-sm text-neutral-800"
            >
              <span className="text-xl">⭐</span>
              <span>Bana Özel</span>
            </Link>
          </nav>

          <hr className="border-neutral-300/70 my-1" />

          {/* Gruplar / Konular */}
          <div className="flex flex-col gap-1 pt-1">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Topluluk Grupları
              </span>
            </div>
            {topics.slice(0, 6).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition ${
                  filter === t
                    ? "bg-[#1877F2]/10 text-[#1877F2] font-bold"
                    : "hover:bg-neutral-200/50 text-neutral-800 font-medium"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-200 text-neutral-700 text-xs font-black">
                  #
                </span>
                <span className="truncate">{t}</span>
              </button>
            ))}
          </div>

          <div className="px-3 pt-3 text-[11px] text-neutral-500 leading-relaxed">
            Gizlilik · Koşullar · Topluluk İlkeleri · Evos © 2026
          </div>
        </aside>

        {/* ================= ORTA SÜTUN (FACEBOOK ANA AKIŞ - FEED) ================= */}
        <main className="col-span-1 lg:col-span-6 flex flex-col gap-4 max-w-[620px] mx-auto w-full">
          
          {/* 1. FACEBOOK HİKAYELERİ (STORIES CAROUSEL) */}
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {STORIES.map((s) => (
              <div
                key={s.id}
                onClick={() => setIsModalOpen(true)}
                className="relative h-44 w-28 shrink-0 rounded-2xl overflow-hidden shadow-sm cursor-pointer group select-none transition-transform hover:scale-[1.02]"
              >
                {s.isCreate ? (
                  <div className="h-full w-full bg-white flex flex-col justify-between">
                    <div className="relative h-32 w-full overflow-hidden bg-neutral-200">
                      <Image
                        src={s.avatar}
                        alt="Profil"
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="relative flex flex-col items-center pb-2">
                      <div className="absolute -top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white ring-4 ring-white text-lg font-black shadow">
                        +
                      </div>
                      <span className="mt-4 text-[11px] font-bold text-neutral-900 text-center px-1">
                        Hikaye Oluştur
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src={s.bg}
                      alt={s.title}
                      fill
                      className="object-cover brightness-[0.75] group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 h-9 w-9 rounded-full overflow-hidden ring-4 ring-[#1877F2] shadow">
                      <Image src={s.avatar} alt={s.user} fill className="object-cover" />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-[12px] font-bold text-white leading-tight drop-shadow block">
                        {s.user}
                      </span>
                      <span className="text-[10px] text-white/90 font-medium truncate block">
                        {s.title}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* 2. FACEBOOK "AKLINDAN NE GEÇİYOR?" (WHAT'S ON YOUR MIND?) GÖNDERİ KUTUSU */}
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                A
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex-1 rounded-full bg-[#f0f2f5] px-4 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-[#e4e6e9] transition"
              >
                Aklından ne geçiyor, Alper? Bir deneyim veya soru paylaş...
              </button>
            </div>

            <hr className="border-neutral-200" />

            <div className="grid grid-cols-3 gap-1 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                <span className="text-xl">📹</span>
                <span className="hidden sm:inline">Canlı Video</span>
                <span className="sm:hidden">Canlı</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                <span className="text-xl text-emerald-500">🖼️</span>
                <span>Fotoğraf/video</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                <span className="text-xl text-amber-500">😊</span>
                <span className="hidden sm:inline">His/hareket</span>
                <span className="sm:hidden">His</span>
              </button>
            </div>
          </div>

          {/* AKTİF FİLTRE ROZETİ */}
          {filter && (
            <div className="flex items-center justify-between bg-white border border-neutral-200 px-4 py-2 rounded-xl shadow-2xs">
              <span className="text-xs font-bold text-neutral-700">
                Seçili Grup: <strong className="text-[#1877F2]">#{filter}</strong>
              </span>
              <button
                onClick={() => setFilter("")}
                className="text-xs font-bold text-neutral-500 hover:text-neutral-800"
              >
                Tüm Akışı Göster ✕
              </button>
            </div>
          )}

          {/* 3. FACEBOOK GÖNDERİLERİ (POST STREAM) */}
          <div className="flex flex-col gap-3.5">
            {shownPosts.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-sm font-semibold text-neutral-500 shadow-sm">
                Bu grupta henüz paylaşım yok. İlk paylaşımı yukarıdan siz yapın!
              </div>
            ) : (
              shownPosts.map((p) => {
                const isLiked = likedPosts[p.id];
                const areCommentsOpen = openComments[p.id];
                const postComments = commentsMap[p.id] || [];

                return (
                  <article
                    key={p.id}
                    id={p.id}
                    className="flex flex-col rounded-2xl border border-neutral-200/90 bg-white shadow-sm overflow-hidden"
                  >
                    {/* Gönderi Üst Başlık (Yazar Avatarı, İsim, Zaman) */}
                    <div className="flex items-center justify-between p-3.5 pb-2">
                      <div className="flex items-center gap-2.5">
                        {p.avatar ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-neutral-200">
                            <Image
                              src={p.avatar}
                              alt={p.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1877F2] to-blue-800 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {p.author.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-neutral-900 text-sm hover:underline cursor-pointer">
                              {p.author}
                            </span>
                            <span className="text-xs text-neutral-400">›</span>
                            <button
                              onClick={() => setFilter(p.topic)}
                              className="text-xs font-bold text-[#1877F2] hover:underline"
                            >
                              {p.topic}
                            </button>
                            {p.isPinned && (
                              <span className="rounded bg-amber-100 text-amber-800 px-1.5 py-0.2 text-[10px] font-black">
                                📌 Sabit
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                            <span>{timeAgo(p.createdAt)}</span>
                            <span>·</span>
                            <span title="Herkese Açık">🌐</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-neutral-500">
                        <button className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-sm">
                          •••
                        </button>
                        <button className="h-8 w-8 rounded-full hover:bg-neutral-100 flex items-center justify-center font-bold text-sm">
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Gönderi Metni */}
                    <div className="px-3.5 py-2 flex flex-col gap-1.5">
                      <h3 className="text-[15px] font-bold text-neutral-950 leading-snug">
                        {p.title}
                      </h3>
                      <p className="whitespace-pre-line text-[14px] leading-relaxed text-neutral-800 font-normal">
                        {p.body}
                      </p>
                    </div>

                    {/* Reaksiyon ve Yorum Sayıları Barı (Facebook Style) */}
                    <div className="flex items-center justify-between px-3.5 py-2 text-xs text-neutral-500 border-b border-neutral-150 mx-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1877F2] text-[9px] text-white">
                          👍
                        </span>
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] text-white -ml-2.5">
                          ❤️
                        </span>
                        <span className="font-semibold text-neutral-600 pl-0.5">
                          {p.likes}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 font-medium">
                        <button
                          type="button"
                          onClick={() => handleToggleComments(p.id)}
                          className="hover:underline"
                        >
                          {p.replies + postComments.length} yorum
                        </button>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => handleShare(p)}
                          className="hover:underline"
                        >
                          Paylaşım
                        </button>
                      </div>
                    </div>

                    {/* FACEBOOK AKSİYONLARI: BEĞEN, YORUM YAP, PAYLAŞ */}
                    <div className="grid grid-cols-3 gap-1 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleLike(p.id)}
                        className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-bold transition active:scale-95 ${
                          isLiked
                            ? "text-[#1877F2] bg-blue-50/70"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        <span className="text-base">{isLiked ? "👍" : "👍🏻"}</span>
                        <span>Beğen</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleComments(p.id)}
                        className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition active:scale-95"
                      >
                        <span className="text-base">💬</span>
                        <span>Yorum Yap</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(p)}
                        className="flex items-center justify-center gap-2 rounded-xl py-2 text-xs sm:text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition active:scale-95"
                      >
                        <span className="text-base">↗️</span>
                        <span>Paylaş</span>
                      </button>
                    </div>

                    {/* YORUMLAR ALANI (Facebook Bubble Comments) */}
                    {areCommentsOpen && (
                      <div className="flex flex-col gap-2.5 bg-[#f7f8fa] p-3.5 border-t border-neutral-150">
                        {/* Mevcut Yorumlar */}
                        {postComments.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {postComments.map((c, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="h-7 w-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                  {c.author.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <div className="rounded-2xl bg-[#e4e6eb] px-3.5 py-2 text-xs">
                                    <span className="font-bold text-neutral-900 block">
                                      {c.author}
                                    </span>
                                    <span className="text-neutral-800 text-[13px] leading-snug">
                                      {c.text}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 px-3 pt-1 text-[11px] font-bold text-neutral-500">
                                    <button className="hover:underline">Beğen</button>
                                    <button className="hover:underline">Yanıtla</button>
                                    <span className="font-normal text-neutral-400">{c.time}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Yorum Yazma Alanı (Facebook Style Capsule Input) */}
                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            A
                          </div>
                          <div className="flex flex-1 items-center rounded-full bg-[#f0f2f5] px-3.5 py-1.5 border border-neutral-200/80 focus-within:border-neutral-400">
                            <input
                              type="text"
                              value={commentInputs[p.id] || ""}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [p.id]: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment(p.id);
                              }}
                              placeholder="Yorum yaz..."
                              className="w-full bg-transparent text-xs font-normal text-neutral-900 outline-none placeholder:text-neutral-500"
                            />
                            <div className="flex items-center gap-1 text-neutral-500 text-sm ml-1 shrink-0">
                              <span className="cursor-pointer hover:text-neutral-800">😊</span>
                              <span className="cursor-pointer hover:text-neutral-800">📷</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddComment(p.id)}
                            className="text-xs font-bold text-[#1877F2] hover:underline px-1"
                          >
                            Paylaş
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </main>

        {/* ================= SAĞ SÜTUN (SPONSORLU, GÜNDEM, ÇEVRİMİÇİ KİŞİLER) ================= */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 flex flex-col gap-4">
          {/* Sponsorlu / Öne Çıkan Bilgi */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Sponsorlu
            </span>
            <Link
              href="/araclar"
              className="group flex items-center gap-3 rounded-xl p-2 hover:bg-neutral-200/60 transition"
            >
              <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-neutral-200 shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&auto=format&fit=crop&q=80"
                  alt="Evos 2026"
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-neutral-900 group-hover:text-[#1877F2]">
                  2026 Elektrikli Araç Rehberi
                </span>
                <span className="text-[11px] text-neutral-500">evosnews.com</span>
              </div>
            </Link>
          </div>

          <hr className="border-neutral-300/70" />

          {/* Çevrimiçi Topluluk Üyeleri (Facebook Contacts List) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Kişiler (Çevrimiçi)
              </span>
              <div className="flex items-center gap-2 text-neutral-500 text-xs">
                <span>🔍</span>
                <span>•••</span>
              </div>
            </div>

            {CONTACTS.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-200/60 transition cursor-pointer"
              >
                <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                  <Image src={c.avatar} alt={c.name} fill className="object-cover" />
                  {c.status === "online" && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-neutral-900 truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 truncate">
                    {c.car}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <hr className="border-neutral-300/70" />

          {/* Topluluk Kuralları Kartı */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xs">
            <h4 className="text-xs font-black text-neutral-900 uppercase flex items-center gap-1.5">
              <span>🛡️</span> Facebook Topluluk Standartları
            </h4>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              Herkes için güvenli ve faydalı bir elektrikli araç deneyim alanı oluşturmak amacıyla saygılı ve doğrulanabilir bilgi paylaşımını destekliyoruz.
            </p>
          </div>
        </aside>
      </div>

      {/* ================= FACEBOOK GÖNDERİ OLUŞTURMA MODALI ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="relative flex items-center justify-center border-b border-neutral-200 py-3.5 px-4">
              <h3 className="text-base font-black text-neutral-900">
                Gönderi Oluştur
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f2f5] text-neutral-600 hover:bg-[#e4e6eb] font-bold text-sm transition"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={submit} className="flex flex-col gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                  {form.author ? form.author.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex flex-col flex-1">
                  <input
                    type="text"
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full text-xs font-bold text-neutral-900 outline-none placeholder:text-neutral-400"
                  />
                  <div className="flex items-center gap-1 bg-[#f0f2f5] px-2 py-0.5 rounded text-[11px] font-semibold text-neutral-600 w-fit mt-0.5">
                    <span>🌐 Herkese Açık</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Başlık (Özet)..."
                  className="w-full rounded-xl border border-neutral-200 bg-[#f0f2f5] px-3.5 py-2 text-sm font-bold text-neutral-900 outline-none focus:bg-white focus:border-[#1877F2]"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-500">Konu:</span>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="flex-1 rounded-xl border border-neutral-200 bg-[#f0f2f5] px-3 py-1.5 text-xs font-bold text-neutral-800 outline-none focus:bg-white focus:border-[#1877F2]"
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
                  placeholder="Aklından ne geçiyor? Bir elektrikli araç tecrübeni, şarj durumunu veya sorunu paylaş..."
                  className="w-full rounded-xl border border-neutral-200 bg-[#f0f2f5] p-3 text-sm font-normal text-neutral-900 outline-none placeholder:text-neutral-500 focus:bg-white focus:border-[#1877F2] resize-none"
                />
              </div>

              {/* Facebook "Gönderine ekle" kutusu */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-300 p-3 shadow-2xs">
                <span className="text-xs font-bold text-neutral-800">
                  Gönderine ekle
                </span>
                <div className="flex items-center gap-3 text-lg">
                  <span className="cursor-pointer hover:scale-110 transition">🖼️</span>
                  <span className="cursor-pointer hover:scale-110 transition">🏷️</span>
                  <span className="cursor-pointer hover:scale-110 transition">😊</span>
                  <span className="cursor-pointer hover:scale-110 transition">📍</span>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-2.5 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1877F2] py-2.5 text-sm font-bold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Yayınlanıyor..." : "Paylaş"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
