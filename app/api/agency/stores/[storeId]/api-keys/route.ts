import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"
import { generateApiKey } from "@/lib/auth"

const prisma = new PrismaClient()

interface Params {
  params: {
    storeId: string
  }
}

// GET /api/agency/stores/:storeId/api-keys
export async function GET(request: Request, { params }: Params) {
  try {
    const { storeId } = await params
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

    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    })

    // Mask API keys for security
    const maskedApiKeys = apiKeys.map((key) => ({
      ...key,
      key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 4)}`,
    }))

    return NextResponse.json(maskedApiKeys)
  } catch (error) {
    console.error("Error fetching API keys:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/agency/stores/:storeId/api-keys
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
    const { name, permissions = ["read"] } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "API key name is required" }, { status: 400 })
    }

    // Generate API key
    const apiKey = await generateApiKey(session.user.id, storeId, permissions)

    return NextResponse.json(apiKey, { status: 201 })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
