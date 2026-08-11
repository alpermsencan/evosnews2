import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getByCategory, getCategoryBySlug, countByCategory, getMostRead } from "@/lib/queries";
import NewsCard from "@/components/news/NewsCard";
import MostRead from "@/components/news/MostRead";
import NewsletterForm from "@/components/ui/NewsletterForm";

// Kök layout oturumu sunucuda okuduğu için bu sayfa zaten istek başına
// render edilir; buradaki değer yalnızca layout ileride statikleşirse devreye
// girer. Verinin tazeliğini lib/cache.ts'teki etiketler ve TTL belirler —
// ikisi aynı kısa pencerede tutulur ki sayfa hiçbir koşulda eskimesin.
export const revalidate = 60;

const PAGE_SIZE = 12;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Kategori bulunamadı" };
  return { title: cat.name, description: cat.description ?? undefined };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number(sayfa) || 1);

  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const [articles, total, mostRead] = await Promise.all([
    getByCategory(slug, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    countByCategory(slug),
    getMostRead(8),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6 sm:pt-4">
      <header
        className="flex flex-col gap-2 px-4 py-6 text-white sm:rounded-lg"
        style={{ backgroundColor: cat.color }}
      >
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl">
          {cat.name.toUpperCase()}
        </h1>
        {cat.description && (
          <p className="max-w-3xl text-sm text-white/85 sm:text-base">
            {cat.description}
          </p>
        )}
        <span className="text-xs font-bold text-white/70">
          {total} haber · {totalPages} sayfa
        </span>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {articles.length === 0 && (
            <p className="rounded-lg bg-white p-8 text-center text-sm text-neutral-500">
              Bu kategoride henüz haber bulunmuyor.
            </p>
          )}

          {articles[0] && (
            <div className="px-3 sm:px-0">
              <NewsCard article={articles[0]} variant="wide" priority />
            </div>
          )}

          <div className="flex flex-col overflow-hidden bg-white sm:rounded-lg sm:border sm:border-neutral-200">
            {articles.slice(1).map((a) => (
              <NewsCard key={a.id} article={a} variant="row" />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-3 py-4 sm:px-0">
              {page > 1 && (
                <Link
                  href={`/kategori/${slug}?sayfa=${page - 1}`}
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:border-evos hover:text-evos"
                >
                  ‹ Önceki
                </Link>
              )}
              <span className="rounded-md bg-evos px-4 py-2 text-sm font-black text-white">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/kategori/${slug}?sayfa=${page + 1}`}
                  className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:border-evos hover:text-evos"
                >
                  Sonraki ›
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-5 px-3 sm:px-0 lg:w-[330px]">
          <MostRead articles={mostRead} />
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <NewsletterForm />
          </div>
        </aside>
      </div>
    </div>
  );
}
