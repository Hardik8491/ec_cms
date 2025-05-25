import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"
import { AIService } from "@/lib/ai"

const prisma = new PrismaClient()

// POST /api/v1/stores/:storeId/ai/marketing/generate-campaign
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
    const { campaignType, audienceSegment, productIds, campaignGoal } = body

    if (!campaignType || !audienceSegment) {
      return NextResponse.json(
        {
          error: "Campaign type and audience segment are required",
        },
        { status: 400 },
      )
    }

    // Get products for campaign
    let products = []
    if (productIds && productIds.length > 0) {
      products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          storeId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
        },
      })
    } else {
      // Get featured products if none specified
      products = await prisma.product.findMany({
        where: {
          storeId,
          isFeatured: true,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
        },
        take: 5,
      })
    }

    // Define audience based on segment
    const audienceData = {
      segment: audienceSegment,
      goal: campaignGoal || "increase_sales",
      demographics: this.getAudienceDemographics(audienceSegment),
    }

    // Generate AI campaign
    const campaign = await AIService.generateMarketingCampaign(campaignType, audienceData, products)

    // Save campaign
    const savedCampaign = await prisma.marketingCampaign.create({
      data: {
        name: `AI Generated ${campaignType} Campaign`,
        type: campaignType,
        storeId,
        content: campaign,
        audience: audienceData,
        status: "draft",
        aiGenerated: true,
      },
    })

    // Log AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: validApiKey.userId,
        type: "generation",
        input: `Campaign generation: ${campaignType} for ${audienceSegment}`,
        output: JSON.stringify(campaign),
        model: "gpt-4",
        tokens: 600,
        cost: 0.02,
      },
    })

    return NextResponse.json({
      success: true,
      campaign: savedCampaign,
      generatedContent: campaign,
    })
  } catch (error) {
    console.error("Campaign Generation Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getAudienceDemographics(segment: string) {
  const demographics = {
    high_value: {
      description: "Customers with high lifetime value",
      characteristics: ["frequent_buyers", "high_spending", "loyal"],
    },
    at_risk: {
      description: "Customers at risk of churning",
      characteristics: ["declining_engagement", "no_recent_purchases"],
    },
    new_customers: {
      description: "Recently acquired customers",
      characteristics: ["first_time_buyers", "onboarding_phase"],
    },
    seasonal_shoppers: {
      description: "Customers who shop during specific seasons",
      characteristics: ["seasonal_patterns", "holiday_shoppers"],
    },
  }

  return (
    demographics[segment] || {
      description: "General audience",
      characteristics: ["broad_appeal"],
    }
  )
}
