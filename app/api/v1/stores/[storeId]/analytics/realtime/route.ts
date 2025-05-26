import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { prisma } from "@/lib/db"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      todayOrders,
      yesterdayOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      totalCustomers,
      totalProducts,
      recentOrders,
      topProducts,
      lowStockProducts,
    ] = await Promise.all([
      // Today's orders
      prisma.order.findMany({
        where: {
          storeId: params.storeId,
          createdAt: { gte: today },
        },
        include: {
          customer: true,
          items: true,
        },
      }),
      // Yesterday's orders
      prisma.order.findMany({
        where: {
          storeId: params.storeId,
          createdAt: { gte: yesterday, lt: today },
        },
      }),
      // This month's revenue
      prisma.order.aggregate({
        where: {
          storeId: params.storeId,
          createdAt: { gte: thisMonth },
          status: { in: ["completed", "processing"] },
        },
        _sum: { total: true },
      }),
      // Last month's revenue
      prisma.order.aggregate({
        where: {
          storeId: params.storeId,
          createdAt: { gte: lastMonth, lt: thisMonth },
          status: { in: ["completed", "processing"] },
        },
        _sum: { total: true },
      }),
      // Total customers
      prisma.customer.count({
        where: { storeId: params.storeId },
      }),
      // Total products
      prisma.product.count({
        where: { storeId: params.storeId, isActive: true },
      }),
      // Recent orders
      prisma.order.findMany({
        where: { storeId: params.storeId },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      // Top products
      // prisma.orderItem.groupBy({
      //   by: ["productId"],
      //   where: {
      //     order: {
      //       storeId: params.storeId,
      //       createdAt: { gte: thisMonth },
      //     },
      //   },
      //   _sum: { quantity: true },
      //   _count: { productId: true },
      //   orderBy: { _sum: { quantity: "desc" } },
      //   take: 5,
      // }),
      // Low stock products
      prisma.product.findMany({
        where: {
          storeId: params.storeId,
          quantity: { lte: 10 },
          isActive: true,
        },
        orderBy: { quantity: "asc" },
        take: 10,
      }),
    ])

    // Calculate metrics
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0)
    const revenueGrowth = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
// todo : add realtiem database
    const monthlyGrowth = 0
      // lastMonthRevenue._sum.total > 0
      //   ? ((thisMonthRevenue._sum.total - lastMonthRevenue._sum.total) / lastMonthRevenue._sum.total) * 100
      //   : 0

    // Get top products with details
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        })
        return {
          ...product,
          soldQuantity: item._sum.quantity,
          orderCount: item._count.productId,
        }
      }),
    )

    return NextResponse.json({
      overview: {
        todayOrders: todayOrders.length,
        todayRevenue,
        revenueGrowth,
        monthlyRevenue: thisMonthRevenue._sum.total || 0,
        monthlyGrowth,
        totalCustomers,
        totalProducts,
      },
      recentOrders,
      topProducts: topProductsWithDetails,
      lowStockProducts,
      alerts: {
        lowStock: lowStockProducts.length,
        pendingOrders: todayOrders.filter((order) => order.status === "pending").length,
      },
    })
  } catch (error) {
    console.error("Error fetching real-time analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
