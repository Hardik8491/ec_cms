import fetch from "node-fetch"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Instagram Graph API URLs
const INSTAGRAM_API_VERSION = "v18.0"
const INSTAGRAM_API_URL = `https://graph.facebook.com/${INSTAGRAM_API_VERSION}`

// Initialize Instagram client
export async function initInstagramClient(storeId: string) {
  try {
    // Get store's Instagram integration details
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        channels: true,
      },
    })

    if (!store || !store.channels) {
      throw new Error("Store not found or Instagram integration not configured")
    }

    const channels = store.channels as any

    if (!channels.instagram || !channels.instagram.accessToken || !channels.instagram.businessAccountId) {
      throw new Error("Instagram integration not configured")
    }

    const { accessToken, businessAccountId } = channels.instagram

    return {
      accessToken,
      businessAccountId,
    }
  } catch (error) {
    console.error("Error initializing Instagram client:", error)
    throw error
  }
}

// Fetch Instagram business account info
export async function fetchInstagramBusinessInfo(storeId: string) {
  try {
    const client = await initInstagramClient(storeId)

    const response = await fetch(
      `${INSTAGRAM_API_URL}/${client.businessAccountId}?fields=name,profile_picture_url,followers_count,media_count&access_token=${client.accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching Instagram business info:", error)
    throw error
  }
}

// Fetch Instagram media
export async function fetchInstagramMedia(storeId: string) {
  try {
    const client = await initInstagramClient(storeId)

    const response = await fetch(
      `${INSTAGRAM_API_URL}/${client.businessAccountId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${client.accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error("Error fetching Instagram media:", error)
    throw error
  }
}

// Create Instagram product catalog item
export async function createInstagramProductCatalogItem(storeId: string, productId: string) {
  try {
    const client = await initInstagramClient(storeId)

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // Get catalog ID from store channels
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { channels: true },
    })

    const channels = store?.channels as any

    if (!channels?.instagram?.catalogId) {
      throw new Error("Instagram catalog ID not found")
    }

    const catalogId = channels.instagram.catalogId

    // Create product item in catalog
    const response = await fetch(`${INSTAGRAM_API_URL}/${catalogId}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.images[0],
        url: `${process.env.NEXT_PUBLIC_URL}/products/${product.id}`,
        access_token: client.accessToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Update product with Instagram catalog item ID
    await prisma.product.update({
      where: { id: productId },
      data: {
        // Store Instagram catalog item ID in a field or in metadata
        aiTags: {
          ...((product.aiTags as any) || {}),
          instagramCatalogItemId: data.id,
        },
      },
    })

    return data
  } catch (error) {
    console.error("Error creating Instagram product catalog item:", error)
    throw error
  }
}

// Sync products to Instagram catalog
export async function syncProductsToInstagram(storeId: string) {
  try {
    // Get all active products
    const products = await prisma.product.findMany({
      where: {
        storeId,
        isActive: true,
      },
    })

    const results = []

    for (const product of products) {
      try {
        const result = await createInstagramProductCatalogItem(storeId, product.id)
        results.push({
          productId: product.id,
          success: true,
          instagramItemId: result.id,
        })
      } catch (error) {
        results.push({
          productId: product.id,
          success: false,
          error: (error as Error).message,
        })
      }
    }

    return {
      total: products.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    }
  } catch (error) {
    console.error("Error syncing products to Instagram:", error)
    throw error
  }
}
