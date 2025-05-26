
// import { type NextRequest, NextResponse } from "next/server"
// import { PrismaClient } from "@prisma/client"
// import { handleWebhookEvent } from "@/lib/payment/stripe"

// const prisma = new PrismaClient()

// export async function POST(request: NextRequest) {
//   try {
//     const payload = await request.text()
//     const signature = request.headers.get("stripe-signature") || ""

//     // Verify and handle the webhook event
//     const event = await handleWebhookEvent(payload, signature)

//     // Log the webhook event
//     await prisma.auditLog.create({
//       data: {
//         userId: "system", // System-generated event
//         action: "webhook",
//         resource: "stripe",
//         resourceId: event.id,
//         details: { type: event.type },
//         ipAddress: request.headers.get("x-forwarded-for") || "",
//         userAgent: request.headers.get("user-agent") || "",
//       },
//     })

//     return NextResponse.json({ received: true })
//   } catch (error) {
//     console.error("Error handling Stripe webhook:", error)
//     return NextResponse.json({ error: "Webhook error" }, { status: 400 })
//   }
// }
