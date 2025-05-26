import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const wishlistSchema = z.object({
  productId: z.string(),
})

export async function GET(request: NextRequest, { params }: { params: { storeId: string; customerId: string } }) {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        customerId: params.customerId,
        product: {
          storeId: params.storeId,
        },
      },
      include: {
        product: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(wishlistItems)
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { storeId: string; customerId: string } }) {
  try {
    const body = await request.json()
    const validatedData = wishlistSchema.parse(body)

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        customerId: params.customerId,
        productId: validatedData.productId,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(wishlistItem, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
