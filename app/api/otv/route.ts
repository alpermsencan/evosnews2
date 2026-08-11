import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";
import { calcOtv } from "@/lib/utils";
import { touchOtv } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await prisma.otvBracket.findMany({ orderBy: { order: "asc" } });
    return { items };
  });
}

/** POST /api/otv -> { basePrice, motorKw } => ÖTV + KDV hesabı */
export async function POST(req: NextRequest) {
  try {
    const { basePrice, motorKw } = await req.json();
    const base = Number(basePrice);
    const kw = Number(motorKw);
    if (!Number.isFinite(base) || base <= 0)
      return fail("Geçerli bir matrah (basePrice) girin");
    if (!Number.isFinite(kw) || kw <= 0)
      return fail("Geçerli bir motor gücü (motorKw) girin");

    const result = calcOtv(base, kw);
    const bracket = await prisma.otvBracket.findFirst({
      where: { rate: result.rate },
    });

    touchOtv();
    return ok({ ...result, bracket });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Hesaplanamadı", 500);
  }
}
