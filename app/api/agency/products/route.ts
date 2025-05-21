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

    const products = await db.product.findMany({
      where: { agencyId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
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

    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock || 0,
        image: data.image,
        isActive: data.isActive || true,
        categoryId: data.categoryId,
        agencyId,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
