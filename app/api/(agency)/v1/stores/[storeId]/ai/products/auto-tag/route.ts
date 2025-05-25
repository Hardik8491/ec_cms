import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"
import { AIService } from "@/lib/ai"

const prisma = new PrismaClient()

// POST /api/v1/stores/:storeId/ai/products/auto-tag
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

    // Check permissions
    const permissions = validApiKey.permissions as string[]
    if (!permissions.includes("write") && !permissions.includes("admin")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { productId, imageUrl, productName, description } = body

    if (!productId || !imageUrl || !productName) {
      return NextResponse.json(
        {
          error: "Product ID, image URL, and product name are required",
        },
        { status: 400 },
      )
    }

    // Verify product belongs to store
    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Generate AI tags and enrichment
    const aiEnrichment = await AIService.generateProductTags(imageUrl, productName, description)

    // Update product with AI-generated data
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        aiTags: aiEnrichment.tags,
        seoTitle: aiEnrichment.seoTitle,
        seoDescription: aiEnrichment.seoDescription,
      },
    })

    // Log AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: validApiKey.userId,
        type: "generation",
        input: `Product tagging for: ${productName}`,
        output: JSON.stringify(aiEnrichment),
        model: "gpt-4-vision",
        tokens: 500, // Estimate
        cost: 0.01, // Estimate
      },
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      aiEnrichment,
    })
  } catch (error) {
    console.error("AI Product Tagging Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
