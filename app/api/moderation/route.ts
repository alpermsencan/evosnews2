import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { touchArticles } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

/**
 * Moderasyon kuyruğu kararları.
 * Yetki kontrolü middleware'de yapılır (/api/moderation admin'e kapalıdır).
 *
 * POST { id, action: "publish" | "reject" | "draft" }
 */
export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();
    if (!id) return fail("id zorunludur");

    const STATUS: Record<string, string> = {
      publish: "PUBLISHED",
      reject: "REJECTED",
      draft: "DRAFT",
    };
    const status = STATUS[action];
    if (!status) return fail("Geçersiz işlem: publish | reject | draft");

    const article = await prisma.article.findUnique({
      where: { id },
      select: { id: true, image: true, title: true },
    });
    if (!article) return fail("Haber bulunamadı", 404);

    // Yayına alınacak taslak hâlâ yer tutucu görselle duruyorsa uyar:
    // ana sayfada boş kutu görünmesin.
    if (status === "PUBLISHED" && article.image === "/haber-placeholder.svg") {
      return fail("Yayına almadan önce habere görsel ekleyin", 422);
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status,
        // Yayına alınırken tarih tazelenir ki akışta en üstte çıksın.
        ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}),
      },
      select: { id: true, status: true, slug: true },
    });

    touchArticles();
    return ok({ article: updated });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İşlem tamamlanamadı", 500);
  }
}

/** DELETE /api/moderation?id=... : taslağı tamamen sil */
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("id zorunludur");

    await prisma.article.delete({ where: { id } });
    touchArticles();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
