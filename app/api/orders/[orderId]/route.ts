import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = params

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        store: {
          select: {
            name: true,
            id: true,
            agencyId: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                id: true,
                images: true,
              },
            },
          },
        },
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user has access to this order's store
    if (session.role !== "SUPER_ADMIN" && order.store.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: {
            agencyId: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if user has access to this order's store
    if (session.role !== "SUPER_ADMIN" && order.store.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    return NextResponse.json({ order: updatedOrder })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
