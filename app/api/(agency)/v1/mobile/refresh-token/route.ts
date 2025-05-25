import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// POST /api/v1/mobile/refresh-token - Refresh mobile app token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Verify refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.NEXTAUTH_SECRET || "")
    } catch (error) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate new JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "",
      { expiresIn: "30d" },
    )

    // Generate new refresh token
    const newRefreshToken = jwt.sign({ id: user.id }, process.env.NEXTAUTH_SECRET || "", { expiresIn: "90d" })

    return NextResponse.json({
      token,
      refreshToken: newRefreshToken,
    })
  } catch (error) {
    console.error("Error refreshing token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
