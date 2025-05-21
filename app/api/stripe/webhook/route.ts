import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import type Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import stripe from "@/lib/stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      // Payment is successful and the subscription is created
      if (session.metadata?.type === "subscription") {
        await handleSubscriptionCreated(session)
      } else if (session.metadata?.type === "order") {
        await handleOrderPayment(session)
      }
      break
    case "invoice.payment_succeeded":
      // Subscription was renewed
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        await handleSubscriptionRenewed(invoice)
      }
      break
    case "customer.subscription.deleted":
      // Subscription was canceled
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCanceled(subscription)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  try {
    const agencyId = session.metadata?.agencyId

    if (!agencyId) {
      console.error("No agency ID in session metadata")
      return
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // Create or update subscription in database
    await prisma.subscription.upsert({
      where: { agencyId },
      update: {
        status: "ACTIVE",
        plan: session.metadata?.plan as any,
        priceId: subscription.items.data[0].price.id,
        customerId: session.customer as string,
        subscriptionId: subscription.id,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
      },
      create: {
        agency: { connect: { id: agencyId } },
        status: "ACTIVE",
        plan: session.metadata?.plan as any,
        priceId: subscription.items.data[0].price.id,
        customerId: session.customer as string,
        subscriptionId: subscription.id,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
      },
    })

    console.log(`Subscription created for agency ${agencyId}`)
  } catch (error) {
    console.error("Error handling subscription created:", error)
  }
}

async function handleSubscriptionRenewed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Find subscription in database
    const dbSubscription = await prisma.subscription.findFirst({
      where: { subscriptionId },
    })

    if (!dbSubscription) {
      console.error(`Subscription ${subscriptionId} not found in database`)
      return
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: "ACTIVE",
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
      },
    })

    console.log(`Subscription ${subscriptionId} renewed`)
  } catch (error) {
    console.error("Error handling subscription renewed:", error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    // Find subscription in database
    const dbSubscription = await prisma.subscription.findFirst({
      where: { subscriptionId: subscription.id },
    })

    if (!dbSubscription) {
      console.error(`Subscription ${subscription.id} not found in database`)
      return
    }

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: "CANCELED",
      },
    })

    console.log(`Subscription ${subscription.id} canceled`)
  } catch (error) {
    console.error("Error handling subscription canceled:", error)
  }
}

async function handleOrderPayment(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.orderId

    if (!orderId) {
      console.error("No order ID in session metadata")
      return
    }

    // Update order payment status
    await prisma.payment.update({
      where: { orderId },
      data: {
        status: "SUCCEEDED",
        paymentIntentId: session.payment_intent as string,
      },
    })

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
      },
    })

    console.log(`Payment succeeded for order ${orderId}`)
  } catch (error) {
    console.error("Error handling order payment:", error)
  }
}
