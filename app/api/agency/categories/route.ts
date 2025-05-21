import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateSlug } from "@/lib/utils"

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

    const categories = await db.category.findMany({
      where: { agencyId },
      include: {
        _count: {
          select: {
            products: true,
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

export async function POST(req: NextRequest) {
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

    const data = await req.json()
    const slug = data.slug || generateSlug(data.name)

    // Check if slug is already taken for this agency
    const existingCategory = await db.category.findFirst({
      where: {
        agencyId,
        slug,
      },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category with this slug already exists" }, { status: 400 })
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        description: data.description,
        slug,
        agencyId,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
