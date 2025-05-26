import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Params {
  params: {
    vendorId: string
    payoutId: string
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { vendorId, payoutId } = params
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update payouts
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status, paymentMethod, reference, notes } = body

    // Check if payout exists and belongs to vendor
    const payout = await prisma.payout.findFirst({
      where: {
        id: payoutId,
        vendorId,
      },
    })

    if (!payout) {
      return NextResponse.json({ message: "Payout not found" }, { status: 404 })
    }

    // Update payout
    const updatedPayout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status,
        paymentMethod,
        reference,
        notes,
      },
    })

    return NextResponse.json(updatedPayout)
  } catch (error) {
    console.error("Error updating payout:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
