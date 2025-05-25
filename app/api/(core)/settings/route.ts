import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        preferences: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          name: user.name || "",
          email: user.email || "",
          avatar: user.image,
          phone: user.phone,
          timezone: user.timezone || "UTC",
          language: user.language || "en",
        },
        security: {
          twoFactorEnabled: user.twoFactorEnabled || false,
          lastPasswordChange: user.lastPasswordChange?.toISOString() || "",
          activeSessions: 1, // This would come from session store
        },
        notifications: {
          email: user.preferences?.emailNotifications ?? true,
          push: user.preferences?.pushNotifications ?? true,
          sms: user.preferences?.smsNotifications ?? false,
          marketing: user.preferences?.marketingEmails ?? false,
        },
        preferences: {
          theme: user.preferences?.theme || "light",
          currency: user.preferences?.currency || "USD",
          dateFormat: user.preferences?.dateFormat || "MM/DD/YYYY",
          timeFormat: user.preferences?.timeFormat || "12h",
        },
      },
    })
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
