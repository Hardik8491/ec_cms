import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { subDays, subMonths, format, eachDayOfInterval, eachMonthOfInterval } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (
        session.user.role !== "AGENCY_OWNER" &&
        session.user.role !== "AGENCY_ADMIN" &&
        session.user.role !== "admin" &&
        session.user.role !== "agency" && 
        session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"
    const metric = searchParams.get("metric") || "revenue"

    // Calculate date range
    const now = new Date()
    let startDate: Date
    let interval: "day" | "month" = "day"

    switch (range) {
      case "7d":
        startDate = subDays(now, 7)
        interval = "day"
        break
      case "30d":
        startDate = subDays(now, 30)
        interval = "day"
        break
      case "90d":
        startDate = subDays(now, 90)
        interval = "day"
        break
      case "1y":
        startDate = subMonths(now, 12)
        interval = "month"
        break
      default:
        startDate = subDays(now, 30)
        interval = "day"
    }

    // Get agency ID
    let agencyId: string | null = null
    if (session.user.role === "AGENCY_OWNER" || session.user.role === "AGENCY_ADMIN") {
      const agency = await prisma.agency.findFirst({
        where: {
          OR: [{ ownerId: session.user.id }, { users: { some: { id: session.user.id } } }],
        },
      })
      agencyId = agency?.id || null
    }

    const storeWhereClause = agencyId ? { agencyId } : {}

    // Generate date intervals
    const dateIntervals =
      interval === "day"
        ? eachDayOfInterval({ start: startDate, end: now })
        : eachMonthOfInterval({ start: startDate, end: now })

    // Get analytics data based on metric
    let analyticsData: Array<{ date: string; value: number }> = []

    switch (metric) {
      case "revenue":
        const revenueData = (await prisma.$queryRaw`
          SELECT 
            ${interval === "day" ? "DATE(o.created_at)" : "DATE_TRUNC('month', o.created_at)"} as date,
            SUM(o.total) as value
          FROM orders o
          INNER JOIN stores s ON o.store_id = s.id
          WHERE o.status = 'COMPLETED'
            AND o.created_at >= ${startDate}
            AND o.created_at <= ${now}
            ${agencyId ? `AND s.agency_id = '${agencyId}'` : ""}
          GROUP BY ${interval === "day" ? "DATE(o.created_at)" : "DATE_TRUNC('month', o.created_at)"}
          ORDER BY date ASC
        `) as Array<{ date: Date; value: number }>

        analyticsData = dateIntervals.map((date) => {
          const dateStr = interval === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM-01")

          const found = revenueData.find(
            (item) => format(new Date(item.date), interval === "day" ? "yyyy-MM-dd" : "yyyy-MM-01") === dateStr,
          )

          return {
            date: dateStr,
            value: found ? Number(found.value) : 0,
          }
        })
        break

      case "orders":
        const ordersData = (await prisma.$queryRaw`
          SELECT 
            ${interval === "day" ? "DATE(o.created_at)" : "DATE_TRUNC('month', o.created_at)"} as date,
            COUNT(*) as value
          FROM orders o
          INNER JOIN stores s ON o.store_id = s.id
          WHERE o.created_at >= ${startDate}
            AND o.created_at <= ${now}
            ${agencyId ? `AND s.agency_id = '${agencyId}'` : ""}
          GROUP BY ${interval === "day" ? "DATE(o.created_at)" : "DATE_TRUNC('month', o.created_at)"}
          ORDER BY date ASC
        `) as Array<{ date: Date; value: number }>

        analyticsData = dateIntervals.map((date) => {
          const dateStr = interval === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM-01")

          const found = ordersData.find(
            (item) => format(new Date(item.date), interval === "day" ? "yyyy-MM-dd" : "yyyy-MM-01") === dateStr,
          )

          return {
            date: dateStr,
            value: found ? Number(found.value) : 0,
          }
        })
        break

      case "customers":
        const customersData = (await prisma.$queryRaw`
          SELECT 
            ${interval === "day" ? "DATE(c.created_at)" : "DATE_TRUNC('month', c.created_at)"} as date,
            COUNT(*) as value
          FROM customers c
          INNER JOIN stores s ON c.store_id = s.id
          WHERE c.created_at >= ${startDate}
            AND c.created_at <= ${now}
            ${agencyId ? `AND s.agency_id = '${agencyId}'` : ""}
          GROUP BY ${interval === "day" ? "DATE(c.created_at)" : "DATE_TRUNC('month', c.created_at)"}
          ORDER BY date ASC
        `) as Array<{ date: Date; value: number }>

        analyticsData = dateIntervals.map((date) => {
          const dateStr = interval === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM-01")

          const found = customersData.find(
            (item) => format(new Date(item.date), interval === "day" ? "yyyy-MM-dd" : "yyyy-MM-01") === dateStr,
          )

          return {
            date: dateStr,
            value: found ? Number(found.value) : 0,
          }
        })
        break

      case "products":
        const productsData = (await prisma.$queryRaw`
          SELECT 
            ${interval === "day" ? "DATE(p.created_at)" : "DATE_TRUNC('month', p.created_at)"} as date,
            COUNT(*) as value
          FROM products p
          INNER JOIN stores s ON p.store_id = s.id
          WHERE p.created_at >= ${startDate}
            AND p.created_at <= ${now}
            ${agencyId ? `AND s.agency_id = '${agencyId}'` : ""}
          GROUP BY ${interval === "day" ? "DATE(p.created_at)" : "DATE_TRUNC('month', p.created_at)"}
          ORDER BY date ASC
        `) as Array<{ date: Date; value: number }>

        analyticsData = dateIntervals.map((date) => {
          const dateStr = interval === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM-01")

          const found = productsData.find(
            (item) => format(new Date(item.date), interval === "day" ? "yyyy-MM-dd" : "yyyy-MM-01") === dateStr,
          )

          return {
            date: dateStr,
            value: found ? Number(found.value) : 0,
          }
        })
        break
    }

    // Calculate growth rate
    const currentPeriodTotal = analyticsData.reduce((sum, item) => sum + item.value, 0)
    const previousPeriodData = await getPreviousPeriodData(metric, startDate, agencyId, interval)
    const previousPeriodTotal = previousPeriodData.reduce((sum, item) => sum + item.value, 0)

    const growthRate =
      previousPeriodTotal > 0 ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        metric,
        range,
        interval,
        data: analyticsData,
        summary: {
          total: currentPeriodTotal,
          average: analyticsData.length > 0 ? currentPeriodTotal / analyticsData.length : 0,
          growthRate,
          trend: growthRate > 0 ? "up" : growthRate < 0 ? "down" : "stable",
        },
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Agency analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getPreviousPeriodData(
  metric: string,
  currentStartDate: Date,
  agencyId: string | null,
  interval: "day" | "month",
): Promise<Array<{ date: string; value: number }>> {
  const periodLength =
    interval === "day"
      ? Math.ceil((new Date().getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24))
      : Math.ceil((new Date().getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30))

  const previousStartDate =
    interval === "day" ? subDays(currentStartDate, periodLength) : subMonths(currentStartDate, periodLength)

  const storeWhereClause = agencyId ? `AND s.agency_id = '${agencyId}'` : ""

  switch (metric) {
    case "revenue":
      const revenueData = (await prisma.$queryRaw`
        SELECT 
          ${interval === "day" ? "DATE(o.created_at)" : "DATE_TRUNC('month', o.created_at)"} as date,
          SUM(o.total) as value
        FROM orders o
        INNER JOIN stores s ON o.store_id = s.id
        WHERE o.status = 'COMPLETED'
          AND o.created_at >= ${previousStartDate}
          AND o.created_at < ${currentStartDate}
          ${storeWhereClause}
        GROUP BY ${interval === "day" ? "DATE(o.created_at)" : "DATE_TRUNC('month', o.created_at)"}
        ORDER BY date ASC
      `) as Array<{ date: Date; value: number }>

      return revenueData.map((item) => ({
        date: format(new Date(item.date), interval === "day" ? "yyyy-MM-dd" : "yyyy-MM-01"),
        value: Number(item.value),
      }))

    default:
      return []
  }
}
