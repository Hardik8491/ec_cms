import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subdomain, customDomain, storeId } = await request.json()

    if (!subdomain || !storeId) {
      return NextResponse.json({ error: "Subdomain and storeId are required" }, { status: 400 })
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

    // Check if subdomain is already taken
    const existingSubdomain = await prisma.subdomain.findUnique({
      where: { subdomain },
    })

    if (existingSubdomain) {
      return NextResponse.json({ error: "Subdomain is already taken" }, { status: 400 })
    }

    // Create subdomain
    const newSubdomain = await prisma.subdomain.create({
      data: {
        subdomain,
        customDomain,
        store: {
          connect: { id: storeId },
        },
      },
    })

    return NextResponse.json({ subdomain: newSubdomain })
  } catch (error) {
    console.error("Create subdomain error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")

    // Build the query
    const where = {
      ...(storeId ? { storeId } : {}),
      ...(session.role !== "SUPER_ADMIN"
        ? {
            store: {
              agencyId: session.agencyId,
            },
          }
        : {}),
    }

    // Get subdomains
    const subdomains = await prisma.subdomain.findMany({
      where,
      include: {
        store: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ subdomains })
  } catch (error) {
    console.error("Get subdomains error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
