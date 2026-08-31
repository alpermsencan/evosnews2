import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { touchVehicles } from "@/lib/revalidate";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

// GET: Fetch all images for a vehicle
export async function GET(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);
  const { id } = await params;

  try {
    const images = await prisma.vehicleImage.findMany({
      where: { vehicleId: id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ images });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Görseller alınamadı", 500);
  }
}

// POST: Add a new image manually
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);
  const { id } = await params;

  try {
    const { url, cloudinaryPublicId, type, isPrimary } = await req.json();

    if (!url) return fail("url parametresi gereklidir", 400);

    const extId = `manual-${Date.now()}`;

    // If isPrimary is true, unset other primaries
    if (isPrimary) {
      await prisma.vehicleImage.updateMany({
        where: { vehicleId: id },
        data: { isPrimary: false },
      });
      // Also update the main vehicle cover image URL
      await prisma.vehicle.update({
        where: { id },
        data: { image: url },
      });
    }

    const image = await prisma.vehicleImage.create({
      data: {
        vehicleId: id,
        url,
        cloudinaryPublicId: cloudinaryPublicId || "",
        type: type || "gallery",
        source: "admin",
        sourceUrl: url,
        externalId: extId,
        isPrimary: !!isPrimary,
      },
    });

    touchVehicles();
    return ok({ image }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Görsel eklenemedi", 500);
  }
}

// PUT: Update an image's metadata (primary, type, etc.)
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);
  const { id } = await params;

  try {
    const { imageId, type, isPrimary } = await req.json();

    if (!imageId) return fail("imageId gereklidir", 400);

    const targetImg = await prisma.vehicleImage.findUnique({ where: { id: imageId } });
    if (!targetImg || targetImg.vehicleId !== id) {
      return fail("Görsel bulunamadı", 404);
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (isPrimary !== undefined) updateData.isPrimary = !!isPrimary;

    if (isPrimary) {
      // Unset all other primaries for this vehicle
      await prisma.vehicleImage.updateMany({
        where: { vehicleId: id },
        data: { isPrimary: false },
      });
      // Update the main vehicle cover image URL
      await prisma.vehicle.update({
        where: { id },
        data: { image: targetImg.url },
      });
    }

    const image = await prisma.vehicleImage.update({
      where: { id: imageId },
      data: updateData,
    });

    touchVehicles();
    return ok({ image });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

// DELETE: Remove an image relation from database (without deleting file from Cloudinary)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest(req))) return fail("Yetkisiz işlem", 401);
  const { id } = await params;
  const imageId = req.nextUrl.searchParams.get("imageId");

  if (!imageId) return fail("imageId parametresi gereklidir", 400);

  try {
    const targetImg = await prisma.vehicleImage.findUnique({ where: { id: imageId } });
    if (!targetImg || targetImg.vehicleId !== id) {
      return fail("Görsel bulunamadı", 404);
    }

    await prisma.vehicleImage.delete({ where: { id: imageId } });

    // If we deleted the primary image, let's make the first remaining active one primary
    if (targetImg.isPrimary) {
      const remaining = await prisma.vehicleImage.findMany({
        where: { vehicleId: id, NOT: { type: "ignored" } },
        orderBy: { createdAt: "asc" },
      });
      if (remaining.length > 0) {
        await prisma.vehicleImage.update({
          where: { id: remaining[0].id },
          data: { isPrimary: true },
        });
        await prisma.vehicle.update({
          where: { id },
          data: { image: remaining[0].url },
        });
      } else {
        await prisma.vehicle.update({
          where: { id },
          data: { image: "/arac-placeholder.svg" },
        });
      }
    }

    touchVehicles();
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
