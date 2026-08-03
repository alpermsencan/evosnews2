import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getArticleBySlug, getRelated, getMostRead } from "@/lib/queries";
import { formatDate, timeAgo } from "@/lib/utils";
import NewsCard from "@/components/news/NewsCard";
import MostRead from "@/components/news/MostRead";
import SectionTitle from "@/components/news/SectionTitle";
import CommentSection from "@/components/news/CommentSection";
import { IconClock, IconEye } from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    select: { title: true, spot: true, image: true },
  });
  if (!article) return { title: "Haber bulunamadı" };
  return {
    title: article.title,
    description: article.spot,
    openGraph: {
      title: article.title,
      description: article.spot,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Okunma sayacı (fire-and-forget)
  prisma.article
    .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const [related, mostRead] = await Promise.all([
    getRelated(article.categoryId, article.id, 4),
    getMostRead(8),
  ]);

  const paragraphs = article.content.split("\n\n").filter(Boolean);

  return (
    <div className="flex flex-col gap-6 sm:pt-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <article className="flex min-w-0 flex-1 flex-col bg-white sm:rounded-lg sm:border sm:border-neutral-200">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 px-4 pt-4 text-[11px] font-bold text-neutral-400">
            <Link href="/" className="hover:text-evos">
              ANASAYFA
            </Link>
            <span>›</span>
            <Link
              href={article.category.href || `/kategori/${article.category.slug}`}
              className="hover:text-evos"
              style={{ color: article.category.color }}
            >
              {article.category.name.toUpperCase()}
            </Link>
          </nav>

          <header className="flex flex-col gap-3 px-4 pt-3">
            {article.isBreaking && (
              <span className="w-fit rounded bg-evos px-2 py-1 text-[11px] font-black text-white">
                SON DAKİKA
              </span>
            )}
            <h1 className="text-[26px] font-black leading-[1.15] text-neutral-900 sm:text-4xl">
              {article.title}
            </h1>
            <p className="text-[15px] font-semibold leading-relaxed text-neutral-600 sm:text-lg">
              {article.spot}
            </p>

            <div className="flex flex-wrap items-center gap-3 border-y border-neutral-100 py-3">
              {article.author && (
                <div className="flex items-center gap-2">
                  {article.author.avatar && (
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      width={38}
                      height={38}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  )}
                  <div className="flex flex-col leading-tight">
                    <span className="text-[13px] font-black text-neutral-800">
                      {article.author.name}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {article.author.title}
                    </span>
                  </div>
                </div>
              )}
              <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] font-semibold text-neutral-400">
                <span className="flex items-center gap-1">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <IconEye className="h-3.5 w-3.5" />
                  {article.views.toLocaleString("tr-TR")} okunma
                </span>
                <span>{article.readTime} dk okuma</span>
              </div>
            </div>
          </header>

          <figure className="mt-4 flex flex-col">
            <div className="relative aspect-[16/9] w-full bg-neutral-100">
              <Image
                src={article.image}
                alt={article.title}
                fill
                priority
                sizes="(max-width:1024px) 100vw, 860px"
                className="object-cover"
              />
            </div>
            {article.imageCredit && (
              <figcaption className="px-4 py-2 text-[11px] italic text-neutral-400">
                {article.imageCredit}
              </figcaption>
            )}
          </figure>

          <div className="article-body px-4 py-5">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Galeri */}
          {article.gallery.length > 0 && (
            <div className="px-4 pb-5">
              <h3 className="mb-3 text-sm font-black tracking-wide text-neutral-800">
                FOTOĞRAF GALERİSİ
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {article.gallery.map((g, i) => (
                  <div
                    key={g}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100"
                  >
                    <Image
                      src={g}
                      alt={`${article.title} görsel ${i + 1}`}
                      fill
                      sizes="(max-width:640px) 50vw, 400px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Etiketler */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 pb-5">
              {article.tags.map((t) => (
                <Link
                  key={t}
                  href={`/ara?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-evos hover:text-evos"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <CommentSection
            articleId={article.id}
            initialComments={article.comments.map((c) => ({
              id: c.id,
              name: c.name,
              body: c.body,
              likes: c.likes,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </article>

        <aside className="flex w-full shrink-0 flex-col gap-5 px-3 sm:px-0 lg:w-[330px]">
          <MostRead articles={mostRead} />
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <div className="bg-evos px-4 py-3 text-sm font-black text-white">
              SON DAKİKA AKIŞI
            </div>
            <ul className="flex flex-col">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/haber/${r.slug}`}
                    className="flex flex-col gap-1 border-b border-neutral-100 px-4 py-3 transition last:border-0 hover:bg-neutral-50"
                  >
                    <span className="text-[11px] font-bold text-evos">
                      {timeAgo(r.publishedAt)}
                    </span>
                    <span className="line-clamp-2 text-[13px] font-bold text-neutral-800">
                      {r.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="px-3 sm:px-0">
        <SectionTitle
          title="İLGİLİ HABERLER"
          href={article.category.href || `/kategori/${article.category.slug}`}
          color={article.category.color}
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {related.map((r) => (
            <NewsCard key={`rel-${r.id}`} article={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
