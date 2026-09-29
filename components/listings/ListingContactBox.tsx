"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ListingContactBoxProps {
  listingId: string;
  listingSlug: string;
  sellerName: string;
  sellerType: string;
  sellerPhone?: string | null;
  sellerUserId?: string | null;
  viewerId?: string | null;
}

export default function ListingContactBox({
  listingId,
  listingSlug,
  sellerName,
  sellerType,
  sellerPhone,
  sellerUserId,
  viewerId,
}: ListingContactBoxProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  const isOwner = !!viewerId && viewerId === sellerUserId;
  const isLoggedIn = !!viewerId;

  const quickMessages = [
    "Araç hala satılık mı?",
    "Pazarlık payı var mı?",
    "Ekspertiz raporunu görebilir miyim?",
    "Ne zaman aracı görebilirim?",
  ];

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          receiverId: sellerUserId || undefined,
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Mesaj gönderilemedi");
      }

      setSentSuccess(true);
      setContent("");
    } catch (err: any) {
      setError(err.message || "Mesaj iletilirken bir sorun oluştu.");
    } finally {
      setSending(false);
    }
  }

  // Temizlenmiş telefon numarası (sadece rakamlar)
  const cleanPhone = sellerPhone ? sellerPhone.replace(/\D/g, "") : "";
  const phoneFormatted = cleanPhone.startsWith("0") ? cleanPhone : `0${cleanPhone}`;
  const whatsappNumber = cleanPhone.startsWith("90")
    ? cleanPhone
    : cleanPhone.startsWith("0")
    ? `9${cleanPhone}`
    : `90${cleanPhone}`;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      {/* Satıcı Başlık & Bilgi */}
      <div className="flex flex-col gap-1 border-b border-neutral-100 pb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
          İLAN SAHİBİ &amp; İLETİŞİM
        </span>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-black text-neutral-900 truncate">
            {sellerName}
          </h3>
          <span className="rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-black text-blue-700 shrink-0">
            {sellerType}
          </span>
        </div>
      </div>

      {/* Telefon & WhatsApp Butonları (Eğer numara varsa) */}
      {sellerPhone ? (
        <div className="flex flex-col gap-2">
          <a
            href={`tel:${phoneFormatted}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-black text-white hover:bg-neutral-800 transition active:scale-95 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current text-sky-400" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <span>{sellerPhone}</span>
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
              `Merhaba, EVOtoPilot'taki "${listingSlug}" ilanınız hakkında bilgi almak istiyorum.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition active:scale-95 shadow-xs"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.17 8.17 0 01-5.82 2.41h-.01c-1.49 0-2.96-.4-4.24-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.5 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.24-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29z" />
            </svg>
            <span>WhatsApp ile Mesaj Gönder</span>
          </a>
        </div>
      ) : (
        <div className="rounded-lg bg-neutral-50 p-2.5 text-center text-xs text-neutral-500 font-medium">
          Satıcı telefon numarası belirtmedi. Aşağıdan mesaj gönderebilirsiniz.
        </div>
      )}

      {/* Mesaj Gönderme Kutucuğu */}
      <div className="flex flex-col gap-2 pt-2 border-t border-neutral-100">
        <span className="text-[11px] font-black uppercase text-neutral-700 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Satıcıya Mesaj Gönder
        </span>

        {isOwner ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-semibold">
            Bu sizin kendi ilanınızdır. İlanınızı düzenleyebilir veya profilinizden gelen mesajları yanıtlayabilirsiniz.
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col gap-3 rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-center">
            <p className="text-xs text-neutral-600 font-medium">
              Satıcı ile doğrudan mesajlaşmak ve güvenli iletişim kurmak için lütfen üye girişi yapın.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={`/giris?next=/ilanlar/${listingSlug}`}
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white hover:bg-blue-700 transition"
              >
                Giriş Yap
              </Link>
              <Link
                href="/kayit"
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-black text-neutral-700 hover:bg-neutral-100 transition"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        ) : sentSuccess ? (
          <div className="flex flex-col gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800">
            <div className="flex items-center gap-1.5 font-black text-xs">
              <span className="text-emerald-600 text-base">✓</span>
              <span>Mesajınız satıcıya başarıyla iletildi!</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Satıcı yanıt verdiğinde bildirim alacaksınız. Mesajlarınızı mesaj kutunuzdan takip edebilirsiniz.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Link
                href={`/bana-ozel?sekme=mesajlar${sellerUserId ? `&user=${sellerUserId}` : ""}`}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700 transition text-center"
              >
                Mesajlarıma Git (Bana Özel) →
              </Link>
              <button
                type="button"
                onClick={() => setSentSuccess(false)}
                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
              >
                Yeni Mesaj Yaz
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex flex-col gap-2.5">
            {/* Hızlı Mesaj Şablonları */}
            <div className="flex flex-wrap gap-1">
              {quickMessages.map((qm, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setContent(qm)}
                  className="rounded-full bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition"
                >
                  {qm}
                </button>
              ))}
            </div>

            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Satıcıya sormak istediğiniz soruları buraya yazın..."
              className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs text-neutral-800 placeholder-neutral-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-none"
            />

            {error && (
              <p className="text-[11px] font-bold text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-50 transition active:scale-95 shadow-xs"
            >
              {sending ? (
                <span>Gönderiliyor...</span>
              ) : (
                <>
                  <span>MESAJI GÖNDER</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
