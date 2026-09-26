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
  const viewer = await getCurrentUser();

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
    getHeadlines(6),
    getLatest(16),
    getFeaturedVehicles(8),
    getCommunityPosts(5),
    getActivePoll(),
    getByCategory("teknoloji", 4),
    prisma.article.findMany({
      where: { status: "PUBLISHED", author: { title: { contains: "Editör" } } },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    }),
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { author: { title: { contains: "Yazar" } } },
          { author: { title: { contains: "Analist" } } },
        ]
      },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    })
  ]);

  const heroIds = new Set(headlines.map((h) => h.id));
  const feed = latest.filter((a) => !heroIds.has(a.id));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 sm:pt-4">
      {/* MANŞET CAROUSEL (Akıllı araç eşleştirici kaldırıldı, sade manşet) */}
      <HeroCarousel
        slides={headlines.map((h) => ({
          id: h.id,
          title: h.title,
          slug: h.slug,
          spot: h.spot,
          image: h.image,
          isVideo: h.isVideo,
          isBreaking: h.isBreaking,
          publishedAt: h.publishedAt,
          category: h.category,
        }))}
      />

      {/* GÜNLÜK YAZILAR: EDİTÖRÜN KALEMİNDEN & YAZARLARDAN (Eski versiyon geri getirildi) */}
      <section className="px-3 sm:px-0 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol: Editörün Kaleminden */}
        <div className="flex flex-col gap-3">
          <SectionTitle
            title="EDİTÖRÜN KALEMİNDEN"
            color="#0f172a"
            href="/kategori/haber-merkezi"
          />
          <div className="flex flex-col gap-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
            {editorArticles.length > 0 ? (
              (() => {
                const first = editorArticles[0];
                const rest = editorArticles.slice(1);
                return (
                  <>
                    {/* Featured Large Card */}
                    <Link href={`/haber/${first.slug}`} className="group flex flex-col gap-3 pb-4 border-b border-neutral-100">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100">
                        <img src={first.image} alt={first.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                          {first.category?.name || "Editör İncelemesi"}
                        </span>
                        <h3 className="text-base font-black text-neutral-900 leading-snug group-hover:text-sky-600 transition">
                          {first.title}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{first.spot}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-neutral-400">
                          {first.author?.avatar && (
                            <img src={first.author.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                          )}
                          <span className="truncate">{first.author?.name}</span>
                          <span>·</span>
                          <span className="shrink-0">{timeAgo(first.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Smaller horizontal list */}
                    <div className="flex flex-col gap-4">
                      {rest.map((a) => (
                        <Link key={a.id} href={`/haber/${a.slug}`} className="flex items-start gap-4 group border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded bg-neutral-100">
                            <img src={a.image} alt={a.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition leading-snug line-clamp-2">
                              {a.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-neutral-400">
                              {a.author?.avatar && (
                                <img src={a.author.avatar} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                              )}
                              <span className="truncate">{a.author?.name}</span>
                              <span>·</span>
                              <span className="shrink-0">{timeAgo(a.publishedAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                );
              })()
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">Henüz editör yazısı bulunmuyor.</p>
            )}
          </div>
        </div>

        {/* Sağ: Yazarlardan */}
        <div className="flex flex-col gap-3">
          <SectionTitle
            title="YAZARLARDAN"
            color="#0f172a"
            href="/kategori/teknoloji"
          />
          <div className="flex flex-col gap-5 bg-white border border-neutral-200 rounded-lg p-5 shadow-sm">
            {authorArticles.length > 0 ? (
              (() => {
                const first = authorArticles[0];
                const rest = authorArticles.slice(1);
                return (
                  <>
                    {/* Featured Large Card */}
                    <Link href={`/haber/${first.slug}`} className="group flex flex-col gap-3 pb-4 border-b border-neutral-100">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-neutral-100">
                        <img src={first.image} alt={first.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-black uppercase text-teal-700 tracking-wider">
                          {first.category?.name || "Yazar İncelemesi"}
                        </span>
                        <h3 className="text-base font-black text-neutral-900 leading-snug group-hover:text-sky-600 transition">
                          {first.title}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{first.spot}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-neutral-400">
                          {first.author?.avatar && (
                            <img src={first.author.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                          )}
                          <span className="truncate">{first.author?.name}</span>
                          <span>·</span>
                          <span className="shrink-0">{timeAgo(first.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Smaller horizontal list */}
                    <div className="flex flex-col gap-4">
                      {rest.map((a) => (
                        <Link key={a.id} href={`/haber/${a.slug}`} className="flex items-start gap-4 group border-b border-neutral-100 last:border-0 pb-4 last:pb-0">
                          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded bg-neutral-100">
                            <img src={a.image} alt={a.title} className="object-cover w-full h-full group-hover:scale-102 transition duration-300" />
                          </div>
                          <div className="flex flex-col gap-1 min-w-0">
                            <h4 className="text-sm font-black text-neutral-900 group-hover:text-sky-600 transition leading-snug line-clamp-2">
                              {a.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-neutral-400">
                              {a.author?.avatar && (
                                <img src={a.author.avatar} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                              )}
                              <span className="truncate">{a.author?.name}</span>
                              <span>·</span>
                              <span className="shrink-0">{timeAgo(a.publishedAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                );
              })()
            ) : (
              <p className="text-xs text-neutral-500 py-4 text-center">Henüz yazar yazısı bulunmuyor.</p>
            )}
          </div>
        </div>
      </section>

      {/* ANA İÇERİK + SAĞ SÜTUN */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          {/* GÜNDEM */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="GÜNDEM"
              href="/kategori/haber-merkezi"
              subtitle="Elektrikli mobilite dünyasından son gelişmeler"
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

          {/* ARAÇLARI KEŞFET */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="ARAÇLARI KEŞFET"
              href="/araclar"
              color="#0f766e"
              subtitle="Türkiye'de satışta olan öne çıkan elektrikli modeller"
            />
            <CardRail itemClass="w-[62%] sm:w-[38%] lg:w-[27%]" autoPlay={true}>
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </CardRail>
          </section>

          {/* TEKNOLOJİ */}
          <section className="px-3 sm:px-0">
            <SectionTitle
              title="TEKNOLOJİ"
              href="/kategori/teknoloji"
              color="#9333ea"
              subtitle="Batarya, yazılım ve otonom sürüş"
            />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {tech.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </section>

          {/* TOPLULUK */}
          {community.length > 0 && (
            <section className="px-3 sm:px-0">
              <SectionTitle
                title="TOPLULUK"
                href="/topluluk"
                color="#c2410c"
                subtitle="Evos kullanıcılarının deneyimleri ve tartışmaları"
              />
              <div className="flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white">
                {community.map((p) => (
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
          {/* ÖTV REHBERİ SÜTUNU (Anasayfaya sağ tarafa yerleştirildi) */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-700 to-purple-800 px-4 py-3.5 text-white">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                  <IconTag className="h-4 w-4 text-white" />
                </span>
                <div>
                  <h3 className="text-sm font-black tracking-wide">ÖTV REHBERİ</h3>
                  <p className="text-[10px] text-white/80 font-medium">2026 Elektrikli Araç Vergi Dilimleri</p>
                </div>
              </div>
              <span className="rounded bg-white/20 px-2 py-0.5 text-[10px] font-bold">GÜNCEL</span>
            </div>

            <div className="flex flex-col divide-y divide-neutral-100 p-1">
              {/* Dilim 1: %10 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor ≤ 160 kW</span>
                  <span className="text-[11px] text-neutral-500 font-medium">Matrah ≤ 1.450.000 TL</span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5">Togg T10X, Model Y SR, Atto 3</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                    %10 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 2: %40 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor ≤ 160 kW</span>
                  <span className="text-[11px] text-neutral-500 font-medium">Matrah &gt; 1.450.000 TL</span>
                  <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Yüksek donanımlı tek motor</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">
                    %40 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 3: %50 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor &gt; 160 kW</span>
                  <span className="text-[11px] text-neutral-500 font-medium">Matrah ≤ 1.350.000 TL</span>
                  <span className="text-[10px] text-neutral-400 font-medium mt-0.5">Çift motor baz versiyonlar</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-black text-orange-700">
                    %50 ÖTV
                  </span>
                </div>
              </div>

              {/* Dilim 4: %60 */}
              <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-neutral-900">Motor &gt; 160 kW</span>
                  <span className="text-[11px] text-neutral-500 font-medium">Matrah &gt; 1.350.000 TL</span>
                  <span className="text-[10px] text-rose-600 font-medium mt-0.5">Performans / Lüks AWD</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rounded-lg bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">
                    %60 ÖTV
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 p-3 border-t border-neutral-100">
              <p className="text-[11px] leading-relaxed text-neutral-500">
                💡 <strong>Not:</strong> Nihai etiket fiyatına ÖTV sonrası <strong>%20 KDV</strong> ilave edilir. 160 kW altındaki çoğu elektrikli model avantajlı <strong>%10</strong> dilimindedir.
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
    </div>
  );
}
