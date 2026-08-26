import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/ocpi/versions
 * OCPI Handshake - Desteklenen versiyonları listeler.
 */
export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evotopilot.com";
  
  return NextResponse.json({
    status_code: 1000,
    status_message: "Success",
    timestamp: new Date().toISOString(),
    data: [
      {
        version: "2.2.1",
        url: `${baseUrl}/api/ocpi/2.2.1`
      }
    ]
  });
}
