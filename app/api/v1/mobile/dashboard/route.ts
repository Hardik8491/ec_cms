import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient()

// GET /api/v1/mobile/dashboard - Mobile app dashboard data
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    //Tod:add function verfiyJWtToken(token)
    const decoded = "await verifyJwtToken(token)"

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    // todo:add user.id realtime database

    const userId =" decoded.id"

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stores: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        agency: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get store IDs
    const storeIds = user.stores.map((store) => store.id)

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        storeId: { in: storeIds },
      },
      include: {
        customer: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Get sales summary
    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))

    const todaySales = await prisma.order.aggregate({
      where: {
        storeId: { in: storeIds },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        paymentStatus: "paid",
      },
      _sum: {
        total: true,
      },
      _count: true,
    })

    // Get unread notifications count
    // const unreadNotifications = await prisma.notification.count({
    //   where: {
    //     userId,
    //     isRead: false,
    //   },
    // })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
      stores: user.stores,
      agency: user.agency,
      recentOrders,
      todaySales: {
        revenue: todaySales._sum.total || 0,
        count: todaySales._count || 0,
      },
      // unreadNotifications,
    })
  } catch (error) {
    console.error("Error fetching mobile dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
