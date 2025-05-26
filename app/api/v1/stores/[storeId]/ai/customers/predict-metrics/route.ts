import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"
import { AIService } from "@/lib/ai"

const prisma = new PrismaClient()

// GET /api/v1/stores/:storeId/ai/customers/predict-metrics
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

    const url = new URL(request.url)
    const customerId = url.searchParams.get("customerId")

    if (customerId) {
      // Predict metrics for specific customer
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, storeId },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          reviews: true,
        },
      })

      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 })
      }

      // Prepare customer data for AI analysis
      const customerData = {
        totalOrders: customer.orders.length,
        totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
        avgOrderValue:
          customer.orders.length > 0
            ? customer.orders.reduce((sum, order) => sum + order.total, 0) / customer.orders.length
            : 0,
        daysSinceLastOrder:
          customer.orders.length > 0
            ? Math.floor((Date.now() - customer.orders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : null,
        reviewCount: customer.reviews.length,
        avgRating:
          customer.reviews.length > 0
            ? customer.reviews.reduce((sum, review) => sum + review.rating, 0) / customer.reviews.length
            : null,
        customerAge: Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      }

      // Get AI predictions
      const predictions = await AIService.predictCustomerMetrics(customerData)

      // Update customer with predictions
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          healthScore: predictions.healthScore,
          ltv: predictions.ltv,
          churnRisk: predictions.churnRisk,
          segment: predictions.segment,
        },
      })

      return NextResponse.json({
        customerId,
        predictions,
        customerData,
      })
    } else {
      // Batch predict for all customers
      const customers = await prisma.customer.findMany({
        where: { storeId },
        include: {
          orders: true,
          reviews: true,
        },
        take: 100, // Limit for performance
      })

      const predictions = []

      for (const customer of customers) {
        const customerData = {
          totalOrders: customer.orders.length,
          totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
          avgOrderValue:
            customer.orders.length > 0
              ? customer.orders.reduce((sum, order) => sum + order.total, 0) / customer.orders.length
              : 0,
          daysSinceLastOrder:
            customer.orders.length > 0
              ? Math.floor((Date.now() - customer.orders[0].createdAt.getTime()) / (1000 * 60 * 60 * 24))
              : null,
          reviewCount: customer.reviews.length,
          customerAge: Math.floor((Date.now() - customer.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        }

        try {
          const prediction = await AIService.predictCustomerMetrics(customerData)
          predictions.push({
            customerId: customer.id,
            email: customer.email,
            prediction,
          })

          // Update customer
          await prisma.customer.update({
            where: { id: customer.id },
            data: {
              healthScore: prediction.healthScore,
              ltv: prediction.ltv,
              churnRisk: prediction.churnRisk,
              segment: prediction.segment,
            },
          })
        } catch (error) {
          console.error(`Error predicting for customer ${customer.id}:`, error)
        }
      }

      return NextResponse.json({
        totalCustomers: customers.length,
        predictions,
      })
    }
  } catch (error) {
    console.error("Customer Prediction Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
