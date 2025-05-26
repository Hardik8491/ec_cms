import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { format, subDays } from "date-fns"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get counts
    const usersCount = await prisma.user.count()
    const storesCount = await prisma.store.count()
    const productsCount = await prisma.product.count()
    const ordersCount = await prisma.order.count()

    // Get total revenue
    const revenue = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        status: {
          in: ["completed", "processing"],
        },
      },
    })

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        customer: true,
      },
    })

    // Get sales data for the last 30 days
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)

    const salesByDay = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        status: {
          in: ["completed", "processing"],
        },
      },
      _sum: {
        total: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Format sales data for chart
    const salesData = [
      ["Date", "Revenue"],
      ...salesByDay.map((day) => [format(day.createdAt, "MMM dd"), day._sum.total || 0]),
    ]

    return NextResponse.json({
      users: usersCount,
      stores: storesCount,
      products: productsCount,
      orders: ordersCount,
      revenue: revenue._sum.total || 0,
      recentOrders,
      salesData,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
