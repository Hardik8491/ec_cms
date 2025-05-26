import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/v1/stores/:storeId/orders - Get all orders for a store
export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Check API key from headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Check if API key has access to this store
    if (validApiKey.storeId && validApiKey.storeId !== storeId) {
      return NextResponse.json({ error: "Unauthorized access to this store" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const status = url.searchParams.get("status")
    const search = url.searchParams.get("search")
    const sort = url.searchParams.get("sort") || "createdAt"
    const order = url.searchParams.get("order") || "desc"

    // Build where clause
    const where: any = { storeId }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        tracking: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    })

    // Get total count
    const total = await prisma.order.count({ where })

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/stores/:storeId/orders - Create a new order
export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Check API key from headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Check if API key has access to this store
    if (validApiKey.storeId && validApiKey.storeId !== storeId) {
      return NextResponse.json({ error: "Unauthorized access to this store" }, { status: 403 })
    }

    // Check if API key has write permissions
    const permissions = validApiKey.permissions as string[]
    if (!permissions.includes("write") && !permissions.includes("admin")) {
      return NextResponse.json({ error: "API key does not have write permissions" }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const {
      customer,
      items,
      status = "pending",
      paymentStatus = "pending",
      paymentMethod,
      shippingAddress,
      billingAddress,
      notes,
    } = body

    if (!items || !items.length) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 })
    }

    // Validate customer
    let customerId = null
    if (customer) {
      if (customer.id) {
        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
          where: { id: customer.id },
        })

        if (existingCustomer) {
          customerId = existingCustomer.id
        }
      } else if (customer.email) {
        // Find or create customer
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            email: customer.email,
            storeId,
          },
        })

        if (existingCustomer) {
          customerId = existingCustomer.id
        } else {
          // Create new customer
          const newCustomer = await prisma.customer.create({
            data: {
              email: customer.email,
              name: customer.name,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              postalCode: customer.postalCode,
              country: customer.country,
              storeId,
            },
          })

          customerId = newCustomer.id
        }
      }
    }

    // Calculate order totals
    let subtotal = 0
    const orderItems = []

    // Validate products and calculate totals
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json({ error: `Product with ID ${item.productId} not found` }, { status: 400 })
      }

      if (product.storeId !== storeId) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} does not belong to this store` },
          { status: 400 },
        )
      }

      const quantity = item.quantity || 1
      const price = item.price || product.price
      const total = price * quantity

      subtotal += total

      orderItems.push({
        productId: product.id,
        name: product.name,
        price,
        quantity,
        total,
        options: item.options || {},
      })
    }

    // Apply tax, shipping, discount
    const tax = body.tax || 0
    const shipping = body.shipping || 0
    const discount = body.discount || 0

    const total = subtotal + tax + shipping - discount

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        storeId,
        customerId,
        status,
        total,
        subtotal,
        tax,
        shipping,
        discount,
        paymentStatus,
        paymentMethod,
        shippingAddress: shippingAddress || {},
        billingAddress: billingAddress || {},
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
