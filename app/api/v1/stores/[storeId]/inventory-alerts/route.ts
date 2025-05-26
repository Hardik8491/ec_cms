import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/v1/stores/:storeId/inventory-alerts
export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Validate API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Get existing alerts
    const existingAlerts = await prisma.inventoryAlert.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    })

    // Generate new alerts based on current inventory
    const products = await prisma.product.findMany({
      where: { storeId, isActive: true },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      },
    })

    const newAlerts = []

    for (const product of products) {
      // Calculate sales velocity (items sold per day)
      const salesVelocity = product.orderItems.reduce((sum, item) => sum + item.quantity, 0) / 30

      // Predict when stock will run out
      const daysUntilStockOut = salesVelocity > 0 ? product.quantity / salesVelocity : null

      // Generate alerts based on predictions
      if (product.quantity === 0) {
        newAlerts.push({
          storeId,
          productId: product.id,
          type: "out_of_stock",
          message: `${product.name} is out of stock`,
          severity: "critical",
        })
      } else if (product.quantity <= 5) {
        newAlerts.push({
          storeId,
          productId: product.id,
          type: "low_stock",
          message: `${product.name} has low stock (${product.quantity} remaining)`,
          severity: "high",
        })
      } else if (daysUntilStockOut && daysUntilStockOut <= 7) {
        const predictedDate = new Date()
        predictedDate.setDate(predictedDate.getDate() + Math.ceil(daysUntilStockOut))

        newAlerts.push({
          storeId,
          productId: product.id,
          type: "restock_prediction",
          message: `${product.name} predicted to run out in ${Math.ceil(daysUntilStockOut)} days`,
          severity: "medium",
          predictedDate,
        })
      }

      // Update product sales velocity
      await prisma.product.update({
        where: { id: product.id },
        data: { salesVelocity },
      })
    }

    // Save new alerts
    if (newAlerts.length > 0) {
      await prisma.inventoryAlert.createMany({
        data: newAlerts,
        skipDuplicates: true,
      })
    }

    // Get all alerts including new ones
    const allAlerts = await prisma.inventoryAlert.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      alerts: allAlerts,
      newAlertsCount: newAlerts.length,
      summary: {
        critical: allAlerts.filter((alert) => alert.severity === "critical").length,
        high: allAlerts.filter((alert) => alert.severity === "high").length,
        medium: allAlerts.filter((alert) => alert.severity === "medium").length,
      },
    })
  } catch (error) {
    console.error("Inventory Alerts Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/stores/:storeId/inventory-alerts - Mark alerts as read
export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Validate API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const body = await request.json()
    const { alertIds } = body

    if (!alertIds || !Array.isArray(alertIds)) {
      return NextResponse.json({ error: "Alert IDs array is required" }, { status: 400 })
    }

    // Mark alerts as read
    await prisma.inventoryAlert.updateMany({
      where: {
        id: { in: alertIds },
        storeId,
      },
      data: { isRead: true },
    })

    return NextResponse.json({ success: true, markedAsRead: alertIds.length })
  } catch (error) {
    console.error("Mark Alerts Read Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
