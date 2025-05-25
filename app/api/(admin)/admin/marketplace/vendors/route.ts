import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock data - in real implementation, fetch from database
    const vendors = [
      {
        id: "1",
        name: "TechGear Store",
        email: "vendor@techgear.com",
        status: "active" as const,
        storeCount: 3,
        revenue: 45230,
        commission: 4523,
        joinedDate: "2024-01-15",
      },
      {
        id: "2",
        name: "Fashion Hub",
        email: "contact@fashionhub.com",
        status: "active" as const,
        storeCount: 2,
        revenue: 32100,
        commission: 3210,
        joinedDate: "2024-02-20",
      },
      {
        id: "3",
        name: "Home Essentials",
        email: "info@homeessentials.com",
        status: "pending" as const,
        storeCount: 1,
        revenue: 0,
        commission: 0,
        joinedDate: "2024-03-10",
      },
    ]

    return NextResponse.json({
      success: true,
      data: vendors,
    })
  } catch (error) {
    console.error("Marketplace vendors API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
