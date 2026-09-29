"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatTL, timeAgo } from "@/lib/utils";

interface UserSummary {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
}

interface ListingSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  image: string;
}

interface DirectMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string | Date;
  sender: UserSummary;
  receiver: UserSummary;
  listing?: ListingSummary | null;
}

interface ConversationItem {
  otherUser: UserSummary;
  lastMessage: DirectMessageItem;
  unreadCount: number;
}

interface Props {
  currentUserId: string;
  initialOtherUserId?: string | null;
}

export default function MessagesCenter({ currentUserId, initialOtherUserId }: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [inputContent, setInputContent] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Konuşmaları yükle
  async function loadConversations() {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (res.ok && data.conversations) {
        setConversations(data.conversations);

        // Eğer başlangıçta URL'den bir kullanıcı verilmişse onu seç
        if (initialOtherUserId) {
          const match = data.conversations.find(
            (c: ConversationItem) => c.otherUser.id === initialOtherUserId
          );
          if (match) {
            setSelectedUser(match.otherUser);
          } else {
            // Konuşma yoksa bile profili getirebiliriz
            fetch(`/api/users/${initialOtherUserId}`)
              .then((r) => r.json())
              .then((d) => {
                if (d.user) setSelectedUser(d.user);
              })
              .catch(() => {});
          }
        } else if (!selectedUser && data.conversations.length > 0) {
          setSelectedUser(data.conversations[0].otherUser);
        }
      }
    } catch (e) {
      console.error("Konuşmalar yüklenemedi", e);
    } finally {
      setLoadingConv(false);
    }
  }

  // 2. Seçili kullanıcı ile mesajları yükle
  async function loadMessages(otherId: string) {
    setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/messages?userId=${otherId}`);
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Mesajlar yüklenemedi", e);
    } finally {
      setLoadingMsgs(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, [initialOtherUserId]);

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mesaj gönderme
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !inputContent.trim()) return;

    setSending(true);
    const contentToSend = inputContent.trim();
    setInputContent("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: contentToSend,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        loadConversations();
      }
    } catch (err) {
      console.error("Mesaj gönderilemedi", err);
    } finally {
      setSending(false);
    }
  }

  // Aktif konuşmadaki ilgili araç ilanı
  const activeListing = messages.find((m) => m.listing)?.listing;

  if (loadingConv && conversations.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
        <span className="text-sm font-bold text-neutral-400">Mesaj kutusu yükleniyor...</span>
      </div>
    );
  }

  if (!loadingConv && conversations.length === 0 && !selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-2xl">
          💬
        </div>
        <h3 className="text-lg font-black text-neutral-900">Henüz Mesajınız Yok</h3>
        <p className="max-w-md text-xs text-neutral-500">
          İkinci el elektrikli araç ilanlarını incelerken satıcılarla iletişime geçebilir, buradan güvenle mesajlaşabilirsiniz.
        </p>
        <Link
          href="/ilanlar"
          className="mt-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white hover:bg-blue-700 transition shadow-xs"
        >
          İkinci El İlanları Keşfet →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[650px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      {/* Sol Sütun: Konuşmalar Listesi */}
      <div className="w-full md:w-80 shrink-0 border-r border-neutral-200 flex flex-col bg-neutral-50/50">
        <div className="p-4 border-b border-neutral-200 bg-white">
          <h2 className="text-sm font-black text-neutral-900 flex items-center justify-between">
            <span>Sohbetler</span>
            <span className="text-xs font-semibold text-neutral-500">
              {conversations.length} kişi
            </span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">
          {conversations.map((c) => {
            const isSelected = selectedUser?.id === c.otherUser.id;
            return (
              <button
                key={c.otherUser.id}
                type="button"
                onClick={() => setSelectedUser(c.otherUser)}
                className={`w-full flex items-start gap-3 p-3.5 text-left transition ${
                  isSelected
                    ? "bg-white border-l-4 border-blue-600 shadow-xs"
                    : "hover:bg-white/80"
                }`}
              >
                <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-neutral-200">
                  {c.otherUser.avatar ? (
                    <Image
                      src={c.otherUser.avatar}
                      alt={c.otherUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-black text-neutral-600 text-sm uppercase">
                      {c.otherUser.name.slice(0, 2)}
                    </div>
                  )}
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white ring-2 ring-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black text-neutral-900 truncate">
                      {c.otherUser.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 shrink-0">
                      {timeAgo(c.lastMessage.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                    {c.lastMessage.content}
                  </p>
                  {c.lastMessage.listing && (
                    <span className="inline-block mt-1 text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded truncate max-w-full">
                      🚗 {c.lastMessage.listing.title}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sağ Sütun: Aktif Mesajlaşma Alanı */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            {/* Sohbet Başlığı */}
            <div className="p-3.5 px-5 border-b border-neutral-200 flex items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-3">
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                  {selectedUser.avatar ? (
                    <Image
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-black text-neutral-600 text-xs uppercase">
                      {selectedUser.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-black text-neutral-900">
                    {selectedUser.name}
                  </h3>
                  <span className="text-[10px] text-neutral-400">
                    @{selectedUser.username}
                  </span>
                </div>
              </div>

              {/* İlgili Araç İlanı Rozeti */}
              {activeListing && (
                <Link
                  href={`/ilanlar/${activeListing.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1.5 px-3 text-xs hover:border-blue-300 transition shrink-0"
                >
                  <div className="relative h-7 w-10 rounded overflow-hidden bg-neutral-200">
                    <Image
                      src={activeListing.image}
                      alt={activeListing.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-neutral-800 line-clamp-1 max-w-[140px]">
                      {activeListing.title}
                    </span>
                    <span className="text-[10px] font-black text-blue-600">
                      {formatTL(activeListing.price)}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400">↗</span>
                </Link>
              )}
            </div>

            {/* Mesaj Akışı */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-neutral-50/30">
              {loadingMsgs ? (
                <div className="flex h-full items-center justify-center text-xs text-neutral-400 font-semibold">
                  Mesajlar yükleniyor...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-6">
                  <span className="text-3xl mb-2">👋</span>
                  <p className="text-xs font-bold text-neutral-600">
                    Henüz mesajınız yok. İlk mesajı göndererek sohbeti başlatın!
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === currentUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[78%] sm:max-w-[70%] ${
                        isMine ? "self-end items-end" : "self-start items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed shadow-xs ${
                          isMine
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white text-neutral-800 border border-neutral-200 rounded-bl-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                      <span className="text-[9px] text-neutral-400 px-1 mt-0.5">
                        {timeAgo(m.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Giriş Formu */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                required
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Bir mesaj yazın..."
                className="flex-1 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
              <button
                type="submit"
                disabled={sending || !inputContent.trim()}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 shadow-xs"
              >
                {sending ? "..." : "Gönder"}
              </button>
            </form>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-neutral-400 font-bold">
            Sohbet etmek için soldan bir kişi seçin.
          </div>
        )}
      </div>
    </div>
  );
}
