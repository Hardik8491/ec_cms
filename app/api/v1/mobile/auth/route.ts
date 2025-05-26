import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// POST /api/v1/mobile/auth - Mobile app authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.NEXTAUTH_SECRET || "",
      { expiresIn: "30d" },
    )

    // Generate refresh token
    const refreshToken = jwt.sign({ id: user.id }, process.env.NEXTAUTH_SECRET || "", { expiresIn: "90d" })

    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "login",
        resource: "mobile_app",
        ipAddress: request.headers.get("x-forwarded-for") || "",
        userAgent: request.headers.get("user-agent") || "",
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      token,
      refreshToken,
    })
  } catch (error) {
    console.error("Error authenticating mobile user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
