import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"
import { AIService } from "@/lib/ai"

const prisma = new PrismaClient()

// POST /api/v1/stores/:storeId/ai/analytics/query
export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Validate API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Get comprehensive analytics data
    const analyticsData = await this.getAnalyticsData(storeId)

    // Get AI response
    const aiResponse = await AIService.queryAnalytics(query, analyticsData)

    // Log AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: validApiKey.userId,
        type: "query",
        input: query,
        output: aiResponse,
        model: "gpt-4",
        tokens: 400,
        cost: 0.01,
      },
    })

    return NextResponse.json({
      query,
      response: aiResponse,
      dataSnapshot: {
        totalRevenue: analyticsData.totalRevenue,
        totalOrders: analyticsData.totalOrders,
        totalCustomers: analyticsData.totalCustomers,
        timeRange: analyticsData.timeRange,
      },
    })
  } catch (error) {
    console.error("AI Analytics Query Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getAnalyticsData(storeId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [recentOrders, recentAnalytics, topProducts, customerSegments] = await Promise.all([
    prisma.order.findMany({
      where: {
        storeId,
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    }),
    prisma.analytics.findMany({
      where: {
        storeId,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "desc" },
    }),
    prisma.product.findMany({
      where: { storeId },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
      take: 10,
    }),
    prisma.customer.groupBy({
      by: ["segment"],
      where: { storeId },
      _count: true,
    }),
  ])

  return {
    totalRevenue: recentOrders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: recentOrders.length,
    totalCustomers: new Set(recentOrders.map((order) => order.customerId)).size,
    avgOrderValue:
      recentOrders.length > 0 ? recentOrders.reduce((sum, order) => sum + order.total, 0) / recentOrders.length : 0,
    topProducts: topProducts
      .map((product) => ({
        name: product.name,
        sales: product.orderItems.length,
        revenue: product.orderItems.reduce((sum, item) => sum + item.total, 0),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    customerSegments,
    dailyAnalytics: recentAnalytics,
    timeRange: "Last 30 days",
  }
}
