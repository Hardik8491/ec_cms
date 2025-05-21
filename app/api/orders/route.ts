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
    const storeId = searchParams.get("storeId")
    const status = searchParams.get("status")

    const skip = (page - 1) * limit

    // Build the query
    const where = {
      ...(storeId ? { storeId } : {}),
      ...(status ? { status } : {}),
      ...(session.role !== "SUPER_ADMIN"
        ? {
            store: {
              agencyId: session.agencyId,
            },
          }
        : {}),
    }

    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
          store: {
            select: {
              name: true,
              id: true,
            },
          },
          payment: {
            select: {
              status: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
