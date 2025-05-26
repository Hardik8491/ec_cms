import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"
import { AIService } from "@/lib/ai"

const prisma = new PrismaClient()

// GET /api/v1/stores/:storeId/ai/pricing-suggestions
export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
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

    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Get product data
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
      include: {
        orderItems: {
          include: {
            order: true,
          },
          take: 50,
        },
        reviews: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Prepare product data for AI analysis
    const productData = {
      currentPrice: product.price,
      cost: product.cost,
      quantity: product.quantity,
      salesCount: product.orderItems.length,
      avgRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : null,
      recentSales: product.orderItems.slice(0, 10).map((item) => ({
        price: item.price,
        quantity: item.quantity,
        date: item.order.createdAt,
      })),
    }

    // Mock market data (in real implementation, this would come from external APIs)
    const marketData = {
      competitorPrices: [product.price * 0.9, product.price * 1.1, product.price * 0.95],
      marketDemand: "medium",
      seasonality: "normal",
    }

    // Get AI pricing suggestion
    const suggestion = await AIService.generatePricingSuggestion(productData, marketData)

    // Save pricing suggestion
    const pricingSuggestion = await prisma.pricingSuggestion.create({
      data: {
        productId,
        storeId,
        currentPrice: product.price,
        suggestedPrice: suggestion.suggestedPrice,
        reason: suggestion.reason,
        confidence: suggestion.confidence,
      },
    })

    return NextResponse.json({
      productId,
      currentPrice: product.price,
      suggestion: pricingSuggestion,
      aiAnalysis: suggestion,
    })
  } catch (error) {
    console.error("Pricing Suggestion Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/stores/:storeId/ai/pricing-suggestions - Apply pricing suggestion
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

    const body = await request.json()
    const { suggestionId } = body

    if (!suggestionId) {
      return NextResponse.json({ error: "Suggestion ID is required" }, { status: 400 })
    }

    // Get pricing suggestion
    const suggestion = await prisma.pricingSuggestion.findFirst({
      where: { id: suggestionId, storeId },
      include: { product: true },
    })

    if (!suggestion) {
      return NextResponse.json({ error: "Pricing suggestion not found" }, { status: 404 })
    }

    if (suggestion.isApplied) {
      return NextResponse.json({ error: "Suggestion already applied" }, { status: 400 })
    }

    // Update product price
    const updatedProduct = await prisma.product.update({
      where: { id: suggestion.productId },
      data: { price: suggestion.suggestedPrice },
    })

    // Mark suggestion as applied
    await prisma.pricingSuggestion.update({
      where: { id: suggestionId },
      data: { isApplied: true },
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: validApiKey.userId,
        action: "update",
        resource: "product",
        resourceId: suggestion.productId,
        details: {
          oldPrice: suggestion.currentPrice,
          newPrice: suggestion.suggestedPrice,
          reason: suggestion.reason,
        },
      },
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      appliedSuggestion: suggestion,
    })
  } catch (error) {
    console.error("Apply Pricing Suggestion Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
