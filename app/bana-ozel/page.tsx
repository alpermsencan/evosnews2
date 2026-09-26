import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  IconUser,
  IconTag,
  IconBell,
  IconCar,
  IconChevronRight,
  IconSparkles,
} from "@/components/ui/Icons";
import NewsCard from "@/components/news/NewsCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bana Özel · EVOtoPilot",
  description: "Kullanıcıya özel içerikler, kayıtlı ilanlar ve takip listesi.",
};

export default async function BanaOzelPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm border border-sky-100">
          <IconUser className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-neutral-900 mb-2">
          Bana Özel Alanı
        </h1>
        <p className="text-sm text-neutral-600 mb-8 leading-relaxed">
          Kişiselleştirilmiş deneyiminiz için giriş yapın. Kaydettiğiniz haberler, favori ilanlarınız ve takip ettiğiniz araçlar burada listelenir.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/giris?devam=/bana-ozel"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1E3F] py-3.5 text-sm font-black text-white transition hover:bg-sky-900 shadow-sm"
          >
            <span>Giriş Yap</span>
            <IconChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/kayit?devam=/bana-ozel"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white py-3.5 text-sm font-black text-neutral-700 transition hover:bg-neutral-50"
          >
            Yeni Hesap Oluştur
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 text-left border-t border-neutral-100 pt-8">
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
            <span className="text-lg">⭐</span>
            <h3 className="text-xs font-black text-neutral-800 mt-2">Favori İlanlar</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Beğendiğiniz 2.el ilanları kaydedip takip edin.</p>
          </div>
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
            <span className="text-lg">📌</span>
            <h3 className="text-xs font-black text-neutral-800 mt-2">Haber Listesi</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Sonradan okumak istediğiniz içerikleri arşivleyin.</p>
          </div>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmışsa: kayıtlı içerikleri ve kişisel alanları getir
  const [bookmarks, unreadCount] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId: user.id },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          include: { category: true, author: true }
        }
      }
    }).catch(() => []),
    prisma.notification.count({
      where: { userId: user.id, isRead: false }
    }).catch(() => 0)
  ]);

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 py-6">
      {/* Kullanıcı Karşılama Kartı */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B1E3F] via-[#102A56] to-[#0A1830] p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={64}
                height={64}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black text-sky-400 border border-white/15">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{user.name}</h1>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-400/30">
                  {user.role === "admin" ? "YÖNETİCİ" : "ÜYE"}
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">@{user.username} {user.city ? `· ${user.city}` : ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/hesabim"
              className="rounded-xl bg-white/15 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/25 transition border border-white/10"
            >
              Profili Düzenle
            </Link>
          </div>
        </div>
      </div>

      {/* Hızlı Erişim Modülleri */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/hesabim/kaydedilenler"
          className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600 group-hover:scale-105 transition">
            <span className="text-lg">🔖</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition">Kaydedilenler</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Okuma listenizdeki haberler</p>
          </div>
        </Link>

        <Link
          href="/ilanlarim"
          className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 group-hover:scale-105 transition">
            <IconTag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition">İlanlarım</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Yayındaki 2.el ilanlarınız</p>
          </div>
        </Link>

        <Link
          href="/bildirimler"
          className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition">
            <IconBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition">Bildirimler</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">{unreadCount > 0 ? `${unreadCount} yeni bildirim` : "Yeni bildirim yok"}</p>
          </div>
        </Link>

        <Link
          href="/akis"
          className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-4 transition hover:border-sky-300 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition">Akışım</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Topluluk ve arkadaş paylaşımları</p>
          </div>
        </Link>
      </div>

      {/* Kaydedilen Son Haberler */}
      {bookmarks.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-neutral-900 tracking-wide">
              KAYDETTİĞİNİZ HABERLER
            </h2>
            <Link
              href="/hesabim/kaydedilenler"
              className="text-xs font-bold text-sky-600 hover:underline"
            >
              Tümünü Gör ({bookmarks.length})
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {bookmarks.map((b: any) => b.article && (
              <NewsCard key={b.id} article={b.article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
