import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const clientToken = req.headers.get("authorization")?.match(/^Token ([^\s]+)$/)?.[1];
  if (!clientToken || clientToken.length > 512) return NextResponse.json({ status_code: 2001, status_message: "Unauthorized" }, { status: 401 });
  try {
    // Only administrator-provisioned bootstrap tokens may establish trust.
    const approved = await prisma.ocpiToken.findUnique({ where: { token: clientToken, version: 2 } });
    if (!approved?.isActive) return NextResponse.json({ status_code: 2001, status_message: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    if (typeof body.token !== "string" || body.token.length < 16 || body.token.length > 512) return NextResponse.json({ status_code: 2002, status_message: "Invalid credentials" }, { status: 400 });
    const roles = Array.isArray(body.roles) ? body.roles : [body];
    if (!roles.some((role: { country_code?: string; party_id?: string }) => role.country_code === approved.countryCode && role.party_id === approved.partyId)) {
      return NextResponse.json({ status_code: 2001, status_message: "Party mismatch" }, { status: 403 });
    }
    const token = randomBytes(32).toString("hex");
    await prisma.ocpiToken.update({ where: { id: approved.id }, data: { token } });
    return NextResponse.json({ status_code: 1000, status_message: "Success", timestamp: new Date().toISOString(), data: {
      token, url: `${siteUrl()}/api/ocpi/2.2.1`, roles: [{ role: "EMSP", party_id: "EVS", country_code: "TR", business_details: { name: "e-aracım", website: siteUrl() } }],
    } }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ status_code: 3000, status_message: "Request failed" }, { status: 500 }); }
}
