import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateApiKey } from "@/lib/api-auth"

export async function GET(request: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    // Validate API key from request headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey, params.storeId)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: {
        id: params.productId,
        storeId: params.storeId,
      },
      include: {
        category: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        storeId: params.storeId,
        endpoint: `/api/v1/stores/${params.storeId}/products/${params.productId}`,
        method: "GET",
        apiKeyId: validApiKey.id,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    // Validate API key from request headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey, params.storeId, ["write", "full"])
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key or insufficient permissions" }, { status: 401 })
    }

    const { name, description, price, comparePrice, images, inventory, categoryId } = await request.json()

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.productId,
        storeId: params.storeId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update product
    const product = await prisma.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        description,
        price,
        comparePrice,
        images,
        inventory,
        ...(categoryId
          ? {
              category: {
                connect: { id: categoryId },
              },
            }
          : {}),
      },
    })

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        storeId: params.storeId,
        endpoint: `/api/v1/stores/${params.storeId}/products/${params.productId}`,
        method: "PUT",
        apiKeyId: validApiKey.id,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    // Validate API key from request headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey, params.storeId, ["full"])
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key or insufficient permissions" }, { status: 401 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.productId,
        storeId: params.storeId,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete product
    await prisma.product.delete({
      where: {
        id: params.productId,
      },
    })

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        storeId: params.storeId,
        endpoint: `/api/v1/stores/${params.storeId}/products/${params.productId}`,
        method: "DELETE",
        apiKeyId: validApiKey.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
