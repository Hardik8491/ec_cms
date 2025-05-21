import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateApiKey } from "@/lib/api-auth"

export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId")

    const skip = (page - 1) * limit

    // Build the query
    const where = {
      storeId: params.storeId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId } : {}),
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        storeId: params.storeId,
        endpoint: `/api/v1/stores/${params.storeId}/products`,
        method: "GET",
        apiKeyId: validApiKey.id,
      },
    })

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
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

    const { name, slug, description, price, comparePrice, images, inventory, categoryId } = await request.json()

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: "Name, slug, price, and categoryId are required" }, { status: 400 })
    }

    // Check if slug is already taken in this store
    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId: params.storeId,
        slug,
      },
    })

    if (existingProduct) {
      return NextResponse.json({ error: "Slug is already taken in this store" }, { status: 400 })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        comparePrice,
        images: images || [],
        inventory: inventory || 0,
        store: {
          connect: { id: params.storeId },
        },
        category: {
          connect: { id: categoryId },
        },
      },
    })

    // Log API usage
    await prisma.apiUsage.create({
      data: {
        storeId: params.storeId,
        endpoint: `/api/v1/stores/${params.storeId}/products`,
        method: "POST",
        apiKeyId: validApiKey.id,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
