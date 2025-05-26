import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Params {
  params: {
    storeId: string
  }
}

// GET /api/agency/stores/:storeId/products
export async function GET(request: Request, { params }: Params) {
  try {
    const { storeId } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only agencies can access this endpoint
    if (session.user.role !== "agency") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    })

    if (!agency) {
      return NextResponse.json({ message: "Agency not found" }, { status: 404 })
    }

    // Check if store belongs to agency
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        agencyId: agency.id,
      },
    })

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 })
    }

    // Get products
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/agency/stores/:storeId/products
export async function POST(request: Request, { params }: Params) {
  try {
    const { storeId } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only agencies can access this endpoint
    if (session.user.role !== "agency") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    })

    if (!agency) {
      return NextResponse.json({ message: "Agency not found" }, { status: 404 })
    }

    // Check if store belongs to agency
    const store = await prisma.store.findUnique({
      where: {
        id: storeId,
        agencyId: agency.id,
      },
    })

    if (!store) {
      return NextResponse.json({ message: "Store not found" }, { status: 404 })
    }

    // Get request body
    const body = await request.json()
    const {
      name,
      description,
      price,
      comparePrice,
      cost,
      sku,
      barcode,
      images,
      quantity,
      isActive,
      isFeatured,
      categories,
      variants,
    } = body

    if (!name || !price) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        comparePrice,
        cost,
        sku,
        barcode,
        images: images || [],
        quantity: quantity || 0,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        storeId,
      },
    })

    // Add categories if provided
    if (categories && categories.length > 0) {
      await Promise.all(
        categories.map((categoryId: string) =>
          prisma.productCategory.create({
            data: {
              productId: product.id,
              categoryId,
            },
          }),
        ),
      )
    }

    // Add variants if provided
    if (variants && variants.length > 0) {
      await Promise.all(
        variants.map((variant: any) =>
          prisma.productVariant.create({
            data: {
              productId: product.id,
              name: variant.name,
              options: variant.options,
              price: variant.price,
              quantity: variant.quantity || 0,
              sku: variant.sku,
            },
          }),
        ),
      )
    }

    // Get the created product with all relations
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
    })

    return NextResponse.json(createdProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
