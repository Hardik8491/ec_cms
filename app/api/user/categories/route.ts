import { type NextRequest, NextResponse } from "next/server"
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

    const categories = await db.category.findMany({
      where: { agencyId: agency.id },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
