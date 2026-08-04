"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Avatar from "@/components/user/Avatar";
import { useSession } from "@/components/user/SessionProvider";
import {
  IconComment,
  IconHeart,
  IconPlay,
  IconPlus,
  IconShare,
} from "@/components/ui/Icons";
import PostComments from "./PostComments";
import type { SocialPost } from "./types";

/**
 * Dikey tam ekran reel akışı.
 * - Görünür olan video otomatik oynar, diğerleri durur (IntersectionObserver)
 * - Tarayıcı otomatik oynatma kuralları gereği sessiz başlar
 * - Liste sona yaklaşınca imleçle yeni sayfa çekilir
 */
export default function ReelsViewer({
  initialItems,
  initialCursor,
}: {
  initialItems: SocialPost[];
  initialCursor: string | null;
}) {
  const { user } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<SocialPost[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [activeId, setActiveId] = useState(initialItems[0]?.id ?? null);
  const [openComments, setOpenComments] = useState<string | null>(null);

  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const counted = useRef(new Set<string>());
  const loadMoreRef = useRef<() => void>(() => {});

  const loadMore = useCallback(async () => {
    if (loading || done || !cursor) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts?scope=explore&kind=reel&limit=8&before=${encodeURIComponent(cursor)}`
      );
      const data = await res.json();
      const next: SocialPost[] = data.items ?? [];
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !seen.has(p.id))];
      });
      setCursor(data.nextCursor ?? null);
      if (next.length === 0) setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, done, loading]);

  useEffect(() => {
    loadMoreRef.current = () => void loadMore();
  }, [loadMore]);

  // Görünürdeki reel'i oynat, diğerlerini durdur
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLVideoElement;
          const id = el.dataset.postId;
          if (!id) continue;

          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            setActiveId(id);
            void el.play().catch(() => {});

            if (!counted.current.has(id)) {
              counted.current.add(id);
              void fetch(`/api/posts/${id}/view`, { method: "POST" }).catch(
                () => {}
              );
            }

            // Sona üç öğe kala bir sonraki sayfayı hazırla
            const idx = Number(el.dataset.index);
            if (Number.isFinite(idx) && idx >= items.length - 3)
              loadMoreRef.current();
          } else {
            el.pause();
          }
        }
      },
      { threshold: [0, 0.6, 1] }
    );

    for (const el of videoRefs.current.values()) io.observe(el);
    return () => io.disconnect();
  }, [items]);

  const toggleLike = async (post: SocialPost) => {
    if (!user) {
      router.push(`/giris?devam=/reels`);
      return;
    }
    setItems((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likeCount: Math.max(0, p.likeCount + (p.likedByMe ? -1 : 1)),
            }
          : p
      )
    );
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? { ...p, likedByMe: data.liked, likeCount: data.likeCount }
            : p
        )
      );
    } catch {
      setItems((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                likedByMe: post.likedByMe,
                likeCount: post.likeCount,
              }
            : p
        )
      );
    }
  };

  const share = async (post: SocialPost) => {
    const url = `${window.location.origin}/reels?id=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, text: post.body });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* vazgeçildi */
    }
  };

  if (items.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <IconPlay className="h-10 w-10 text-neutral-300" />
        <p className="max-w-sm text-sm text-neutral-500">
          Henüz reel paylaşılmamış. İlk dikey videoyu sen yükle: test sürüşü,
          şarj deneyimi veya araç turu.
        </p>
        <Link
          href="/reels/yeni"
          className="rounded-md bg-evos px-5 py-2.5 text-[13px] font-black text-white transition hover:bg-evos-dark"
        >
          REEL YÜKLE
        </Link>
      </div>
    );

  return (
    <div className="relative">
      {/* Üst aksiyonlar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
        <span className="pointer-events-auto rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur">
          REELS
        </span>
        <span className="pointer-events-auto flex gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur transition hover:bg-black/70"
          >
            {muted ? "🔇 SESSİZ" : "🔊 SES AÇIK"}
          </button>
          <Link
            href="/reels/yeni"
            className="flex items-center gap-1 rounded-full bg-evos px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-evos-dark"
          >
            <IconPlus className="h-3.5 w-3.5" />
            YÜKLE
          </Link>
        </span>
      </div>

      <div className="no-scrollbar h-[calc(100dvh-120px)] snap-y snap-mandatory overflow-y-scroll overscroll-contain rounded-lg bg-black lg:h-[calc(100dvh-160px)]">
        {items.map((post, index) => (
          <section
            key={post.id}
            className="relative flex h-full w-full snap-start items-center justify-center overflow-hidden"
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(post.id, el);
                else videoRefs.current.delete(post.id);
              }}
              data-post-id={post.id}
              data-index={index}
              src={post.videoUrl ?? undefined}
              poster={post.posterUrl ?? undefined}
              playsInline
              loop
              muted={muted}
              preload={index < 2 ? "auto" : "none"}
              onClick={(e) => {
                const el = e.currentTarget;
                if (el.paused) void el.play().catch(() => {});
                else el.pause();
              }}
              className="h-full w-full cursor-pointer object-contain"
            />

            {/* Alt bilgi */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 pb-6">
              <div className="pointer-events-auto flex min-w-0 flex-1 flex-col gap-2">
                <Link
                  href={`/profil/${post.author.username}`}
                  className="flex items-center gap-2"
                >
                  <Avatar
                    src={post.author.avatar}
                    name={post.author.name}
                    size="sm"
                  />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[13px] font-black text-white">
                      {post.author.name}
                    </span>
                    <span className="text-[11px] font-bold text-white/60">
                      @{post.author.username}
                    </span>
                  </span>
                </Link>

                {post.body && (
                  <p className="line-clamp-3 max-w-xl whitespace-pre-wrap text-[13px] leading-relaxed text-white/90">
                    {post.body}
                  </p>
                )}

                {post.article && (
                  <Link
                    href={`/haber/${post.article.slug}`}
                    className="inline-flex max-w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur transition hover:bg-white/25"
                  >
                    📰 {post.article.title.slice(0, 42)}
                    {post.article.title.length > 42 ? "..." : ""}
                  </Link>
                )}

                {post.vehicle && (
                  <Link
                    href={`/araclar/${post.vehicle.slug}`}
                    className="inline-flex max-w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-white backdrop-blur transition hover:bg-white/25"
                  >
                    🚗 {post.vehicle.brand} {post.vehicle.model}
                  </Link>
                )}

                <span className="text-[11px] font-bold text-white/50">
                  {post.views} izlenme
                </span>
              </div>

              {/* Sağ aksiyon şeridi */}
              <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-4 pb-1">
                <button
                  onClick={() => void toggleLike(post)}
                  className="flex flex-col items-center gap-1 text-white transition hover:scale-110"
                >
                  <IconHeart
                    className={`h-7 w-7 ${post.likedByMe ? "text-evos" : ""}`}
                    filled={post.likedByMe}
                  />
                  <span className="text-[11px] font-black">
                    {post.likeCount}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setOpenComments((c) => (c === post.id ? null : post.id))
                  }
                  className="flex flex-col items-center gap-1 text-white transition hover:scale-110"
                >
                  <IconComment className="h-7 w-7" />
                  <span className="text-[11px] font-black">
                    {post.commentCount}
                  </span>
                </button>

                <button
                  onClick={() => void share(post)}
                  className="flex flex-col items-center gap-1 text-white transition hover:scale-110"
                >
                  <IconShare className="h-6 w-6" />
                  <span className="text-[11px] font-black">PAYLAŞ</span>
                </button>
              </div>
            </div>

            {/* Yorum çekmecesi */}
            {openComments === post.id && (
              <div className="absolute inset-x-0 bottom-0 z-30 max-h-[65%] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[13px] font-black text-neutral-800">
                    Yorumlar
                  </span>
                  <button
                    onClick={() => setOpenComments(null)}
                    className="text-[11px] font-black text-neutral-400 hover:text-evos"
                  >
                    KAPAT
                  </button>
                </div>
                <PostComments
                  postId={post.id}
                  compact
                  onCountChange={(n) =>
                    setItems((prev) =>
                      prev.map((p) =>
                        p.id === post.id ? { ...p, commentCount: n } : p
                      )
                    )
                  }
                />
              </div>
            )}

            {activeId === post.id && loading && index >= items.length - 2 && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/50">
                YÜKLENİYOR...
              </span>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
