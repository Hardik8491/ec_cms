import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agencies = await db.agency.findMany({
      include: {
        _count: {
          select: {
            users: true,
            products: true,
          },
        },
      },
    })

    return NextResponse.json(agencies)
  } catch (error) {
    console.error("Error fetching agencies:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
      return NextResponse.json(
        { error: "Subdomain can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 },
      )
    }

    // Check if subdomain is already taken
    const existingAgency = await db.agency.findUnique({
      where: { subdomain: data.subdomain },
    })

    if (existingAgency) {
      return NextResponse.json({ error: "Subdomain is already taken" }, { status: 400 })
    }

    const agency = await db.agency.create({
      data: {
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        logo: data.logo,
        isApproved: data.isApproved || false,
      },
    })

    return NextResponse.json(agency, { status: 201 })
  } catch (error) {
    console.error("Error creating agency:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
