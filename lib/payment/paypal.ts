import fetch from "node-fetch"
import type { Order } from "@prisma/client"

// PayPal API URLs
const BASE_URL =
  process.env.PAYPAL_ENVIRONMENT === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

// Generate an access token
async function generateAccessToken() {
  try {
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64")

    const response = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error generating PayPal access token:", error)
    throw error
  }
}

// Create a PayPal order
export async function createPayPalOrder(order: Order) {
  try {
    const accessToken = await generateAccessToken()

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: order.total.toString(),
          },
          reference_id: order.id,
          description: `Order #${order.orderNumber}`,
        },
      ],
    }

    const response = await fetch(`${BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating PayPal order:", error)
    throw error
  }
}

// Capture a PayPal payment
export async function capturePayPalPayment(paypalOrderId: string) {
  try {
    const accessToken = await generateAccessToken()

    const response = await fetch(`${BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error capturing PayPal payment:", error)
    throw error
  }
}

// Verify a PayPal webhook event
export async function verifyWebhookSignature(body: string, headers: Record<string, string>) {
  try {
    const accessToken = await generateAccessToken()

    const response = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: JSON.parse(body),
      }),
    })

    const data = await response.json()
    return data.verification_status === "SUCCESS"
  } catch (error) {
    console.error("Error verifying PayPal webhook signature:", error)
    throw error
  }
}
