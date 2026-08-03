import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, handle, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const items = await prisma.ticker.findMany({ orderBy: { order: "asc" } });
    return { items };
  });
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.label || !b.value) return fail("label ve value zorunludur");
    const ticker = await prisma.ticker.create({
      data: {
        label: b.label,
        value: String(b.value),
        unit: b.unit || null,
        changePct: Number(b.changePct) || 0,
        order: Number(b.order) || 99,
      },
    });
    return ok({ ticker }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Eklenemedi", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b.id) return fail("id zorunludur");
    const ticker = await prisma.ticker.update({
      where: { id: b.id },
      data: {
        ...(b.label !== undefined && { label: b.label }),
        ...(b.value !== undefined && { value: String(b.value) }),
        ...(b.unit !== undefined && { unit: b.unit }),
        ...(b.changePct !== undefined && { changePct: Number(b.changePct) }),
        ...(b.order !== undefined && { order: Number(b.order) }),
      },
    });
    return ok({ ticker });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Güncellenemedi", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return fail("id zorunludur");
    await prisma.ticker.delete({ where: { id } });
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Silinemedi", 500);
  }
}
