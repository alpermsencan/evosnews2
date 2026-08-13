import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getFeed, type FeedPost } from "@/lib/social";
import type { SocialPost } from "@/components/social/types";
import PostComposer from "@/components/social/PostComposer";
import PostFeed from "@/components/social/PostFeed";
import SectionTitle from "@/components/news/SectionTitle";
import { formatTL } from "@/lib/utils";
import { IconUsers } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = await prisma.vehicle.findUnique({
    where: { slug },
    select: { brand: true, model: true },
  });
  if (!v) return { title: "Topluluk bulunamadı" };
  return {
    title: `${v.brand} ${v.model} Topluluğu`,
    description: `${v.brand} ${v.model} sahiplerinin deneyimleri, menzil ve şarj gözlemleri, soruları.`,
  };
}

export default async function VehicleCommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const viewer = await getCurrentUser();

  const vehicle = await prisma.vehicle.findUnique({ where: { slug } });
  if (!vehicle) notFound();

  const [posts, postCount, listingCount] = await Promise.all([
    getFeed({
      viewerId: viewer?.id ?? null,
      scope: "vehicle",
      vehicleId: vehicle.id,
      limit: 12,
    }),
    prisma.post.count({ where: { vehicleId: vehicle.id, isHidden: false } }),
    prisma.listing.count({ where: { vehicleId: vehicle.id, status: "PUBLISHED" } }),
  ]);

  const items = posts.map((p: FeedPost) => p as unknown as SocialPost);
  const cursor = items.length > 0 ? items[items.length - 1].createdAt : null;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-0 sm:pt-4">
      <header className="flex flex-col gap-4 overflow-hidden rounded-lg border border-neutral-200 bg-white sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 bg-neutral-100 sm:aspect-auto sm:w-[280px]">
          <Image
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            fill
            sizes="280px"
            className="object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
          <nav className="flex items-center gap-2 text-[11px] font-bold text-neutral-400">
            <Link href="/topluluk" className="hover:text-evos">TOPLULUK</Link>
            <span>›</span>
            <span className="text-neutral-600">{vehicle.brand.toUpperCase()}</span>
          </nav>
          <h1 className="text-2xl font-black text-neutral-900">
            {vehicle.brand} {vehicle.model} Topluluğu
          </h1>
          <p className="text-sm leading-relaxed text-neutral-600">
            Bu modeli kullananların gerçek deneyimleri: menzil gözlemleri, şarj
            alışkanlıkları, servis notları ve sorular.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Chip>{postCount} paylaşım</Chip>
            <Chip>{vehicle.rangeKm} km WLTP</Chip>
            <Chip>{vehicle.batteryKwh} kWh</Chip>
            <Chip>{formatTL(vehicle.price, { compact: true })}</Chip>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={`/araclar/${vehicle.slug}`}
              className="rounded-md bg-evos px-4 py-2 text-[12px] font-black text-white transition hover:bg-evos-dark"
            >
              MODEL SAYFASI
            </Link>
            {listingCount > 0 && (
              <Link
                href={`/ilanlar?marka=${encodeURIComponent(vehicle.brand)}`}
                className="rounded-md border border-neutral-200 px-4 py-2 text-[12px] font-black text-neutral-700 transition hover:border-evos hover:text-evos"
              >
                {listingCount} İLAN
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="flex flex-col gap-3">
        <PostComposer
          vehicleId={vehicle.id}
          vehicleTitle={`${vehicle.brand} ${vehicle.model}`}
          placeholder={`${vehicle.model} ile ilgili deneyiminizi paylaşın — menzil, şarj, servis…`}
        />
        <PostFeed
          query={{ scope: "vehicle", vehicleId: vehicle.id }}
          initialItems={items}
          initialCursor={cursor}
          emptyState={
            <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-[13px] text-neutral-500">
              Bu toplulukta henüz paylaşım yok. {vehicle.model} kullanıyorsanız
              ilk deneyimi siz paylaşın.
            </p>
          }
        />
      </section>

      <section>
        <SectionTitle title="DİĞER MODEL TOPLULUKLARI" href="/topluluk" color="#c2410c" />
        <OtherCommunities excludeId={vehicle.id} />
      </section>
    </div>
  );
}

async function OtherCommunities({ excludeId }: { excludeId: string }) {
  // Paylaşımı olan topluluklar önce gelsin; boş topluluk listeyi doldurmasın.
  const vehicles = await prisma.vehicle.findMany({
    where: { NOT: { id: excludeId } },
    select: {
      slug: true,
      brand: true,
      model: true,
      image: true,
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: "desc" } },
    take: 6,
  });

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
      {vehicles.map((v) => (
        <Link
          key={v.slug}
          href={`/topluluk/${v.slug}`}
          className="flex flex-col gap-1 overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md"
        >
          <div className="relative aspect-[16/10] w-full bg-neutral-100">
            <Image src={v.image} alt={v.model} fill sizes="180px" className="object-cover" />
          </div>
          <div className="flex flex-col gap-0.5 p-2.5">
            <span className="text-[10px] font-bold text-neutral-400">{v.brand}</span>
            <span className="truncate text-[12px] font-black text-neutral-900">{v.model}</span>
            <span className="flex items-center gap-1 text-[10px] text-neutral-500">
              <IconUsers className="h-3 w-3" />
              {v._count.posts} paylaşım
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-neutral-100 px-2 py-1 text-[11px] font-bold text-neutral-600">
      {children}
    </span>
  );
}
