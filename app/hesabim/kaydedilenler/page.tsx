import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kaydedilen Haberler" };

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?devam=/hesabim/kaydedilenler");

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      article: {
        select: {
          id: true,
          title: true,
          slug: true,
          spot: true,
          image: true,
          publishedAt: true,
          category: { select: { name: true, color: true } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-4 px-3 py-4 sm:px-0 sm:pt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-black text-neutral-900">
          Kaydedilen Haberler
          <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-500">
            {bookmarks.length}
          </span>
        </h1>
        <Link
          href="/hesabim"
          className="text-xs font-bold text-neutral-500 hover:text-evos"
        >
          ← HESAP AYARLARI
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-14">
          <p className="text-sm text-neutral-500">
            Henüz haber kaydetmedin. Haber sayfasındaki{" "}
            <b className="text-neutral-700">Kaydet</b> butonuyla okuma listeni
            oluşturabilirsin.
          </p>
          <Link
            href="/"
            className="rounded-md bg-evos px-5 py-2.5 text-[12px] font-black text-white transition hover:bg-evos-dark"
          >
            HABERLERE GÖZ AT
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {bookmarks.map(({ id, createdAt, article }) => (
            <li key={id}>
              <Link
                href={`/haber/${article.slug}`}
                className="group flex gap-3 rounded-lg border border-neutral-200 bg-white p-3 transition hover:border-evos"
              >
                <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-md bg-neutral-100 sm:w-40">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span
                    className="text-[10px] font-black"
                    style={{ color: article.category.color }}
                  >
                    {article.category.name.toUpperCase()}
                  </span>
                  <span className="line-clamp-2 text-[15px] font-black leading-snug text-neutral-900 group-hover:text-evos">
                    {article.title}
                  </span>
                  <span className="line-clamp-2 text-[13px] text-neutral-500">
                    {article.spot}
                  </span>
                  <span className="mt-auto text-[11px] font-bold text-neutral-400">
                    {timeAgo(createdAt)} kaydedildi
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
