import "server-only";
import { prisma } from "./prisma";

export const ARTICLE_CARD_SELECT = {
  id: true,
  title: true,
  slug: true,
  spot: true,
  image: true,
  tags: true,
  isBreaking: true,
  isVideo: true,
  isFeatured: true,
  views: true,
  readTime: true,
  publishedAt: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { name: true, slug: true, avatar: true } },
} as const;

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getHeadlines(limit = 6) {
  return prisma.article.findMany({
    where: { isHeadline: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: ARTICLE_CARD_SELECT,
  });
}

export async function getLatest(limit = 12, skip = 0) {
  return prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip,
    select: ARTICLE_CARD_SELECT,
  });
}

export async function getMostRead(limit = 8) {
  return prisma.article.findMany({
    orderBy: { views: "desc" },
    take: limit,
    select: ARTICLE_CARD_SELECT,
  });
}

export async function getByCategory(slug: string, limit = 8, skip = 0) {
  return prisma.article.findMany({
    where: { category: { slug } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    skip,
    select: ARTICLE_CARD_SELECT,
  });
}

export async function countByCategory(slug: string) {
  return prisma.article.count({ where: { category: { slug } } });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, username: true, avatar: true },
          },
        },
      },
    },
  });
}

export async function getRelated(categoryId: string, excludeId: string, limit = 4) {
  return prisma.article.findMany({
    where: { categoryId, NOT: { id: excludeId } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: ARTICLE_CARD_SELECT,
  });
}

export async function getTickers() {
  return prisma.ticker.findMany({ orderBy: { order: "asc" } });
}

export async function getActivePoll() {
  return prisma.poll.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVehicles(where: Record<string, unknown> = {}, orderBy: Record<string, unknown> = { price: "asc" }) {
  return prisma.vehicle.findMany({ where, orderBy });
}

export async function getFeaturedVehicles(limit = 6) {
  return prisma.vehicle.findMany({
    where: { isFeatured: true },
    orderBy: { rangeKm: "desc" },
    take: limit,
  });
}

export async function getVehicleBySlug(slug: string) {
  return prisma.vehicle.findUnique({ where: { slug } });
}

export async function getStations() {
  return prisma.chargeStation.findMany({ orderBy: [{ city: "asc" }, { name: "asc" }] });
}

export async function getListings(limit?: number) {
  return prisma.listing.findMany({
    orderBy: [{ isSponsored: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getListingBySlug(slug: string) {
  return prisma.listing.findUnique({ where: { slug } });
}

export async function getCommunityPosts(limit?: number) {
  return prisma.communityPost.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getPriceIndex() {
  return prisma.priceIndex.findMany({ orderBy: { order: "asc" } });
}

export async function getOtvBrackets() {
  return prisma.otvBracket.findMany({ orderBy: { order: "asc" } });
}

export async function searchArticles(q: string, limit = 30) {
  if (!q?.trim()) return [];
  return prisma.article.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { spot: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: ARTICLE_CARD_SELECT,
  });
}

export type ArticleCard = Awaited<ReturnType<typeof getLatest>>[number];
