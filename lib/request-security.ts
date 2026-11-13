import { NextResponse, type NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
/** Process-local protection; multi-replica deployments also need an edge/WAF limit. */
export function rateLimit(key: string, limit = 10, windowMs = 15 * 60_000) {
  key = key.slice(0, 256);
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= 10_000) {
      for (const [id, value] of buckets) if (value.resetAt <= now) buckets.delete(id);
      if (buckets.size >= 10_000) buckets.delete(buckets.keys().next().value!);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count++;
  if (bucket.count <= limit) return null;
  return NextResponse.json({ error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, {
    status: 429, headers: { "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)) },
  });
}
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const allowed = [new URL(req.url).origin];
    if (process.env.NEXT_PUBLIC_SITE_URL) allowed.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
    return allowed.includes(new URL(origin).origin);
  } catch { return false; }
}
