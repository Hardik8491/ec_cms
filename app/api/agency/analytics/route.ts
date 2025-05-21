import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user.role !== "agency" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agency ID from session or subdomain
    let agencyId = session.user.agencyId

    // If admin is accessing via subdomain
    if (session.user.role === "admin") {
      const subdomain = req.headers.get("x-subdomain")
      if (subdomain) {
        const agency = await db.agency.findUnique({
          where: { subdomain },
        })
        if (agency) {
          agencyId = agency.id
        }
      }
    }

    if (!agencyId) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Get date range from query params
    const url = new URL(req.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")

    // Build date filter
    const dateFilter: any = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    // Get analytics data
    const analytics = await db.analytics.findMany({
      where: {
        agencyId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
      },
      orderBy: { date: "desc" },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    })

    // Calculate summary metrics
    const totalPageViews = analytics.reduce((sum, item) => sum + item.pageViews, 0)
    const totalSales = analytics.reduce((sum, item) => sum + item.sales, 0)
    const totalRevenue = analytics.reduce((sum, item) => sum + item.revenue, 0)

    // Group by date for chart data
    const chartData = analytics.reduce((acc, item) => {
      const date = item.date.toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          pageViews: 0,
          sales: 0,
          revenue: 0,
        }
      }
      acc[date].pageViews += item.pageViews
      acc[date].sales += item.sales
      acc[date].revenue += item.revenue
      return acc
    }, {})

    // Get top products
    const topProducts = await db.product.findMany({
      where: { agencyId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
      take: 5,
    })

    // Get recent orders
    const recentOrders = await db.order.findMany({
      where: { agencyId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    return NextResponse.json({
      analytics,
      summary: {
        totalPageViews,
        totalSales,
        totalRevenue,
      },
      chartData: Object.values(chartData),
      topProducts,
      recentOrders,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()
    const subdomain = req.headers.get("x-subdomain")

    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 })
    }

    const agency = await db.agency.findUnique({
      where: { subdomain },
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Create analytics entry
    const analytics = await db.analytics.create({
      data: {
        pageViews: data.pageViews || 1,
        sales: data.sales || 0,
        revenue: data.revenue || 0,
        agencyId: agency.id,
        userId: session.user.id,
        productId: data.productId,
      },
    })

    return NextResponse.json(analytics, { status: 201 })
  } catch (error) {
    console.error("Error creating analytics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
