import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/v1/stores/:storeId/analytics - Get analytics for a store
export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Check API key from headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Check if API key has access to this store
    if (validApiKey.storeId && validApiKey.storeId !== storeId) {
      return NextResponse.json({ error: "Unauthorized access to this store" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const period = url.searchParams.get("period") || "month" // day, week, month, year
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // Calculate date range
    let start = new Date()
    let end = new Date()

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      switch (period) {
        case "day":
          start.setHours(0, 0, 0, 0)
          break
        case "week":
          start.setDate(start.getDate() - 7)
          break
        case "month":
          start.setMonth(start.getMonth() - 1)
          break
        case "year":
          start.setFullYear(start.getFullYear() - 1)
          break
      }
    }

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where: {
        storeId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Calculate summary
    const totalRevenue = analytics.reduce((sum, item) => sum + item.revenue, 0)
    const totalOrders = analytics.reduce((sum, item) => sum + item.orders, 0)
    const totalCustomers = analytics.reduce((sum, item) => sum + item.customers, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          storeId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    })

    // Get product details
    const productIds = topProducts.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    })

    // Combine product data
    const topProductsWithDetails = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        id: item.productId,
        name: product?.name || "Unknown Product",
        quantity: item._sum.quantity || 0,
        revenue: item._sum.total || 0,
      }
    })

    return NextResponse.json({
      period: {
        start,
        end,
      },
      summary: {
        revenue: totalRevenue,
        orders: totalOrders,
        customers: totalCustomers,
        averageOrderValue,
      },
      timeSeries: analytics,
      topProducts: topProductsWithDetails,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
