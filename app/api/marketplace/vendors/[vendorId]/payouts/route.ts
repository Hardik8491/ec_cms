import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Params {
  params: {
    vendorId: string
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { vendorId } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin, superadmin, or the vendor owner
    const isAdmin = session.user.role === "admin" || session.user.role === "superadmin"
    const isOwner =
      session.user.role === "vendor" &&
      (await prisma.vendor.findFirst({
        where: {
          id: vendorId,
          userId: session.user.id,
        },
      }))

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get payouts
    const payouts = await prisma.payout.findMany({
      where: { vendorId },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(payouts)
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { vendorId } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only admins can create payouts
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { amount, currency = "USD", paymentMethod, reference, notes } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Valid amount is required" }, { status: 400 })
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    })

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 })
    }

    // Create payout
    const payout = await prisma.payout.create({
      data: {
        vendorId,
        amount,
        currency,
        status: "pending",
        paymentMethod,
        reference,
        notes,
      },
    })

    return NextResponse.json(payout, { status: 201 })
  } catch (error) {
    console.error("Error creating payout:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
