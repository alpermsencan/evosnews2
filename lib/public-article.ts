export const PUBLIC_ARTICLE_SELECT = {
  id: true, title: true, slug: true, spot: true, content: true,
  image: true, imageCredit: true, gallery: true, tags: true,
  isBreaking: true, isFeatured: true, isHeadline: true, isVideo: true,
  views: true, readTime: true, publishedAt: true, updatedAt: true,
  sourceName: true, sourceUrl: true,
  category: { select: { name: true, slug: true, color: true } },
  author: { select: { name: true, slug: true, avatar: true } },
} as const;

export const PUBLIC_COMMENT_SELECT = {
  id: true, articleId: true, userId: true, name: true, body: true,
  parentId: true, likes: true, createdAt: true,
  user: { select: { id: true, name: true, username: true, avatar: true } },
} as const;
