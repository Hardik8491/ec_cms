import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

const prisma = new PrismaClient()

// GET /api/v1/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const unreadOnly = url.searchParams.get("unread") === "true"

    // Build where clause
    const where: any = { userId }

    if (unreadOnly) {
      where.isRead = false
    }

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.notification.count({ where })

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { ids, all } = body

    if (all) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: { userId },
        data: { isRead: true },
      })

      return NextResponse.json({ success: true })
    }

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Mark specific notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
