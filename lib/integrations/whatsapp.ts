import fetch from "node-fetch"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// WhatsApp Business API URLs
const WHATSAPP_API_VERSION = "v18.0"
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`

// Initialize WhatsApp client
export async function initWhatsAppClient(storeId: string) {
  try {
    // Get store's WhatsApp integration details
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        channels: true,
      },
    })

    if (!store || !store.channels) {
      throw new Error("Store not found or WhatsApp integration not configured")
    }

    const channels = store.channels as any

    if (!channels.whatsapp || !channels.whatsapp.accessToken || !channels.whatsapp.phoneNumberId) {
      throw new Error("WhatsApp integration not configured")
    }

    const { accessToken, phoneNumberId } = channels.whatsapp

    return {
      accessToken,
      phoneNumberId,
    }
  } catch (error) {
    console.error("Error initializing WhatsApp client:", error)
    throw error
  }
}

// Send WhatsApp message
export async function sendWhatsAppMessage(storeId: string, to: string, message: string) {
  try {
    const client = await initWhatsAppClient(storeId)

    const response = await fetch(`${WHATSAPP_API_URL}/${client.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${client.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    throw error
  }
}

// Send WhatsApp template message
export async function sendWhatsAppTemplateMessage(
  storeId: string,
  to: string,
  templateName: string,
  components: any[],
) {
  try {
    const client = await initWhatsAppClient(storeId)

    const response = await fetch(`${WHATSAPP_API_URL}/${client.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${client.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en_US",
          },
          components,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending WhatsApp template message:", error)
    throw error
  }
}

// Send WhatsApp order confirmation
export async function sendOrderConfirmation(orderId: string) {
  try {
    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
        customer: true,
        items: true,
      },
    })

    if (!order || !order.customer || !order.customer.phone) {
      throw new Error("Order not found or customer phone missing")
    }

    // Format phone number (remove any non-digit characters and ensure it starts with country code)
    let phone = order.customer.phone.replace(/\D/g, "")
    if (!phone.startsWith("+")) {
      phone = `+${phone}`
    }

    // Create template components
    const components = [
      {
        type: "header",
        parameters: [
          {
            type: "text",
            text: order.orderNumber,
          },
        ],
      },
      {
        type: "body",
        parameters: [
          {
            type: "text",
            text: order.customer.name || "Valued Customer",
          },
          {
            type: "text",
            text: order.items.length.toString(),
          },
          {
            type: "currency",
            currency: {
              code: "USD",
              amount: order.total * 100, // Amount in cents
            },
          },
        ],
      },
    ]

    // Send template message
    return await sendWhatsAppTemplateMessage(order.storeId, phone, "order_confirmation", components)
  } catch (error) {
    console.error("Error sending WhatsApp order confirmation:", error)
    throw error
  }
}

// Send WhatsApp product catalog
export async function sendProductCatalog(storeId: string, to: string) {
  try {
    const client = await initWhatsAppClient(storeId)

    // Get store's catalog ID from channels
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { channels: true },
    })

    const channels = store?.channels as any

    if (!channels?.whatsapp?.catalogId) {
      throw new Error("WhatsApp catalog ID not found")
    }

    const catalogId = channels.whatsapp.catalogId

    // Send catalog message
    const response = await fetch(`${WHATSAPP_API_URL}/${client.phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${client.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "interactive",
        interactive: {
          type: "catalog_message",
          body: {
            text: "Check out our products",
          },
          action: {
            name: "catalog_message",
            parameters: {
              catalog_id: catalogId,
            },
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending WhatsApp product catalog:", error)
    throw error
  }
}
