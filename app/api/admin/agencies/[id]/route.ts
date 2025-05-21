import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const agency = await db.agency.findUnique({
      where: { id: params.id },
      include: {
        users: {
          include: {
            role: true,
          },
        },
        products: true,
        analytics: {
          take: 10,
          orderBy: {
            date: "desc",
          },
        },
      },
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    return NextResponse.json(agency)
  } catch (error) {
    console.error("Error fetching agency:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // If updating subdomain, validate format and check if it's already taken
    if (data.subdomain) {
      if (!/^[a-z0-9-]+$/.test(data.subdomain)) {
        return NextResponse.json(
          { error: "Subdomain can only contain lowercase letters, numbers, and hyphens" },
          { status: 400 },
        )
      }

      const existingAgency = await db.agency.findUnique({
        where: { subdomain: data.subdomain },
      })

      if (existingAgency && existingAgency.id !== params.id) {
        return NextResponse.json({ error: "Subdomain is already taken" }, { status: 400 })
      }
    }

    const agency = await db.agency.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(agency)
  } catch (error) {
    console.error("Error updating agency:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if agency exists
    const agency = await db.agency.findUnique({
      where: { id: params.id },
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 })
    }

    // Delete agency
    await db.agency.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting agency:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
