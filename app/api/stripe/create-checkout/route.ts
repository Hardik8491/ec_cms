import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import stripe from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, items, orderId, agencyId, plan, successUrl, cancelUrl } = await request.json()

    if (!type || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type === "subscription") {
      if (!agencyId || !plan) {
        return NextResponse.json({ error: "Agency ID and plan are required for subscriptions" }, { status: 400 })
      }

      // Check if agency exists
      const agency = await prisma.agency.findUnique({
        where: { id: agencyId },
      })

      if (!agency) {
        return NextResponse.json({ error: "Agency not found" }, { status: 404 })
      }

      // Check if user has access to this agency
      if (session.role !== "SUPER_ADMIN" && agency.id !== session.agencyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Get price ID based on plan
      let priceId: string

      switch (plan) {
        case "BASIC":
          priceId = process.env.STRIPE_BASIC_PRICE_ID as string
          break
        case "STANDARD":
          priceId = process.env.STRIPE_STANDARD_PRICE_ID as string
          break
        case "PREMIUM":
          priceId = process.env.STRIPE_PREMIUM_PRICE_ID as string
          break
        default:
          return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
      }

      // Create checkout session for subscription
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          type: "subscription",
          agencyId,
          plan,
        },
      })

      return NextResponse.json({ url: checkoutSession.url })
    } else if (type === "order") {
      if (!orderId || !items || !items.length) {
        return NextResponse.json({ error: "Order ID and items are required for orders" }, { status: 400 })
      }

      // Check if order exists
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          store: true,
        },
      })

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      // Check if user has access to this order's store
      if (session.role !== "SUPER_ADMIN" && order.store.agencyId !== session.agencyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Create checkout session for order
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: order.store.currency.toLowerCase(),
            product_data: {
              name: item.name,
              images: item.images || [],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          type: "order",
          orderId,
        },
      })

      return NextResponse.json({ url: checkoutSession.url })
    } else {
      return NextResponse.json({ error: "Invalid checkout type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Create checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
