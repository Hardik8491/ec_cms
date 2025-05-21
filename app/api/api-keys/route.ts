import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateApiKey } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, permission, storeId } = await request.json()

    if (!name || !storeId) {
      return NextResponse.json({ error: "Name and storeId are required" }, { status: 400 })
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

    // Generate API key
    const apiKey = await generateApiKey(storeId, name, permission as any)

    if (!apiKey) {
      return NextResponse.json({ error: "Failed to generate API key" }, { status: 500 })
    }

    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error("Create API key error:", error)
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

    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
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

    // Mask API keys for security
    const maskedApiKeys = apiKeys.map((key) => ({
      ...key,
      key: `${key.key.substring(0, 7)}...${key.key.substring(key.key.length - 4)}`,
    }))

    return NextResponse.json({ apiKeys: maskedApiKeys })
  } catch (error) {
    console.error("Get API keys error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
