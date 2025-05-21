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
    const storeId = searchParams.get("storeId")

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 })
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

    // Get categories
    const categories = await prisma.category.findMany({
      where: { storeId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, slug, description, image, storeId } = await request.json()

    if (!name || !slug || !storeId) {
      return NextResponse.json({ error: "Name, slug, and storeId are required" }, { status: 400 })
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

    // Check if slug is already taken in this store
    const existingCategory = await prisma.category.findFirst({
      where: {
        storeId,
        slug,
      },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Slug is already taken in this store" }, { status: 400 })
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        store: {
          connect: { id: storeId },
        },
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
