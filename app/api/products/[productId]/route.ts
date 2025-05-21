import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = params

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            name: true,
            id: true,
            agencyId: true,
          },
        },
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

    // Check if user has access to this product's store
    if (session.role !== "SUPER_ADMIN" && product.store.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = params
    const { name, description, price, comparePrice, images, inventory, categoryId } = await request.json()

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            agencyId: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has access to this product's store
    if (session.role !== "SUPER_ADMIN" && product.store.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
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

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId } = params

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            agencyId: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has access to this product's store
    if (session.role !== "SUPER_ADMIN" && product.store.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
