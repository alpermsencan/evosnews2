/** İstemci tarafındaki sosyal katman tipleri (lib/social.ts sunucuya özeldir) */

export type SocialUser = {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  role: string;
};

export type PersonSummary = SocialUser & {
  bio?: string | null;
  city?: string | null;
  mutualCount?: number;
  isFollowing?: boolean;
  requestedAt?: string;
};

export type PostArticle = {
  id: string;
  title: string;
  slug: string;
  image: string;
  spot: string;
  category: { name: string; color: string };
};

export type PostVehicle = {
  id: string;
  brand: string;
  model: string;
  slug: string;
  image: string;
  price: number;
};

export type SocialPost = {
  id: string;
  kind: string;
  body: string;
  images: string[];
  tags: string[];
  videoUrl: string | null;
  posterUrl: string | null;
  durationSec: number;
  visibility: string;
  likeCount: number;
  commentCount: number;
  views: number;
  createdAt: string;
  author: SocialUser;
  article: PostArticle | null;
  vehicle: PostVehicle | null;
  likedByMe: boolean;
  isMine: boolean;
};

export type PostComment = {
  id: string;
  body: string;
  createdAt: string;
  user: SocialUser;
  isMine: boolean;
};

export const VISIBILITY_OPTIONS = [
  { value: "public", label: "Herkese açık", hint: "Herkes görebilir" },
  { value: "friends", label: "Arkadaşlarım", hint: "Sadece arkadaşların" },
  { value: "private", label: "Sadece ben", hint: "Kimse göremez" },
] as const;

export const VISIBILITY_ICON: Record<string, string> = {
  public: "🌐",
  friends: "👥",
  private: "🔒",
};
