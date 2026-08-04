"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Avatar from "@/components/user/Avatar";
import { useSession } from "@/components/user/SessionProvider";
import {
  IconComment,
  IconHeart,
  IconPlay,
  IconShare,
  IconTrash,
} from "@/components/ui/Icons";
import { formatTL, timeAgo } from "@/lib/utils";
import PostComments from "./PostComments";
import { VISIBILITY_ICON, type SocialPost } from "./types";

/** Gönderi metnindeki #etiketleri bağlantıya çevirir */
function renderBody(text: string) {
  return text.split(/(#[\p{L}\p{N}_]{2,30})/gu).map((part, i) => {
    if (!part.startsWith("#")) return <span key={i}>{part}</span>;
    return (
      <Link
        key={i}
        href={`/ara?q=${encodeURIComponent(part.slice(1))}`}
        className="font-bold text-evos hover:underline"
      >
        {part}
      </Link>
    );
  });
}

export default function PostCard({
  post,
  onRemoved,
  showComments = false,
}: {
  post: SocialPost;
  onRemoved?: (id: string) => void;
  showComments?: boolean;
}) {
  const { user } = useSession();
  const router = useRouter();

  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [openComments, setOpenComments] = useState(showComments);
  const [copied, setCopied] = useState(false);

  const toggleLike = async () => {
    if (!user) {
      router.push(`/giris?devam=/gonderi/${post.id}`);
      return;
    }
    // İyimser güncelleme; hata olursa geri alınır
    const prev = { liked, likeCount };
    setLiked(!liked);
    setLikeCount((c) => Math.max(0, c + (liked ? -1 : 1)));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prev.liked);
      setLikeCount(prev.likeCount);
    }
  };

  const remove = async () => {
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      onRemoved?.(post.id);
      router.refresh();
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/gonderi/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, text: post.body });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* kullanıcı vazgeçti */
    }
  };

  const gridClass =
    post.images.length === 1
      ? "grid-cols-1"
      : post.images.length === 2
      ? "grid-cols-2"
      : "grid-cols-2";

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      {/* Başlık satırı */}
      <header className="flex items-center gap-3">
        <Link href={`/profil/${post.author.username}`} className="shrink-0">
          <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <Link
            href={`/profil/${post.author.username}`}
            className="truncate text-[14px] font-black text-neutral-900 hover:text-evos"
          >
            {post.author.name}
            {post.author.role !== "uye" && (
              <span className="ml-1.5 rounded bg-evos px-1.5 py-0.5 text-[9px] font-black text-white">
                {post.author.role.toUpperCase()}
              </span>
            )}
          </Link>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400">
            <Link
              href={`/gonderi/${post.id}`}
              className="hover:text-evos hover:underline"
            >
              {timeAgo(post.createdAt)}
            </Link>
            <span title={post.visibility}>
              {VISIBILITY_ICON[post.visibility] ?? "🌐"}
            </span>
            {post.kind === "reel" && (
              <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-black text-white">
                REEL
              </span>
            )}
          </span>
        </div>

        {post.isMine && (
          <button
            onClick={() => void remove()}
            aria-label="Gönderiyi sil"
            className="shrink-0 rounded p-1.5 text-neutral-300 transition hover:bg-red-50 hover:text-evos"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        )}
      </header>

      {/* Metin */}
      {post.body && (
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-neutral-800">
          {renderBody(post.body)}
        </p>
      )}

      {/* Reel önizlemesi */}
      {post.kind === "reel" && post.videoUrl && (
        <Link
          href={`/reels?id=${post.id}`}
          className="group relative mx-auto flex aspect-[9/16] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-lg bg-neutral-900"
        >
          {post.posterUrl && (
            // Cloudinary türev görselleri için next/image gerekmiyor
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.posterUrl}
              alt={post.body || "Reel"}
              className="h-full w-full object-cover opacity-90 transition group-hover:opacity-100"
            />
          )}
          <span className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-white/25 backdrop-blur transition group-hover:scale-110">
            <IconPlay className="ml-1 h-7 w-7 text-white" />
          </span>
          {post.durationSec > 0 && (
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-black text-white">
              {Math.floor(post.durationSec / 60)}:
              {String(post.durationSec % 60).padStart(2, "0")}
            </span>
          )}
        </Link>
      )}

      {/* Görseller */}
      {post.images.length > 0 && (
        <div className={`grid gap-1.5 ${gridClass}`}>
          {post.images.slice(0, 4).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src + i}
              src={src}
              alt=""
              className={`w-full rounded-md bg-neutral-100 object-cover ${
                post.images.length === 1 ? "max-h-[520px]" : "aspect-square"
              }`}
            />
          ))}
        </div>
      )}

      {/* Bağlanan gazete içeriği */}
      {post.article && (
        <Link
          href={`/haber/${post.article.slug}`}
          className="group flex items-center gap-3 overflow-hidden rounded-lg border border-neutral-200 transition hover:border-evos"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.article.image}
            alt={post.article.title}
            className="h-20 w-28 shrink-0 bg-neutral-100 object-cover"
          />
          <span className="flex min-w-0 flex-col gap-1 py-2 pr-3">
            <span
              className="text-[10px] font-black"
              style={{ color: post.article.category.color }}
            >
              {post.article.category.name.toUpperCase()}
            </span>
            <span className="line-clamp-2 text-[13px] font-black leading-snug text-neutral-800 group-hover:text-evos">
              {post.article.title}
            </span>
          </span>
        </Link>
      )}

      {post.vehicle && (
        <Link
          href={`/araclar/${post.vehicle.slug}`}
          className="group flex items-center gap-3 overflow-hidden rounded-lg border border-neutral-200 transition hover:border-evos"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.vehicle.image}
            alt={`${post.vehicle.brand} ${post.vehicle.model}`}
            className="h-20 w-28 shrink-0 bg-neutral-100 object-cover"
          />
          <span className="flex min-w-0 flex-col gap-1 py-2 pr-3">
            <span className="text-[10px] font-black text-volt">ARAÇ</span>
            <span className="truncate text-[13px] font-black text-neutral-800 group-hover:text-evos">
              {post.vehicle.brand} {post.vehicle.model}
            </span>
            <span className="text-[11px] font-bold text-neutral-400">
              {formatTL(post.vehicle.price, { compact: true })}
            </span>
          </span>
        </Link>
      )}

      {post.listing && (
        <Link
          href={`/marketplace/${post.listing.slug}`}
          className="group flex items-center gap-3 overflow-hidden rounded-lg border border-neutral-200 transition hover:border-evos"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.listing.image}
            alt={post.listing.title}
            className="h-20 w-28 shrink-0 bg-neutral-100 object-cover"
          />
          <span className="flex min-w-0 flex-col gap-1 py-2 pr-3">
            <span className="text-[10px] font-black text-neutral-400">
              İLAN · {post.listing.city}
            </span>
            <span className="line-clamp-2 text-[13px] font-black leading-snug text-neutral-800 group-hover:text-evos">
              {post.listing.title}
            </span>
            <span className="text-[11px] font-bold text-evos">
              {formatTL(post.listing.price, { compact: true })}
            </span>
          </span>
        </Link>
      )}

      {/* Aksiyonlar */}
      <footer className="flex items-center gap-1 border-t border-neutral-100 pt-2">
        <button
          onClick={() => void toggleLike()}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-black transition ${
            liked
              ? "text-evos"
              : "text-neutral-500 hover:bg-neutral-50 hover:text-evos"
          }`}
        >
          <IconHeart className="h-4 w-4" filled={liked} />
          {likeCount > 0 ? likeCount : "BEĞEN"}
        </button>

        <button
          onClick={() => setOpenComments((s) => !s)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-black text-neutral-500 transition hover:bg-neutral-50 hover:text-evos"
        >
          <IconComment className="h-4 w-4" />
          {commentCount > 0 ? commentCount : "YORUM"}
        </button>

        <button
          onClick={() => void share()}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-black text-neutral-500 transition hover:bg-neutral-50 hover:text-evos"
        >
          <IconShare className="h-4 w-4" />
          {copied ? "KOPYALANDI" : "PAYLAŞ"}
        </button>

        {post.kind === "reel" && post.views > 0 && (
          <span className="ml-auto pr-2 text-[11px] font-bold text-neutral-400">
            {post.views} izlenme
          </span>
        )}
      </footer>

      {openComments && (
        <PostComments postId={post.id} onCountChange={setCommentCount} />
      )}
    </article>
  );
}
