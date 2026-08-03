import { SignJWT, jwtVerify } from "jose";

/**
 * Oturum jetonu yardımcıları.
 * Sadece `jose` kullanır; edge runtime'da (middleware) da çalışır.
 */

export const SESSION_COOKIE = "evos_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value)
    throw new Error(
      "AUTH_SECRET tanımlı değil. .env dosyasına rastgele bir değer ekleyin."
    );
  return new TextEncoder().encode(value);
}

export type SessionPayload = {
  sub: string;
  username: string;
  name: string;
  role: string;
};

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      username: String(payload.username ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "uye"),
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};
