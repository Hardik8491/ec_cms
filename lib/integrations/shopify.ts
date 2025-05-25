import fetch from "node-fetch"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Shopify API URLs
const SHOPIFY_API_VERSION = "2023-10"

// Initialize Shopify client
export async function initShopifyClient(storeId: string) {
  try {
    // Get store's Shopify integration details
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        channels: true,
      },
    })

    if (!store || !store.channels) {
      throw new Error("Store not found or Shopify integration not configured")
    }

    const channels = store.channels as any

    if (!channels.shopify || !channels.shopify.shop || !channels.shopify.accessToken) {
      throw new Error("Shopify integration not configured")
    }

    const { shop, accessToken } = channels.shopify

    return {
      shop,
      accessToken,
      baseUrl: `https://${shop}/admin/api/${SHOPIFY_API_VERSION}`,
    }
  } catch (error) {
    console.error("Error initializing Shopify client:", error)
    throw error
  }
}

// Fetch products from Shopify
export async function fetchShopifyProducts(storeId: string) {
  try {
    const client = await initShopifyClient(storeId)

    const response = await fetch(`${client.baseUrl}/products.json`, {
      headers: {
        "X-Shopify-Access-Token": client.accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.products
  } catch (error) {
    console.error("Error fetching Shopify products:", error)
    throw error
  }
}

// Create product in Shopify
export async function createShopifyProduct(storeId: string, product: any) {
  try {
    const client = await initShopifyClient(storeId)

    const response = await fetch(`${client.baseUrl}/products.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": client.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.product
  } catch (error) {
    console.error("Error creating Shopify product:", error)
    throw error
  }
}

// Fetch orders from Shopify
export async function fetchShopifyOrders(storeId: string) {
  try {
    const client = await initShopifyClient(storeId)

    const response = await fetch(`${client.baseUrl}/orders.json`, {
      headers: {
        "X-Shopify-Access-Token": client.accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.orders
  } catch (error) {
    console.error("Error fetching Shopify orders:", error)
    throw error
  }
}

// Sync Shopify products to EC-OS
export async function syncShopifyProducts(storeId: string) {
  try {
    const shopifyProducts = await fetchShopifyProducts(storeId)

    // Process each product
    for (const shopifyProduct of shopifyProducts) {
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: {
          storeId,
          sku: shopifyProduct.id.toString(),
        },
      })

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: shopifyProduct.title,
            description: shopifyProduct.body_html,
            price: Number.parseFloat(shopifyProduct.variants[0]?.price || "0"),
            comparePrice: Number.parseFloat(shopifyProduct.variants[0]?.compare_at_price || "0"),
            images: shopifyProduct.images.map((img: any) => img.src),
            // Add more fields as needed
          },
        })
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            storeId,
            name: shopifyProduct.title,
            description: shopifyProduct.body_html,
            price: Number.parseFloat(shopifyProduct.variants[0]?.price || "0"),
            comparePrice: Number.parseFloat(shopifyProduct.variants[0]?.compare_at_price || "0"),
            sku: shopifyProduct.id.toString(),
            images: shopifyProduct.images.map((img: any) => img.src),
            isActive: shopifyProduct.status === "active",
            // Add more fields as needed
          },
        })
      }
    }

    return { synced: shopifyProducts.length }
  } catch (error) {
    console.error("Error syncing Shopify products:", error)
    throw error
  }
}

// Sync Shopify orders to EC-OS
export async function syncShopifyOrders(storeId: string) {
  try {
    const shopifyOrders = await fetchShopifyOrders(storeId)

    // Process each order
    for (const shopifyOrder of shopifyOrders) {
      // Check if order already exists
      const existingOrder = await prisma.order.findFirst({
        where: {
          storeId,
          orderNumber: `SHOPIFY-${shopifyOrder.order_number}`,
        },
      })

      if (existingOrder) {
        // Update existing order
        await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: mapShopifyOrderStatus(shopifyOrder.fulfillment_status),
            paymentStatus: mapShopifyPaymentStatus(shopifyOrder.financial_status),
            // Add more fields as needed
          },
        })
      } else {
        // Create new order
        const order = await prisma.order.create({
          data: {
            storeId,
            orderNumber: `SHOPIFY-${shopifyOrder.order_number}`,
            status: mapShopifyOrderStatus(shopifyOrder.fulfillment_status),
            total: Number.parseFloat(shopifyOrder.total_price),
            subtotal: Number.parseFloat(shopifyOrder.subtotal_price),
            tax: Number.parseFloat(shopifyOrder.total_tax),
            shipping: Number.parseFloat(shopifyOrder.shipping_lines[0]?.price || "0"),
            discount: Number.parseFloat(shopifyOrder.total_discounts),
            paymentStatus: mapShopifyPaymentStatus(shopifyOrder.financial_status),
            paymentMethod: "shopify",
            channel: "shopify",
            shippingAddress: shopifyOrder.shipping_address,
            billingAddress: shopifyOrder.billing_address,
            // Add more fields as needed
          },
        })

        // Create order items
        for (const item of shopifyOrder.line_items) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: "", // Need to map Shopify product ID to EC-OS product ID
              name: item.title,
              price: Number.parseFloat(item.price),
              quantity: item.quantity,
              total: Number.parseFloat(item.price) * item.quantity,
              options: item.properties || {},
            },
          })
        }

        // Create customer if needed
        if (shopifyOrder.customer) {
          const customer = await prisma.customer.findFirst({
            where: {
              storeId,
              email: shopifyOrder.customer.email,
            },
          })

          if (!customer) {
            await prisma.customer.create({
              data: {
                storeId,
                email: shopifyOrder.customer.email,
                name: `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
                phone: shopifyOrder.customer.phone,
                // Add more fields as needed
              },
            })
          }
        }
      }
    }

    return { synced: shopifyOrders.length }
  } catch (error) {
    console.error("Error syncing Shopify orders:", error)
    throw error
  }
}

// Map Shopify order status to EC-OS status
function mapShopifyOrderStatus(status: string | null) {
  switch (status) {
    case "fulfilled":
      return "completed"
    case "partial":
      return "processing"
    case "unfulfilled":
      return "pending"
    case "restocked":
      return "cancelled"
    default:
      return "pending"
  }
}

// Map Shopify payment status to EC-OS payment status
function mapShopifyPaymentStatus(status: string | null) {
  switch (status) {
    case "paid":
      return "paid"
    case "pending":
      return "pending"
    case "refunded":
      return "refunded"
    case "partially_refunded":
      return "refunded"
    case "failed":
      return "failed"
    default:
      return "pending"
  }
}
