import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { syncBrandVehicles } from "@/lib/vehicle-sync";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;

  return req.nextUrl.searchParams.get("key") === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return fail("Yetkisiz", 401);
  }

  try {
    const result = await syncBrandVehicles("kia-official", "MANUAL");
    return ok(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync failed";
    return fail(msg, 500);
  }
}
