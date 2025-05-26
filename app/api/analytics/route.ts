import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { subDays, format } from "date-fns"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const storeId = searchParams.get("storeId")

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    switch (range) {
      case "7d":
        startDate = subDays(now, 7)
        previousStartDate = subDays(now, 14)
        break
      case "30d":
        startDate = subDays(now, 30)
        previousStartDate = subDays(now, 60)
        break
      case "90d":
        startDate = subDays(now, 90)
        previousStartDate = subDays(now, 180)
        break
      case "1y":
        startDate = subDays(now, 365)
        previousStartDate = subDays(now, 730)
        break
      default:
        startDate = subDays(now, 30)
        previousStartDate = subDays(now, 60)
    }

    // Build where clause based on user role and store filter
    const whereClause: any = {}

    if (session.user.role === "USER" && !storeId) {
      // Regular users can only see their own stores
      const userStores = await prisma.store.findMany({
        where: { userId: session.user.id },
        select: { id: true },
      })
      whereClause.storeId = { in: userStores.map((s) => s.id) }
    } else if (storeId) {
      whereClause.storeId = storeId
    }

    // Get current period metrics
    const currentRevenue = await prisma.order.aggregate({
      where: {
        ...whereClause,
        status: "COMPLETED",
        createdAt: { gte: startDate, lte: now },
      },
      _sum: { total: true },
    })

    const previousRevenue = await prisma.order.aggregate({
      where: {
        ...whereClause,
        status: "COMPLETED",
        createdAt: { gte: previousStartDate, lt: startDate },
      },
      _sum: { total: true },
    })

    const currentOrders = await prisma.order.count({
      where: {
        ...whereClause,
        createdAt: { gte: startDate, lte: now },
      },
    })

    const previousOrders = await prisma.order.count({
      where: {
        ...whereClause,
        createdAt: { gte: previousStartDate, lt: startDate },
      },
    })

    const currentCustomers = await prisma.customer.count({
      where: {
        ...whereClause,
        createdAt: { gte: startDate, lte: now },
      },
    })

    const previousCustomers = await prisma.customer.count({
      where: {
        ...whereClause,
        createdAt: { gte: previousStartDate, lt: startDate },
      },
    })

    const totalProducts = await prisma.product.count({
      where: whereClause,
    })

    // Calculate growth rates
    const revenueGrowth = previousRevenue._sum.total
      ? (((currentRevenue._sum.total || 0) - (previousRevenue._sum.total || 0)) / (previousRevenue._sum.total || 1)) *
        100
      : 0

    const ordersGrowth = previousOrders ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0

    const customersGrowth = previousCustomers ? ((currentCustomers - previousCustomers) / previousCustomers) * 100 : 0

    // Get daily revenue data for charts
    const dailyRevenue = (await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as orders
      FROM orders 
      WHERE status = 'COMPLETED'
        AND created_at >= ${startDate}
        AND created_at <= ${now}
        ${storeId ? `AND store_id = '${storeId}'` : ""}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `) as Array<{ date: Date; revenue: number; orders: number }>

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          ...whereClause,
          status: "COMPLETED",
          createdAt: { gte: startDate, lte: now },
        },
      },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    })

    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProducts.map((p) => p.productId) } },
      select: { id: true, name: true },
    })

    const topProductsWithDetails = topProducts.map((item) => {
      const product = productDetails.find((p) => p.id === item.productId)
      return {
        name: product?.name || "Unknown Product",
        revenue: Number(item._sum.total || 0),
        quantity: Number(item._sum.quantity || 0),
      }
    })

    // Mock data for customer segments and traffic sources
    const customerSegments = [
      { segment: "High Value", count: Math.floor(currentCustomers * 0.2), value: 1000 },
      { segment: "Medium Value", count: Math.floor(currentCustomers * 0.3), value: 500 },
      { segment: "Low Value", count: Math.floor(currentCustomers * 0.5), value: 100 },
    ]

    const trafficSources = [
      { source: "Direct", visitors: 1500, conversions: 45 },
      { source: "Google", visitors: 2300, conversions: 78 },
      { source: "Social Media", visitors: 890, conversions: 23 },
      { source: "Email", visitors: 650, conversions: 32 },
    ]

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          revenue: {
            current: Number(currentRevenue._sum.total || 0),
            previous: Number(previousRevenue._sum.total || 0),
            growth: revenueGrowth,
          },
          orders: {
            current: currentOrders,
            previous: previousOrders,
            growth: ordersGrowth,
          },
          customers: {
            current: currentCustomers,
            previous: previousCustomers,
            growth: customersGrowth,
          },
          products: {
            current: totalProducts,
            previous: totalProducts,
            growth: 0,
          },
          conversionRate: currentOrders > 0 ? (currentOrders / (currentOrders * 10)) * 100 : 0,
          avgOrderValue: currentOrders > 0 ? (currentRevenue._sum.total || 0) / currentOrders : 0,
        },
        charts: {
          revenue: dailyRevenue.map((item) => ({
            date: format(item.date, "MMM dd"),
            revenue: Number(item.revenue),
            orders: Number(item.orders),
          })),
          topProducts: topProductsWithDetails,
          customerSegments,
          trafficSources,
        },
      },
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
