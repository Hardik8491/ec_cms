import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const storeId = searchParams.get("storeId")
    const categoryId = searchParams.get("categoryId")

    const skip = (page - 1) * limit

    // Build the query
    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(storeId ? { storeId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(session.role !== "SUPER_ADMIN"
        ? {
            store: {
              agencyId: session.agencyId,
            },
          }
        : {}),
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          store: {
            select: {
              name: true,
              id: true,
            },
          },
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, price, comparePrice, images, inventory, storeId, categoryId } =
      await request.json()

    if (!name || !slug || !price || !storeId || !categoryId) {
      return NextResponse.json({ error: "Name, slug, price, storeId, and categoryId are required" }, { status: 400 })
    }

    // Check if store exists and user has access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 })
    }

    // Check if user has access to this store
    if (session.role !== "SUPER_ADMIN" && store.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    // Check if slug is already taken in this store
    const existingProduct = await prisma.product.findFirst({
      where: {
        storeId,
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
          connect: { id: storeId },
        },
        category: {
          connect: { id: categoryId },
        },
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
