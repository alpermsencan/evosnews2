import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { getRequestUser } from "@/lib/auth";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin-auth";
import { recalcVoltScore } from "@/lib/listings";
import { touchListings } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** İlanı düzenleme/silme yetkisi: sahibi ya da yönetici. */
async function authorize(req: NextRequest, listingId: string) {
  const isAdmin = await isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value);
  if (isAdmin) return { ok: true, isAdmin: true as const };

  const viewer = await getRequestUser(req);
  if (!viewer) return { ok: false, isAdmin: false as const };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { userId: true },
  });
  return { ok: !!listing && listing.userId === viewer.id, isAdmin: false as const };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { batteryReport: true, vehicle: true },
  });
  if (!listing) return fail("İlan bulunamadı", 404);
  return ok({ listing });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const auth = await authorize(req, id);
    if (!auth.ok) return fail("Yetkisiz", 401);

    const b = await req.json();
    const data: Record<string, unknown> = {};

    for (const key of ["title", "brand", "model", "city", "color", "damage", "description", "image", "sellerName", "sellerType"]) {
      if (b[key] !== undefined) data[key] = b[key];
    }
    for (const key of ["price", "km", "year", "rangeKm", "batteryHealth", "warrantyMonthsLeft", "realRangeKm"]) {
      if (b[key] === undefined) continue;
      const n = Number(b[key]);
      data[key] = b[key] === "" || b[key] === null || !Number.isFinite(n) ? null : Math.round(n);
    }
    for (const key of ["serviceHistory", "fastChargeHabit", "condition"]) {
      if (b[key] !== undefined) data[key] = b[key] || null;
    }
    if (b.images !== undefined) data.images = b.images;
    if (b.vehicleId !== undefined) data.vehicleId = b.vehicleId || null;

    // Yayın durumu ve sponsorlu vitrin ticari/moderasyon kararlarıdır;
    // ilan sahibi kendi ilanını yayına alamaz veya öne çıkaramaz.
    if (auth.isAdmin) {
      if (b.status !== undefined) data.status = b.status;
      if (b.isSponsored !== undefined) data.isSponsored = !!b.isSponsored;
    } else if (b.status === "SOLD") {
      // Tek istisna: satıcı kendi ilanını "satıldı" olarak kapatabilir.
      data.status = "SOLD";
    }

    const listing = await prisma.listing.update({ where: { id }, data });
    // Puan girdilerinden biri değişmiş olabilir; her düzenlemede tazelenir.
    await recalcVoltScore(listing.id);
    touchListings();

    return ok({ listing });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const auth = await authorize(req, id);
    if (!auth.ok) return fail("Yetkisiz", 401);

    await prisma.listing.delete({ where: { id } });
    touchListings();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
