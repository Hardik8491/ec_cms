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

    // Get status filter from query params
    const url = new URL(req.url)
    const status = url.searchParams.get("status")

    const orders = await db.order.findMany({
      where: {
        agencyId,
        ...(status ? { status } : {}),
      },
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
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
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

    // Validate order items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 })
    }

    // Get products and calculate total
    const productIds = data.items.map((item) => item.productId)
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        agencyId: agency.id,
      },
    })

    // Check if all products exist and belong to the agency
    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more products not found" }, { status: 400 })
    }

    // Calculate total
    let total = 0
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      const itemTotal = product.price * item.quantity
      total += itemTotal

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      }
    })

    // Create order
    const order = await db.order.create({
      data: {
        total,
        status: "pending",
        agencyId: agency.id,
        userId: session.user.id,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update product stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)
      await db.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock - item.quantity,
        },
      })
    }

    // Create analytics entry
    await db.analytics.create({
      data: {
        pageViews: 0,
        sales: 1,
        revenue: total,
        agencyId: agency.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
