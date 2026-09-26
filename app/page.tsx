import Link from "next/link";
import Image from "next/image";
import HeroHybrid from "@/components/home/HeroHybrid";
import RealRangeSimulator from "@/components/tools/RealRangeSimulator";
import FuelSavingsCalculator from "@/components/tools/FuelSavingsCalculator";
import NewsCard from "@/components/news/NewsCard";
import SectionTitle from "@/components/news/SectionTitle";
import CardRail from "@/components/ui/CardRail";
import VehicleCard from "@/components/vehicles/VehicleCard";
import PollWidget from "@/components/ui/PollWidget";
import NewsletterForm from "@/components/ui/NewsletterForm";
import {
  IconBolt,
  IconChevronRight,
  IconShield,
  IconSparkles,
  IconChart,
  IconCar,
  IconUsers,
  IconTag,
  IconLayers,
} from "@/components/ui/Icons";
import {
  getHeadlines,
  getLatest,
  getByCategory,
  getFeaturedVehicles,
  getCommunityPosts,
  getActivePoll,
  getPriceIndex,
} from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatTL, timeAgo } from "@/lib/utils";
import EvosIntelligence from "@/components/home/EvosIntelligence";
import EvosVoiceIntelligence from "@/components/home/EvosVoiceIntelligence";
import ListingCard from "@/components/listings/ListingCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewer = await getCurrentUser();

  const [
    headlines,
    latest,
    charge,
    vehicles,
    community,
    poll,
    priceIndex,
    stations,
    tech,
    listings,
  ] = await Promise.all([
    getHeadlines(6),
    getLatest(16),
    getByCategory("sarj-agi", 4),
    getFeaturedVehicles(8),
    getCommunityPosts(5),
    getActivePoll(),
    getPriceIndex(),
    prisma.chargeStation.findMany({ take: 5, orderBy: { maxPowerKw: "desc" } }),
    getByCategory("teknoloji", 4),
    prisma.listing.findMany({
      take: 4,
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        brand: true,
        model: true,
        year: true,
        km: true,
        price: true,
        city: true,
        image: true,
        condition: true,
        sellerType: true,
        sellerName: true,
        damage: true,
        rangeKm: true,
        batteryHealth: true,
        isSponsored: true,
        voltScore: true,
        batteryReport: {
          select: {
            verifiedAt: true,
            sohPercent: true,
            riskLevel: true,
          }
        }
      }
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", author: { title: { contains: "Editör" } } },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    }),
    prisma.article.findMany({
      where: { status: "PUBLISHED", author: { title: { contains: "Yazar" } } },
      take: 4,
      orderBy: { publishedAt: "desc" },
      include: { author: true, category: true }
    })
  ]);

  const last = priceIndex[priceIndex.length - 1];
  const heroIds = new Set(headlines.map((h) => h.id));
  const feed = latest.filter((a) => !heroIds.has(a.id));

  return (
    <div className="flex flex-col gap-6 sm:gap-8 sm:pt-4">
      {/* HİBRİT HERO: AKILLI EV BULUCU + GÜNÜN MANŞETİ */}
      <HeroHybrid
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

      {/* İNTERAKTİF EV ARAÇLARI: MENZİL SİMÜLATÖRÜ & TASARRUF HESAPLAYICI */}
      <section id="menzil-simulatoru" className="px-3 sm:px-0 scroll-mt-20">
        <RealRangeSimulator />
      </section>

      <section id="tasarruf-hesapla" className="px-3 sm:px-0 scroll-mt-20">
        <FuelSavingsCalculator />
      </section>

      {/* EVOS İLAN MERKEZİ (Öne Çıkan İlanlar) */}
      <section className="px-3 sm:px-0">
        <SectionTitle
          title="EVOS İLAN MERKEZİ"
          href="/ilanlar"
          color="#be123c"
          subtitle="Öne çıkan ve bataryası doğrulanmış ilanlar"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(listings.length > 0 ? listings : [
            {
              id: "mock1",
              title: "Sahibinden Temiz Togg T10X V2 Uzun Menzil",
              slug: "sahibinden-togg-t10x-v2-1",
              brand: "Togg",
              model: "T10X V2",
              year: 2024,
              km: 12500,
              price: 1650000,
              city: "Ankara",
              image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Sahibinden",
              sellerName: "Ahmet Yılmaz",
              damage: "Boyasız / Hasarsız",
              rangeKm: 420,
              batteryHealth: 98,
              isSponsored: true,
              voltScore: 94,
              batteryReport: null
            },
            {
              id: "mock2",
              title: "Tesla Model Y RWD - Boyasız Hata Kaza Yoktur",
              slug: "tesla-model-y-rwd-boyasiz-hata-kaza-yoktur",
              brand: "Tesla",
              model: "Model Y RWD",
              year: 2023,
              km: 34000,
              price: 1980000,
              city: "İstanbul",
              image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Galeri",
              sellerName: "Evos Motors",
              damage: "Hasarsız",
              rangeKm: 380,
              batteryHealth: 94,
              isSponsored: false,
              voltScore: 89,
              batteryReport: {
                verifiedAt: new Date().toISOString(),
                sohPercent: 94,
                riskLevel: "LOW"
              }
            },
            {
              id: "mock3",
              title: "MG4 Electric Luxury - İlk Sahibinden Sıkıntısız",
              slug: "mg4-electric-luxury-ilk-sahibinden-sikintisiz",
              brand: "MG",
              model: "MG4 Electric",
              year: 2023,
              km: 15400,
              price: 1240000,
              city: "İzmir",
              image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Sahibinden",
              sellerName: "Eser Kaya",
              damage: "Hasarsız",
              rangeKm: 435,
              batteryHealth: 97,
              isSponsored: false,
              voltScore: 93,
              batteryReport: null
            },
            {
              id: "mock4",
              title: "Opel Corsa-e Ultimate - Sıfır Ayarında Garanti Kapsamında",
              slug: "opel-corsa-e-ultimate-sifir-ayarinda",
              brand: "Opel",
              model: "Corsa-e",
              year: 2023,
              km: 9800,
              price: 1120000,
              city: "Bursa",
              image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&auto=format&fit=crop&q=60",
              condition: "IKINCI_EL",
              sellerType: "Sahibinden",
              sellerName: "Caner Şen",
              damage: "Lokal Boyalı",
              rangeKm: 350,
              batteryHealth: 96,
              isSponsored: false,
              voltScore: 91,
              batteryReport: null
            }
          ]).map((item: any) => (
            <ListingCard key={item.id} listing={item} />
          ))}
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

          {/* TOPLULUK — üye içeriği yoksa bölüm hiç gösterilmez */}
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
          {last && (
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 bg-amber-600 px-4 py-3">
                <IconChart className="h-4 w-4 text-white" />
                <h3 className="text-sm font-black tracking-wide text-white">
                  EVOS FİYAT ENDEKSİ
                </h3>
              </div>
              {/* Yalnızca doğrulanmış kaynağı olan satırlar gösterilir;
                  operatör tarife girmediyse o satır hiç çıkmaz. */}
              <div className="flex flex-col divide-y divide-neutral-100">
                <Row label="Ortalama EV fiyatı" value={formatTL(last.avgEvPrice)} />
                <Row label="Ortalama menzil" value={`${last.avgRangeKm} km`} />
                <Row label="Katalogdaki model" value={`${last.modelCount}`} />
                {last.dcChargeCost != null && (
                  <Row label="DC şarj" value={`${last.dcChargeCost.toFixed(2)} ₺/kWh`} />
                )}
                {last.acChargeCost != null && (
                  <Row label="AC şarj" value={`${last.acChargeCost.toFixed(2)} ₺/kWh`} />
                )}
                {last.batteryUsd != null && (
                  <Row label="Batarya maliyeti" value={`${last.batteryUsd} $/kWh`} />
                )}
                {last.evShare != null && <Row label="EV pazar payı" value={`%${last.evShare}`} />}
              </div>
              <Link
                href="/fiyat-analizi"
                className="flex items-center justify-center gap-1 bg-neutral-50 py-3 text-xs font-bold text-neutral-600 hover:text-evos"
              >
                DETAYLI ANALİZ <IconChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}

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

          <EvosVoiceIntelligence />

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <NewsletterForm />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5">
            <IconShield className="h-7 w-7 text-blue-700" />
            <h3 className="text-base font-black leading-tight text-neutral-900">
              Evos Protect ile bataryanız 10 yıl güvende
            </h3>
            <p className="text-sm text-neutral-600">
              Kapasite %70&apos;in altına düşerse modül değişimi ücretsiz.
            </p>
            <Link
              href="/evos-protect"
              className="rounded-md bg-blue-700 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-blue-800"
            >
              PAKETLERİ İNCELE
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-[12px] font-semibold text-neutral-500">{label}</span>
      <span className="text-[13px] font-black text-neutral-900">{value}</span>
    </div>
  );
}
