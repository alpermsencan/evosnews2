import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isCloudinaryReady } from "@/lib/cloudinary";
import ReelComposer from "@/components/social/ReelComposer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Yeni Reel" };

export default async function NewReelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/reels/yeni");

  const [articles, vehicles] = await Promise.all([
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 30,
      select: { id: true, title: true },
    }),
    prisma.vehicle.findMany({
      orderBy: [{ brand: "asc" }, { model: "asc" }],
      take: 100,
      select: { id: true, brand: true, model: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-neutral-900">Yeni Reel</h1>
        <Link
          href="/reels"
          className="text-[12px] font-black text-neutral-500 transition hover:text-evos"
        >
          ← REELS&apos;E DÖN
        </Link>
      </div>

      {!isCloudinaryReady ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-bold text-amber-800">
          Video yükleme için Cloudinary yapılandırması gerekli. .env dosyasına
          CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ve CLOUDINARY_API_SECRET
          değerlerini ekleyin.
        </p>
      ) : (
        <ReelComposer
          articles={articles.map((a) => ({
            id: a.id,
            label: a.title.length > 60 ? `${a.title.slice(0, 60)}...` : a.title,
          }))}
          vehicles={vehicles.map((v) => ({
            id: v.id,
            label: `${v.brand} ${v.model}`,
          }))}
        />
      )}
    </div>
  );
}
