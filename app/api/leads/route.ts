import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return { items, total: items.length };
  });
}

/** POST /api/leads - iletişim / danışmanlık talebi */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.name?.trim() || !b.email?.trim() || !b.message?.trim())
      return fail("name, email ve message zorunludur");

    const lead = await prisma.lead.create({
      data: {
        name: b.name.trim().slice(0, 60),
        email: b.email.trim().toLowerCase().slice(0, 120),
        phone: b.phone?.trim().slice(0, 24) || null,
        topic: b.topic || "genel",
        message: b.message.trim().slice(0, 2000),
      },
    });
    return ok({ lead, message: "Talebiniz alındı, en kısa sürede dönüş yapılacak." }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Talep kaydedilemedi", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id) return fail("id zorunludur");
    const lead = await prisma.lead.update({ where: { id }, data: { status } });
    return ok({ lead });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("id zorunludur");
    await prisma.lead.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
