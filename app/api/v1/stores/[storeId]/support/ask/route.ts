import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"
import { AIService } from "@/lib/ai"

const prisma = new PrismaClient()

// POST /api/v1/stores/:storeId/support/ask
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
    const { message, customerId, subject, priority = "medium" } = body

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get customer context if provided
    let customerContext = null
    if (customerId) {
      customerContext = await prisma.customer.findFirst({
        where: { id: customerId, storeId },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      })
    }

    // Get store context
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        name: true,
        description: true,
      },
    })

    // Prepare context for AI
    const context = {
      store,
      customer: customerContext,
      storeId,
    }

    // Generate AI response
    const aiResponse = await AIService.generateSupportResponse(message, context)

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        customerId,
        userId: validApiKey.userId,
        subject: subject || "Customer Inquiry",
        message,
        status: "open",
        priority,
        aiResponse,
      },
    })

    // Log AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: validApiKey.userId,
        type: "chat",
        input: message,
        output: aiResponse,
        model: "gpt-4",
        tokens: 300,
        cost: 0.01,
      },
    })

    return NextResponse.json({
      ticketId: ticket.id,
      aiResponse,
      suggestedActions: this.getSuggestedActions(message),
      escalationRecommended: this.shouldEscalate(message),
    })
  } catch (error) {
    console.error("AI Support Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getSuggestedActions(message: string): string[] {
  const actions = []

  if (message.toLowerCase().includes("refund")) {
    actions.push("Process refund", "Check refund policy", "Verify order details")
  }

  if (message.toLowerCase().includes("shipping") || message.toLowerCase().includes("delivery")) {
    actions.push("Check tracking information", "Contact shipping carrier", "Verify address")
  }

  if (message.toLowerCase().includes("product") && message.toLowerCase().includes("defect")) {
    actions.push("Initiate return process", "Offer replacement", "Escalate to quality team")
  }

  return actions
}

function shouldEscalate(message: string): boolean {
  const escalationKeywords = [
    "legal",
    "lawsuit",
    "attorney",
    "lawyer",
    "sue",
    "court",
    "discrimination",
    "harassment",
    "threat",
    "violence",
    "fraud",
    "scam",
    "stolen",
    "hack",
    "security breach",
  ]

  return escalationKeywords.some((keyword) => message.toLowerCase().includes(keyword))
}
