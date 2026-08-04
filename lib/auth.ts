import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { SESSION_COOKIE, verifySession } from "./session";
import { slugify } from "./api";

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  city: string | null;
  website: string | null;
  twitter: string | null;
  role: string;
  createdAt: Date;
};

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  bio: true,
  city: true,
  website: true,
  twitter: true,
  role: true,
  createdAt: true,
} as const;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Server component / server action içinden oturumdaki kullanıcı */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const payload = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { ...PUBLIC_USER_SELECT, isBanned: true },
  });
  if (!user || user.isBanned) return null;

  const { isBanned: _isBanned, ...rest } = user;
  return rest;
}

/** Route handler içinden oturumdaki kullanıcı (request cookie'sinden) */
export async function getRequestUser(
  req: NextRequest
): Promise<SessionUser | null> {
  const payload = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { ...PUBLIC_USER_SELECT, isBanned: true },
  });
  if (!user || user.isBanned) return null;

  const { isBanned: _isBanned, ...rest } = user;
  return rest;
}

/** E-posta / ad soyaddan çakışmayan bir kullanıcı adı üretir */
export async function generateUsername(base: string) {
  const root = slugify(base).replace(/-/g, "").slice(0, 20) || "uye";
  let candidate = root;
  let i = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${root}${i}`;
    i += 1;
  }
  return candidate;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidUsername(username: string) {
  return /^[a-z0-9_]{3,20}$/.test(username);
}

export type NotificationType =
  | "reply"
  | "comment_like"
  | "follow"
  | "friend_request"
  | "friend_accept"
  | "post_like"
  | "post_comment";

/** Her seferinde ayrı bildirim üretilen tipler (yazılı içerik) */
const ALWAYS_NEW: NotificationType[] = ["reply", "post_comment"];

/**
 * Bildirim oluşturur. Kendi eylemin için bildirim üretilmez ve aynı kişinin
 * aynı hedefteki okunmamış bildirimi tekrarlanmaz (beğen/geri al gürültüsü).
 */
export async function notify(params: {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  message: string;
  href?: string;
}) {
  if (params.actorId && params.actorId === params.userId) return;

  if (params.actorId && !ALWAYS_NEW.includes(params.type)) {
    const duplicate = await prisma.notification.findFirst({
      where: {
        userId: params.userId,
        actorId: params.actorId,
        type: params.type,
        href: params.href ?? null,
        isRead: false,
      },
      select: { id: true },
    });
    if (duplicate) return;
  }

  await prisma.notification
    .create({
      data: {
        userId: params.userId,
        actorId: params.actorId ?? null,
        type: params.type,
        message: params.message,
        href: params.href,
      },
    })
    .catch(() => {});
}

export { PUBLIC_USER_SELECT };
