"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "@/components/user/SessionProvider";
import {
  IconBookmark,
  IconComment,
  IconHeart,
  IconShare,
} from "@/components/ui/Icons";

const BTN =
  "flex items-center gap-1.5 rounded-md border px-3 py-2 text-[12px] font-black transition";

/** Haber detayındaki beğen / kaydet / paylaş şeridi */
export default function ArticleActions({
  articleId,
  slug,
  title,
  initialLikes,
  initialLiked,
  initialBookmarked,
  commentCount,
}: {
  articleId: string;
  slug: string;
  title: string;
  initialLikes: number;
  initialLiked: boolean;
  initialBookmarked: boolean;
  commentCount: number;
}) {
  const { user } = useSession();
  const router = useRouter();

  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const requireLogin = () => {
    router.push(`/giris?devam=/haber/${slug}`);
  };

  const toggleLike = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    // İyimser güncelleme; hata olursa geri alınır
    setLiked((v) => !v);
    setLikes((n) => n + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLiked(data.liked);
      setLikes(data.count);
    } catch {
      setLiked(liked);
      setLikes(likes);
      setToast("Beğeni kaydedilemedi");
    } finally {
      setBusy(false);
    }
  };

  const toggleBookmark = async () => {
    if (!user) return requireLogin();
    setBusy(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/bookmark`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookmarked(data.bookmarked);
      setToast(
        data.bookmarked ? "Okuma listene eklendi" : "Okuma listenden çıkarıldı"
      );
      setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("Kaydedilemedi");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/haber/${slug}`;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setToast("Bağlantı kopyalandı");
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-y border-neutral-100 px-4 py-3">
      <button
        onClick={toggleLike}
        disabled={busy}
        aria-pressed={liked}
        className={`${BTN} ${
          liked
            ? "border-evos bg-evos/5 text-evos"
            : "border-neutral-300 text-neutral-600 hover:border-evos hover:text-evos"
        }`}
      >
        <IconHeart className="h-4 w-4" filled={liked} />
        {likes > 0 ? likes : ""} BEĞEN
      </button>

      <button
        onClick={toggleBookmark}
        disabled={busy}
        aria-pressed={bookmarked}
        className={`${BTN} ${
          bookmarked
            ? "border-neutral-900 bg-neutral-900 text-white"
            : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
        }`}
      >
        <IconBookmark className="h-4 w-4" filled={bookmarked} />
        {bookmarked ? "KAYDEDİLDİ" : "KAYDET"}
      </button>

      <a
        href="#yorumlar"
        className={`${BTN} border-neutral-300 text-neutral-600 hover:border-evos hover:text-evos`}
      >
        <IconComment className="h-4 w-4" />
        {commentCount} YORUM
      </a>

      <button
        onClick={share}
        className={`${BTN} border-neutral-300 text-neutral-600 hover:border-evos hover:text-evos`}
      >
        <IconShare className="h-4 w-4" />
        PAYLAŞ
      </button>

      {toast && (
        <span className="text-[11px] font-bold text-neutral-500">{toast}</span>
      )}
    </div>
  );
}
