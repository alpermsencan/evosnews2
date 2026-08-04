"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import type { SocialPost } from "./types";

export type FeedQuery = {
  scope: "feed" | "explore" | "user" | "article";
  kind?: "text" | "reel";
  username?: string;
  articleId?: string;
};

/**
 * Sonsuz kaydırmalı gönderi listesi.
 * İlk sayfa sunucudan gelir; devamı imleçle (son gönderinin tarihi) çekilir.
 */
export default function PostFeed({
  query,
  initialItems,
  initialCursor,
  emptyState,
  pageSize = 10,
}: {
  query: FeedQuery;
  initialItems: SocialPost[];
  initialCursor: string | null;
  emptyState?: React.ReactNode;
  pageSize?: number;
}) {
  const [items, setItems] = useState<SocialPost[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(initialItems.length < pageSize);
  const sentinel = useRef<HTMLDivElement>(null);

  // Sunucudan yeni ilk sayfa geldiğinde (router.refresh) listeyi tazele.
  // React'in önerdiği "render sırasında prop değişimine göre state ayarlama"
  // deseni; effect kullanmak gereksiz bir ikinci render turu doğururdu.
  const [seenInitial, setSeenInitial] = useState(initialItems);
  if (seenInitial !== initialItems) {
    setSeenInitial(initialItems);
    setItems(initialItems);
    setCursor(initialCursor);
    setDone(initialItems.length < pageSize);
  }

  const loadMore = useCallback(async () => {
    if (loading || done || !cursor) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        scope: query.scope,
        before: cursor,
        limit: String(pageSize),
      });
      if (query.kind) params.set("kind", query.kind);
      if (query.username) params.set("username", query.username);
      if (query.articleId) params.set("articleId", query.articleId);

      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      const next: SocialPost[] = data.items ?? [];

      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !seen.has(p.id))];
      });
      setCursor(data.nextCursor ?? null);
      if (next.length < pageSize) setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, done, loading, pageSize, query]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || done) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { rootMargin: "600px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [loadMore, done]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const addItem = (post: SocialPost) =>
    setItems((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);

  // Dışarıdan gönderi eklenebilmesi için (PostComposer) global bir olay dinlenir
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SocialPost>).detail;
      if (detail) addItem(detail);
    };
    window.addEventListener("evos:post-created", handler);
    return () => window.removeEventListener("evos:post-created", handler);
  }, []);

  if (items.length === 0)
    return (
      <>
        {emptyState ?? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14 text-center text-sm text-neutral-500">
            Burada henüz gönderi yok.
          </div>
        )}
      </>
    );

  return (
    <div className="flex flex-col gap-3">
      {items.map((post) => (
        <PostCard key={post.id} post={post} onRemoved={removeItem} />
      ))}

      <div ref={sentinel} />

      {loading && (
        <div className="py-4 text-center text-[12px] font-black text-neutral-400">
          YÜKLENİYOR...
        </div>
      )}
      {done && items.length > 0 && (
        <div className="py-4 text-center text-[11px] font-bold text-neutral-300">
          Akışın sonuna geldin
        </div>
      )}
    </div>
  );
}
