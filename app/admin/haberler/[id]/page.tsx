import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntityForm from "@/components/admin/EntityForm";
import { articleFields } from "@/components/admin/fieldSets";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [article, categories, authors] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!article) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-neutral-900">Haberi Düzenle</h2>
        <Link
          href={`/haber/${article.slug}`}
          target="_blank"
          className="text-xs font-bold text-neutral-500 hover:text-evos"
        >
          SİTEDE GÖRÜNTÜLE →
        </Link>
      </div>

      <EntityForm
        fields={articleFields(
          categories.map((c) => ({ value: c.id, label: c.name })),
          authors.map((a) => ({ value: a.id, label: a.name }))
        )}
        initial={{
          title: article.title,
          slug: article.slug,
          categoryId: article.categoryId,
          authorId: article.authorId ?? "",
          image: article.image,
          imageCredit: article.imageCredit ?? "",
          readTime: article.readTime,
          spot: article.spot,
          content: article.content,
          tags: article.tags,
          gallery: article.gallery,
          isHeadline: article.isHeadline,
          isFeatured: article.isFeatured,
          isBreaking: article.isBreaking,
          isVideo: article.isVideo,
          publishedAt: article.publishedAt.toISOString(),
        }}
        endpoint={`/api/articles/${article.id}`}
        method="PUT"
        redirectTo="/admin/haberler"
        submitLabel="DEĞİŞİKLİKLERİ KAYDET"
      />
    </div>
  );
}
