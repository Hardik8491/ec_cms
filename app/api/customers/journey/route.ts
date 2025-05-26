import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock customer journey data
    const customers = [
      {
        id: "1",
        name: "John Smith",
        email: "john@example.com",
        phone: "+1234567890",
        segment: "vip",
        stage: "retention",
        ltv: 1250.0,
        totalOrders: 15,
        lastActivity: "2 days ago",
        churnRisk: 15,
        healthScore: 95,
        tags: ["high-value", "loyal"],
      },
      {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        segment: "at_risk",
        stage: "consideration",
        ltv: 450.0,
        totalOrders: 3,
        lastActivity: "45 days ago",
        churnRisk: 85,
        healthScore: 25,
        tags: ["at-risk", "needs-attention"],
      },
      {
        id: "3",
        name: "Mike Davis",
        email: "mike@example.com",
        segment: "new",
        stage: "awareness",
        ltv: 89.0,
        totalOrders: 1,
        lastActivity: "1 week ago",
        churnRisk: 35,
        healthScore: 70,
        tags: ["new-customer", "potential"],
      },
    ];

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Customer Journey API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
