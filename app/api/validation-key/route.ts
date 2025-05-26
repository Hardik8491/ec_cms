// pages/api/validate-api-key.ts
import { prisma } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  const key = req.nextUrl.searchParams.get("key");


  if (!key) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key },
      include: { user: true, store: true },
    });

    if (!apiKey || !apiKey.isActive) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Optionally update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() },
    });

    return NextResponse.json({
      userId: apiKey.userId,
      storeId: apiKey.storeId,
      permissions: apiKey.permissions,
    });
  } catch (err) {
    console.error("API Key Validation Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
