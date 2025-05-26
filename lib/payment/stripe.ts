import Stripe from "stripe"
import type { Order } from "@prisma/client"

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
})

export async function createPaymentIntent(order: Order) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: "usd",
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        storeId: order.storeId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    throw error
  }
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error) {
    console.error("Error retrieving payment intent:", error)
    throw error
  }
}

export async function createCheckoutSession(order: Order, successUrl: string, cancelUrl: string) {
  try {
    // Fetch order items from database
    // This is a simplified example - you would need to fetch the actual items
    const lineItems = order?.items?.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        storeId: order.storeId,
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw error
  }
}

export async function handleWebhookEvent(payload: any, signature: string) {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET || "")

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        await handleSuccessfulPayment(paymentIntent)
        break
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        await handleFailedPayment(failedPayment)
        break
      // Add more event handlers as needed
    }

    return event
  } catch (error) {
    console.error("Error handling webhook event:", error)
    throw error
  }
}

async function handleSuccessfulPayment(paymentIntent: any) {
  const { orderId } = paymentIntent.metadata

  // Update order status in database
  // This is a simplified example - you would need to update the actual order
  // await prisma.order.update({
  //   where: { id: orderId },
  //   data: { paymentStatus: 'paid' },
  // });
}

async function handleFailedPayment(paymentIntent: any) {
  const { orderId } = paymentIntent.metadata

  // Update order status in database
  // This is a simplified example - you would need to update the actual order
  // await prisma.order.update({
  //   where: { id: orderId },
  //   data: { paymentStatus: 'failed' },
  // });
}
