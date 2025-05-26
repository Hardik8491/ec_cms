import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Mock data - in real implementation, fetch from database
    const stats = {
      totalVendors: 45,
      activeVendors: 38,
      totalStores: 127,
      totalRevenue: 456789,
      commissionEarned: 45678,
      pendingApprovals: 7,
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Marketplace stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
