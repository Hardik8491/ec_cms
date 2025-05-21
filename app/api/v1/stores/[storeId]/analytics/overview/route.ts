import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateApiKey } from "@/lib/api-auth"

export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    // Validate API key from request headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey, params.storeId)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month"

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "day":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate = new Date(now)
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
    }

    // Get analytics data
    const [totalOrders, totalRevenue, ordersByStatus, productCount, customerCount] = await Promise.all([
      prisma.order.count({
        where: {
          storeId: params.storeId,
          createdAt: {
            gte: startDate,
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          storeId: params.storeId,
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          total: true,
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: {
          storeId: params.storeId,
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
      }),
      prisma.product.count({
        where: {
          storeId: params.storeId,
        },
      }),
      prisma.customer.count({
        where: {
          storeId: params.storeId,
        },
      }),
    ])

    // Format order status counts
    const orderStatusCounts = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    }

    ordersByStatus.forEach((status) => {
      orderStatusCounts[status.status] = status._count
    })

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        storeId: params.storeId,
        endpoint: `/api/v1/stores/${params.storeId}/analytics/overview`,
        method: "GET",
        apiKeyId: validApiKey.id,
      },
    })

    return NextResponse.json({
      overview: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        orderStatusCounts,
        productCount,
        customerCount,
        period,
      },
    })
  } catch (error) {
    console.error("Get analytics overview error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
