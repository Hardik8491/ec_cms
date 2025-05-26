// reviews
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server"

import { z } from "zod"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  customerId: z.string(),
})

export async function GET(request: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const [reviews, total, averageRating] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId: params.productId,
          product: {
            storeId: params.storeId,
          },
        },
        include: {
          customer: {
            select: {
              // name: true,
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({
        where: {
          productId: params.productId,
          product: {
            storeId: params.storeId,
          },
        },
      }),
      prisma.review.aggregate({
        where: {
          productId: params.productId,
          product: {
            storeId: params.storeId,
          },
        },
        _avg: {
          rating: true,
        },
      }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      averageRating: averageRating._avg.rating || 0,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { storeId: string; productId: string } }) {
  try {
    const body = await request.json()
    const validatedData = reviewSchema.parse(body)

    const review = await prisma.review.create({
      data: {
        ...validatedData,
        productId: params.productId,
      },
      include: {
        customer: {
          select: {
            // name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
