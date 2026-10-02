import Link from "next/link";
import Image from "next/image";
import HeroCarousel from "@/components/home/HeroCarousel";
import NewsCard from "@/components/news/NewsCard";
import SectionTitle from "@/components/news/SectionTitle";
import CardRail from "@/components/ui/CardRail";
import VehicleCard from "@/components/vehicles/VehicleCard";
import PollWidget from "@/components/ui/PollWidget";
import NewsletterForm from "@/components/ui/NewsletterForm";
import {
  IconTag,
} from "@/components/ui/Icons";
import TurkeyEvSalesWidget from "@/components/home/TurkeyEvSalesWidget";
import EvCampaignsSection from "@/components/home/EvCampaignsSection";
import EvotopilotChargingAssistant from "@/components/home/EvotopilotChargingAssistant";
import {
  getHeadlines,
  getLatest,
  getByCategory,
  getFeaturedVehicles,
  getCommunityPosts,
  getActivePoll,
  ALLOWED_EV_SOURCES,
} from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let viewer = null;
  try {
    viewer = await getCurrentUser();
  } catch (err) {
    console.error("HomePage user read error:", err);
  }

  // 1. SLIDER (Tam olarak belirlenen 5 öne çıkan Webtekno haberi)
  const safeHeadlines = await prisma.article.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { publishedAt: "desc" },
    take: 5,
    include: { category: true }
  }).catch(() => []);
  const heroIds = new Set(safeHeadlines.map((h) => h.id));

  // 2. EDİTÖRÜN KALEMİNDEN (8 adet kapsamlı editoryal rehber, analiz ve inceleme haberi - Slider ile çakışmaz)
  const safeEditorArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: Array.from(heroIds) }
    },
    orderBy: [
      { views: "desc" },
      { publishedAt: "desc" }
    ],
    take: 8,
    include: { author: true, category: true }
  }).catch(() => []);
  const editorIds = new Set(safeEditorArticles.map((e) => e.id));

  // 3. e-ARACIM ÖZEL ANALİZ (Slider ve Editör haberleri kesinlikle filtrelenir - SIFIR ÇAKIŞMA)
  const feed = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      id: { notIn: [...Array.from(heroIds), ...Array.from(editorIds)] }
    },
    orderBy: { publishedAt: "desc" },
    take: 14,
    include: { author: true, category: true }
  }).catch(() => []);

  const [vehicles, community, poll] = await Promise.all([
    getFeaturedVehicles(8).catch(() => []),
    getCommunityPosts(5).catch(() => []),
    getActivePoll().catch(() => null),
  ]);

  const safeVehicles = vehicles || [];
  const safeCommunity = community || [];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 sm:pt-4">
      {/* MANŞET CAROUSEL */}
      {safeHeadlines.length > 0 && (
        <HeroCarousel
          slides={safeHeadlines.map((h) => ({
            id: h.id,
            title: h.title,
            slug: h.slug,
            spot: h.spot || "",
            image: h.image,
            isVideo: Boolean(h.isVideo),
            isBreaking: Boolean(h.isBreaking),
            publishedAt: h.publishedAt || new Date(),
            category: h.category || { name: "Haber", slug: "haber-merkezi", color: "#e30613" },
          }))}
        />
      )}

      {/* EDİTÖRÜN KALEMİNDEN (8 ADET SEÇKİN REHBER VE ANALİZ) */}
      {safeEditorArticles.length > 0 && (
        <section className="px-3 sm:px-0">
          <SectionTitle
            title="EDİTÖRÜN KALEMİNDEN"
            color="#0f172a"
            href="/kategori/haber-merkezi"
            subtitle="Elektrikli mobilite, batarya teknolojisi ve satın alma rehberleri"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 bg-white border border-neutral-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
            {safeEditorArticles.map((a) => (
              <Link key={a.id} href={`/haber/${a.slug}`} className="group flex flex-col gap-2.5 transition">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-black/5">
                  {a.image && (
                    <img
                      src={a.image}
                      alt={a.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-neutral-950/85 backdrop-blur-xs px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-sky-400 border border-white/10">
                    {a.category?.name || "Editör İncelemesi"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-sm sm:text-base font-black text-neutral-900 group-hover:text-sky-600 transition-colors leading-snug line-clamp-2">
                    {a.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-auto text-[11px] font-bold text-neutral-400">
                    <span className="truncate text-neutral-600 font-semibold">{a.author?.name || "e-aracım Editör"}</span>
                    <span>·</span>
                    <span>{timeAgo(a.publishedAt || new Date())}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* EV ARAÇ KAMPANYALARI & FİNANSMAN (Yazarlar Kısmı Yeniden Tasarlandı) */}
      <section className="px-3 sm:px-0">
        <EvCampaignsSection />
      </section>

      {/* ANA İÇERİK + SAĞ SÜTUN (Masaüstünde Dengeli Yükseklik ve Üstten Hizalama) */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* SOL SÜTUN: ÖZEL ANALİZ VE GÜNCEL HABERLER */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {feed.length > 0 && (
            <section className="px-3 sm:px-0">
              <SectionTitle
                title="e-aracım Özel Analiz & Gündem"
                href="/kategori/haber-merkezi"
                subtitle="Elektrikli mobilite, batarya inovasyonları ve otomotiv dünyasından en son gelişmeler"
              />
              {/* 2 Büyük Öne Çıkan Kart */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {feed.slice(0, 2).map((a, i) => (
                  <NewsCard key={a.id} article={a} variant="wide" priority={i === 0} />
                ))}
              </div>

              {/* 12 Haberden Oluşan 3 Sütunlu Dengeli Kart Izgarası */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feed.slice(2, 14).map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>

              {/* Tüm Haberleri Gör Butonu */}
              <div className="mt-6 flex justify-center">
                <Link
                  href="/kategori/haber-merkezi"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-xs font-black uppercase tracking-wider text-neutral-800 transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white shadow-2xs"
                >
                  <span>Tüm Haber &amp; Analizleri İncele</span>
                  <span>→</span>
                </Link>
              </div>
            </section>
          )}
        </div>

        {/* SAĞ SÜTUN (Masaüstünde Geniş & Taşmasız 370-390px) */}
        <aside className="flex w-full shrink-0 flex-col gap-5 px-3 sm:px-0 lg:w-[370px] xl:w-[390px]">
          {/* TÜRKİYE RESMÎ EV SATIŞ TABLOSU (ODMD) */}
          <TurkeyEvSalesWidget />

          {/* EVOTOPİLOT ŞARJ ASİSTANI (VoltHaber Stili Yolculuk & Batarya Dolum Maliyeti) */}
          <EvotopilotChargingAssistant />

          {/* ÖTV REHBERİ SÜTUNU (Modern, Kurumsal ve Resmî Finansal Matris Görünümü) */}
          <div className="overflow-hidden rounded-2xl border border-neutral-300/90 bg-white shadow-sm ring-1 ring-black/5">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-black px-4 py-3.5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-800 text-sky-400 ring-1 ring-white/10 shadow-xs">
                    <IconTag className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black tracking-wider text-white uppercase">
                        ÖTV REHBERİ
                      </h3>
                      <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    </div>
                    <p className="text-[11px] text-neutral-400 font-bold">2026 Resmî Vergi Baremleri</p>
                  </div>
                </div>
                <span className="rounded-md bg-neutral-800 border border-neutral-700 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-neutral-300">
                  RESMÎ GAZETE
                </span>
              </div>
            </div>

            {/* Tax Brackets - Kurumsal Modern Finansal Matris (Resmî Gazete 2026) */}
            <div className="flex flex-col divide-y divide-neutral-150 p-2.5">
              {/* Dilim 1: %25 (En Avantajlı Resmî Baremi) */}
              <div className="relative rounded-xl border border-emerald-500/40 bg-emerald-50/40 p-3.5 transition hover:bg-emerald-50/60">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-neutral-950">Motor ≤ 160 kW</span>
                      <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                        EN AVANTAJLI
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-900 mt-0.5">Matrah ≤ 1.650.000 ₺</span>
                    <span className="text-[11px] text-neutral-600 font-bold mt-0.5">Togg T10X, Tesla Model Y RWD, Atto 3</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0 pl-2">
                    <span className="rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-black text-white shadow-xs">
                      %25 ÖTV
                    </span>
                  </div>
                </div>
              </div>

              {/* Dilim 2: %55 */}
              <div className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-neutral-950">Motor ≤ 160 kW</span>
                  <span className="text-xs font-bold text-neutral-700 mt-0.5">Matrah &gt; 1.650.000 ₺</span>
                  <span className="text-[11px] text-neutral-400 font-semibold mt-0.5">Yüksek donanımlı tek motorlu modeller</span>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="rounded-xl bg-neutral-100 border border-neutral-300 px-3 py-1.5 text-sm font-black text-neutral-950">
                    %55 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 3: %65 */}
              <div className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-neutral-950">Motor &gt; 160 kW</span>
                  <span className="text-xs font-bold text-neutral-700 mt-0.5">Matrah ≤ 1.650.000 ₺</span>
                  <span className="text-[11px] text-neutral-400 font-semibold mt-0.5">Çift motor AWD giriş versiyonları</span>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="rounded-xl bg-neutral-100 border border-neutral-300 px-3 py-1.5 text-sm font-black text-neutral-950">
                    %65 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 4: %75 */}
              <div className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition rounded-xl">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-neutral-950">Motor &gt; 160 kW</span>
                  <span className="text-xs font-bold text-neutral-700 mt-0.5">Matrah &gt; 1.650.000 ₺</span>
                  <span className="text-[11px] text-neutral-400 font-semibold mt-0.5">Premium &amp; Yüksek Performans AWD</span>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="rounded-xl bg-neutral-950 text-white px-3 py-1.5 text-sm font-black">
                    %75 ÖTV
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Bilgilendirme Notu */}
            <div className="bg-neutral-950 px-4 py-3 border-t border-neutral-800 text-xs text-neutral-400 font-medium">
              <p className="leading-relaxed">
                Resmî Gazete 2026 baremleri. Tüm dilimlerde ÖTV hesaplaması sonrası nihai fiyata <strong className="text-white font-bold">%20 KDV</strong> ilave edilir.
              </p>
            </div>
          </div>

          {poll && (
            <PollWidget
              poll={{
                id: poll.id,
                question: poll.question,
                options: poll.options,
                votes: poll.votes,
              }}
            />
          )}

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <NewsletterForm />
          </div>
        </aside>
      </div>

      {/* ARAÇLARI KEŞFET (Tam Genişlik 1280px Lüks Model Vitrini) */}
      {safeVehicles.length > 0 && (
        <section className="px-3 sm:px-0 pt-2">
          <SectionTitle
            title="ARAÇLARI KEŞFET"
            href="/araclar"
            color="#0f766e"
            subtitle="Türkiye pazarında satışta olan tüm güncel elektrikli otomobiller"
          />
          <CardRail itemClass="w-[78%] sm:w-[45%] md:w-[32%] lg:w-[24%]" autoPlay={true}>
            {safeVehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </CardRail>
        </section>
      )}

      {/* TOPLULUK & KULLANICI DENEYİMLERİ (Tam Genişlik 2 Sütunlu Kart Tasarımı) */}
      {safeCommunity.length > 0 && (
        <section className="px-3 sm:px-0 pt-2">
          <SectionTitle
            title="TOPLULUK & KULLANICI DENEYİMLERİ"
            href="/topluluk"
            color="#c2410c"
            subtitle="Gerçek elektrikli araç sahiplerinin tüketim, menzil ve yolculuk tecrübeleri"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeCommunity.map((p) => (
              <Link
                key={p.id}
                href="/topluluk"
                className="group flex items-start gap-4 rounded-2xl border border-neutral-200/90 bg-white p-5 transition duration-200 hover:border-neutral-950 hover:shadow-md"
              >
                {p.avatar && (
                  <Image
                    src={p.avatar}
                    alt={p.author}
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-neutral-100"
                  />
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                      {p.topic.toUpperCase()}
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {p.author} · {timeAgo(p.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-base font-black leading-snug text-neutral-900 group-hover:text-evos transition">
                    {p.title}
                  </h3>
                  <p className="line-clamp-2 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                    {p.body}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-neutral-400">
                    <span className="text-red-500 font-black">♥ {p.likes}</span>
                    <span>·</span>
                    <span>{p.replies} yanıt</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
