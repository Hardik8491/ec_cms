import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

type RegisterVendorParams = {
  name: string
  email: string
  password: string
  description?: string
  website?: string
  phone?: string
}

export async function registerVendor({ name, email, password, description, website, phone }: RegisterVendorParams) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user with vendor role
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "vendor",
    },
  })

  // Create vendor profile
  const vendor = await prisma.vendor.create({
    data: {
      name,
      description,
      website,
      email,
      phone,
      userId: user.id,
      status: "pending", // Vendors start as pending until approved
    },
  })

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    vendorId: vendor.id,
  }
}

export async function getVendorByUserId(userId: string) {
  return prisma.vendor.findUnique({
    where: { userId },
    include: {
      stores: true,
      products: {
        include: {
          store: true,
        },
      },
    },
  })
}

export async function getVendorStats(vendorId: string) {
  // Get total products
  const productsCount = await prisma.product.count({
    where: { vendorId },
  })

  // Get total orders and revenue
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

  return {
    products: productsCount,
    orders: orderIds.size,
    revenue: totalRevenue,
    payouts: payouts._sum.amount || 0,
    balance: totalRevenue - (payouts._sum.amount || 0),
  }
}
