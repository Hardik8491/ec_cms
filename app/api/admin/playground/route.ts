import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const id = "cmb0ilz4t00168z48r7ewenot";
    const agencies = await prisma.agency.findMany({   });

    return NextResponse.json({ agencies }, { status: 200 });
  } catch (error) {
    console.error("Fetch Agencies Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
