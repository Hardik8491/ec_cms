import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { createPaymentIntent } from "@/lib/payment/stripe"
import { validateApiKey } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Validate API key
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

    // Get request body
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.storeId !== storeId) {
      return NextResponse.json({ error: "Order does not belong to this store" }, { status: 403 })
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(order)

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: "stripe",
        // Store the payment intent ID in a notes field or create a new field
        notes: JSON.stringify({ paymentIntentId: paymentIntent.paymentIntentId }),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: validApiKey.userId,
        action: "create",
        resource: "payment_intent",
        resourceId: paymentIntent.paymentIntentId,
        details: { orderId, storeId },
        ipAddress: request.headers.get("x-forwarded-for") || "",
        userAgent: request.headers.get("user-agent") || "",
      },
    })

    return NextResponse.json(paymentIntent)
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
