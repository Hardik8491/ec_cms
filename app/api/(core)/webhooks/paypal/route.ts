import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyWebhookSignature } from "@/lib/payment/paypal"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const headers: Record<string, string> = {}

    // Extract PayPal webhook headers
    request.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith("paypal-")) {
        headers[key.toLowerCase()] = value
      }
    })

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(payload, headers)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    // Parse the payload
    const event = JSON.parse(payload)

    // Handle different event types
    switch (event.event_type) {
      case "PAYMENT.CAPTURE.COMPLETED":
        await handlePaymentCompleted(event)
        break
      case "PAYMENT.CAPTURE.DENIED":
        await handlePaymentDenied(event)
        break
      // Add more event handlers as needed
    }

    // Log the webhook event
    await prisma.auditLog.create({
      data: {
        userId: "system", // System-generated event
        action: "webhook",
        resource: "paypal",
        resourceId: event.id,
        details: { type: event.event_type },
        ipAddress: request.headers.get("x-forwarded-for") || "",
        userAgent: request.headers.get("user-agent") || "",
      },
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error handling PayPal webhook:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}

async function handlePaymentCompleted(event: any) {
  const prisma = new PrismaClient()

  // Extract order ID from the event
  const resource = event.resource
  const purchaseUnit = resource.purchase_units[0]
  const orderId = purchaseUnit.reference_id

  // Update order status in database
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "paid" },
  })
}

async function handlePaymentDenied(event: any) {
  const prisma = new PrismaClient()

  // Extract order ID from the event
  const resource = event.resource
  const purchaseUnit = resource.purchase_units[0]
  const orderId = purchaseUnit.reference_id

  // Update order status in database
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "failed" },
  })
}
