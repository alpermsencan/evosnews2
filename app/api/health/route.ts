import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articleCount = await prisma.article.count();
    const vehicleCount = await prisma.vehicle.count();
    return NextResponse.json({
      status: "ok",
      version: "2026.10.02-v2",
      articles: articleCount,
      vehicles: vehicleCount,
      dbConnected: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        version: "2026.10.02-v2",
        message: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
