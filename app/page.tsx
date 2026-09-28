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
import {
  getHeadlines,
  getLatest,
  getByCategory,
  getFeaturedVehicles,
  getCommunityPosts,
  getActivePoll,
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

  const [
    headlines,
    latest,
    vehicles,
    community,
    poll,
    tech,
    editorArticles,
    authorArticles,
  ] = await Promise.all([
    getHeadlines(6).catch((err) => {
      console.error("getHeadlines error:", err);
      return [];
    }),
    getLatest(16).catch((err) => {
      console.error("getLatest error:", err);
      return [];
    }),
    getFeaturedVehicles(8).catch((err) => {
      console.error("getFeaturedVehicles error:", err);
      return [];
    }),
    getCommunityPosts(5).catch((err) => {
      console.error("getCommunityPosts error:", err);
      return [];
    }),
    getActivePoll().catch((err) => {
      console.error("getActivePoll error:", err);
      return null;
    }),
    getByCategory("teknoloji", 4).catch((err) => {
      console.error("getByCategory error:", err);
      return [];
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 12,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    }).catch((err) => {
      console.error("editorArticles error:", err);
      return [];
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED" },
      skip: 4,
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    }).catch((err) => {
      console.error("authorArticles error:", err);
      return [];
    })
  ]);

  const safeHeadlines = headlines || [];
  const safeLatest = latest || [];
  const safeVehicles = vehicles || [];
  const safeCommunity = community || [];
  const safeTech = tech || [];
  const safeAuthorArticles = authorArticles || [];

  const heroIds = new Set(safeHeadlines.map((h) => h.id));
  const feed = safeLatest.filter((a) => !heroIds.has(a.id));
  // Slider'daki haberlerle Editörün Kaleminden çakışmasın:
  const safeEditorArticles = (editorArticles || []).filter((a) => !heroIds.has(a.id)).slice(0, 4);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 sm:pt-4">
      {/* MANŞET CAROUSEL (Akıllı araç eşleştirici kaldırıldı, sade manşet) */}
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

      {/* EDİTÖRÜN KALEMİNDEN */}
      {safeEditorArticles.length > 0 && (
        <section className="px-3 sm:px-0">
          <SectionTitle
            title="EDİTÖRÜN KALEMİNDEN"
            color="#0f172a"
            href="/kategori/haber-merkezi"
            subtitle="Elektrikli mobilite üzerine editör analiz ve incelemeleri"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
            {safeEditorArticles.map((a) => (
              <Link key={a.id} href={`/haber/${a.slug}`} className="group flex flex-col gap-2.5">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100">
                  {a.image && (
                    <img src={a.image} alt={a.title} className="object-cover w-full h-full group-hover:scale-105 transition duration-300" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                    {a.category?.name || "Editör İncelemesi"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-black text-neutral-900 group-hover:text-red-600 transition leading-snug line-clamp-2">
                    {a.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-neutral-400">
                    <span className="truncate">{a.author?.name || "Editör"}</span>
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

      {/* ANA İÇERİK + SAĞ SÜTUN */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* GÜNDEM -> EVOtoPilot Özel Analiz */}
          {feed.length > 0 && (
            <section className="px-3 sm:px-0">
              <SectionTitle
                title="EVOtoPilot Özel Analiz"
                href="/kategori/haber-merkezi"
                subtitle="Elektrikli mobilite ve otomotiv endüstrisinden derinlemesine analizler"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {feed.slice(0, 2).map((a, i) => (
                  <NewsCard key={a.id} article={a} variant="wide" priority={i === 0} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {feed.slice(2, 10).map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          {/* ARAÇLARI KEŞFET */}
          {safeVehicles.length > 0 && (
            <section className="px-3 sm:px-0">
              <SectionTitle
                title="ARAÇLARI KEŞFET"
                href="/araclar"
                color="#0f766e"
                subtitle="Türkiye'de satışta olan öne çıkan elektrikli modeller"
              />
              <CardRail itemClass="w-[62%] sm:w-[38%] lg:w-[27%]" autoPlay={true}>
                {safeVehicles.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </CardRail>
            </section>
          )}

          {/* TEKNOLOJİ -> EVOtoPilot Teknoloji Analiz */}
          {safeTech.length > 0 && (
            <section className="px-3 sm:px-0">
              <SectionTitle
                title="EVOtoPilot Teknoloji Analiz"
                href="/kategori/teknoloji"
                color="#9333ea"
                subtitle="Batarya mimarisi, otonom yazılımlar ve şarj teknolojileri"
              />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {safeTech.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}

          {/* TOPLULUK */}
          {safeCommunity.length > 0 && (
            <section className="px-3 sm:px-0">
              <SectionTitle
                title="TOPLULUK"
                href="/topluluk"
                color="#c2410c"
                subtitle="Evos kullanıcılarının deneyimleri ve tartışmaları"
              />
              <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {safeCommunity.map((p) => (
                  <Link
                    key={p.id}
                    href="/topluluk"
                    className="group flex items-start gap-3 border-b border-neutral-100 p-4 transition last:border-0 hover:bg-neutral-50"
                  >
                    {p.avatar && (
                      <Image
                        src={p.avatar}
                        alt={p.author}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-black text-orange-700">
                          {p.topic.toUpperCase()}
                        </span>
                        <span className="text-[11px] font-semibold text-neutral-400">
                          {p.author} · {timeAgo(p.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-black leading-snug text-neutral-900 group-hover:text-evos">
                        {p.title}
                      </h3>
                      <p className="line-clamp-2 text-[13px] text-neutral-500">
                        {p.body}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                        <span>♥ {p.likes}</span>
                        <span>{p.replies} yanıt</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* SAĞ SÜTUN */}
        <aside className="flex w-full shrink-0 flex-col gap-5 px-3 sm:px-0 lg:w-[330px]">
          {/* TÜRKİYE RESMÎ EV SATIŞ TABLOSU (ODMD) */}
          <TurkeyEvSalesWidget />

          {/* ÖTV REHBERİ SÜTUNU (Executive Premium Siyah & Kırmızı) */}
          <div className="overflow-hidden rounded-2xl border border-neutral-800/10 bg-white shadow-sm ring-1 ring-black/5">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-neutral-950 via-neutral-900 to-black px-4 py-3.5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800/80 text-red-500 ring-1 ring-white/10">
                    <IconTag className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-black tracking-wider text-white uppercase">ÖTV REHBERİ</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                    </div>
                    <p className="text-[10px] text-neutral-400 font-medium">2026 Resmî Vergi Dilimleri</p>
                  </div>
                </div>
                <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400 border border-red-500/30">
                  GÜNCEL MATRAH
                </span>
              </div>
            </div>

            {/* Tax Brackets */}
            <div className="flex flex-col divide-y divide-neutral-100 p-2">
              {/* Dilim 1: %25 (Taban Dilim - Öne Çıkan) */}
              <div className="relative rounded-xl border border-red-500/30 bg-red-50/20 p-3 transition hover:bg-red-50/40">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-neutral-950">Motor ≤ 160 kW</span>
                      <span className="rounded bg-red-600 px-1.5 py-0.2 text-[8px] font-black text-white uppercase tracking-wider">
                        AVANTAJLI
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-600">Matrah ≤ 1.450.000 ₺</span>
                    <span className="text-[10px] text-neutral-500 font-medium mt-0.5">Togg T10X, Tesla Model Y SR, Atto 3</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-black text-white shadow-xs">
                      %25 ÖTV
                    </span>
                  </div>
                </div>
              </div>

              {/* Dilim 2: %40 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor ≤ 160 kW</span>
                  <span className="text-[11px] text-neutral-600 font-semibold">Matrah &gt; 1.450.000 ₺</span>
                  <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Yüksek donanımlı tek motor modeller</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-black text-neutral-900">
                    %40 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 3: %50 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor &gt; 160 kW</span>
                  <span className="text-[11px] text-neutral-600 font-semibold">Matrah ≤ 1.350.000 ₺</span>
                  <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Çift motor AWD baz versiyonlar</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-neutral-100 border border-neutral-200 px-2.5 py-1 text-xs font-black text-neutral-900">
                    %50 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 4: %60 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor &gt; 160 kW</span>
                  <span className="text-[11px] text-neutral-600 font-semibold">Matrah &gt; 1.350.000 ₺</span>
                  <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Lüks & Yüksek Performans AWD</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-neutral-900 text-white px-2.5 py-1 text-xs font-black">
                    %60 ÖTV
                  </span>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="bg-neutral-950 px-3.5 py-3 border-t border-neutral-800 text-[11px] leading-relaxed text-neutral-400">
              <span className="text-red-500 font-black mr-1">●</span>
              Nihai satış fiyatına ÖTV sonrası <strong>%20 KDV</strong> eklenir. Elektrikli araçlarda taban vergi baremi <strong>%25</strong>&apos;tir.
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
    </div>
  );
}
