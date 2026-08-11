import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, num, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import {
  POST_KINDS,
  POST_SELECT,
  decoratePosts,
  getFeed,
  normalizeVisibility,
  type FeedScope,
  type PostKind,
} from "@/lib/social";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY = 2000;
const MAX_IMAGES = 4;
const SCOPES: FeedScope[] = ["feed", "explore", "user", "article"];

/**
 * GET /api/posts
 * ?scope=feed|explore|user|article &kind=text|reel &username= &articleId=
 * &before=<ISO tarih> &limit=
 */
export async function GET(req: NextRequest) {
  const viewer = await getRequestUser(req);
  const sp = req.nextUrl.searchParams;

  const scopeParam = String(sp.get("scope") || "explore") as FeedScope;
  const scope = SCOPES.includes(scopeParam) ? scopeParam : "explore";
  const kindParam = sp.get("kind");
  const kind = POST_KINDS.includes(kindParam as PostKind)
    ? (kindParam as PostKind)
    : undefined;

  let authorId: string | undefined;
  const username = sp.get("username");
  if (scope === "user") {
    if (!username) return fail("username parametresi gerekli");
    const target = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true, isBanned: true },
    });
    if (!target || target.isBanned) return fail("Kullanıcı bulunamadı", 404);
    authorId = target.id;
  }

  const items = await getFeed({
    viewerId: viewer?.id ?? null,
    scope,
    kind,
    authorId,
    articleId: sp.get("articleId") ?? undefined,
    before: sp.get("before"),
    limit: num(sp.get("limit"), 12),
  });

  // Son öğenin tarihi bir sonraki sayfanın imleci olur
  const nextCursor =
    items.length > 0 ? items[items.length - 1].createdAt : null;

  return ok({ items, nextCursor });
}

/** POST /api/posts — yeni gönderi veya reel oluşturur */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return fail("Paylaşım yapmak için giriş yapmalısınız", 401);

  try {
    const body = await req.json();

    const kind: PostKind = POST_KINDS.includes(body.kind) ? body.kind : "text";
    const text = String(body.body ?? "").trim().slice(0, MAX_BODY);
    const images = Array.isArray(body.images)
      ? body.images.filter((i: unknown) => typeof i === "string").slice(0, MAX_IMAGES)
      : [];
    const videoUrl =
      typeof body.videoUrl === "string" && body.videoUrl ? body.videoUrl : null;

    if (kind === "reel" && !videoUrl)
      return fail("Reel paylaşmak için video yüklemelisiniz");
    if (kind === "text" && !text && images.length === 0)
      return fail("Boş gönderi paylaşılamaz");

    // Bağlanan içerikler gerçekten var mı?
    const [article, vehicle] = await Promise.all([
      body.articleId
        ? prisma.article.findUnique({
            where: { id: String(body.articleId) },
            select: { id: true, slug: true, title: true },
          })
        : null,
      body.vehicleId
        ? prisma.vehicle.findUnique({
            where: { id: String(body.vehicleId) },
            select: { id: true },
          })
        : null,
    ]);

    // #etiket biçimindeki kelimeler etiket olarak da saklanır
    const hashTags = [...text.matchAll(/#([\p{L}\p{N}_]{2,30})/gu)].map((m) =>
      m[1].toLowerCase()
    );
    const extraTags = Array.isArray(body.tags)
      ? body.tags.filter((t: unknown) => typeof t === "string")
      : [];
    const tags = [...new Set([...hashTags, ...extraTags])].slice(0, 10);

    const created = await prisma.post.create({
      data: {
        kind,
        authorId: user.id,
        body: text,
        images: kind === "reel" ? [] : images,
        tags,
        videoUrl,
        posterUrl:
          typeof body.posterUrl === "string" && body.posterUrl
            ? body.posterUrl
            : null,
        durationSec: Number(body.durationSec) || 0,
        visibility: normalizeVisibility(body.visibility),
        articleId: article?.id ?? null,
        vehicleId: vehicle?.id ?? null,
      },
      select: POST_SELECT,
    });

    // Not: yeni paylaşım için takipçilere bildirim üretilmez; akış zaten
    // bu gönderiyi gösterir, bildirim kutusu gereksiz yere dolmasın.
    const [post] = await decoratePosts([created], user.id);
    return ok({ post }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Gönderi paylaşılamadı", 500);
  }
}
