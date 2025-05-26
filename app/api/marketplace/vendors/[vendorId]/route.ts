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

    // Get vendor details
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        stores: {
          include: {
            _count: {
              select: {
                products: true,
                orders: true,
              },
            },
          },
        },
        products: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            store: true,
          },
        },
        _count: {
          select: {
            stores: true,
            products: true,
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found" }, { status: 404 })
    }

    // Get vendor stats
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          vendorId,
        },
      },
      include: {
        order: true,
      },
    })

    // Calculate total orders and revenue
    const orderIds = new Set()
    let totalRevenue = 0

    orderItems.forEach((item) => {
      if (item.order.status !== "cancelled" && item.order.status !== "refunded") {
        orderIds.add(item.orderId)
        totalRevenue += item.total
      }
    })

    // Get total payouts
    const payouts = await prisma.payout.aggregate({
      where: {
        vendorId,
        status: "completed",
      },
      _sum: {
        amount: true,
      },
    })

    // Add stats to vendor data
    const vendorWithStats = {
      ...vendor,
      stats: {
        orders: orderIds.size,
        revenue: totalRevenue,
        payouts: payouts._sum.amount || 0,
        balance: totalRevenue - (payouts._sum.amount || 0),
      },
    }

    return NextResponse.json(vendorWithStats)
  } catch (error) {
    console.error("Error fetching vendor:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
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

    const body = await request.json()
    const { name, description, logo, bannerImage, website, phone, address, city, state, postalCode, country, status } =
      body

    // Only admins can update status
    if (status && !isAdmin) {
      return NextResponse.json({ message: "Only admins can update vendor status" }, { status: 403 })
    }

    // Update vendor
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        name,
        description,
        logo,
        bannerImage,
        website,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        ...(isAdmin && status ? { status } : {}),
      },
    })

    return NextResponse.json(updatedVendor)
  } catch (error) {
    console.error("Error updating vendor:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
