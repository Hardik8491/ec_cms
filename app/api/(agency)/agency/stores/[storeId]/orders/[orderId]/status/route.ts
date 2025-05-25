import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Params {
  params: {
    storeId: string
    orderId: string
  }
}

// PATCH /api/agency/stores/:storeId/orders/:orderId/status
export async function PATCH(request: Request, { params }: Params) {
  try {
    const { storeId, orderId } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only agencies can access this endpoint
    if (session.user.role !== "agency") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    })

    if (!agency) {
      return NextResponse.json({ message: "Agency not found" }, { status: 404 })
    }

    // Check if store belongs to agency
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        agencyId: agency.id,
      },
    })

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 })
    }

    // Check if order exists and belongs to store
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        storeId,
      },
    })

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Get request body
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ message: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ["pending", "processing", "completed", "cancelled", "refunded"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    })

    // Create order tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId,
        status,
        notes: `Order status updated to ${status}`,
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
