import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
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

    // Get category filter from query params
    const url = new URL(req.url)
    const categorySlug = url.searchParams.get("category")
    const search = url.searchParams.get("search")

    // Build filter
    const filter: any = {
      agencyId: agency.id,
      isActive: true,
    }

    if (categorySlug) {
      const category = await db.category.findFirst({
        where: {
          agencyId: agency.id,
          slug: categorySlug,
        },
      })

      if (category) {
        filter.categoryId = category.id
      }
    }

    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await db.product.findMany({
      where: filter,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Track page view in analytics
    const session = await getServerSession(authOptions)
    if (session) {
      await db.analytics.create({
        data: {
          pageViews: 1,
          sales: 0,
          revenue: 0,
          agencyId: agency.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
