import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Mock AI response - in real implementation, this would use OpenAI or similar
    let response = "";
    let actions: Array<{ label: string; action: string; data?: any }> = [];

    if (
      message.toLowerCase().includes("sales") ||
      message.toLowerCase().includes("revenue")
    ) {
      response =
        "Based on your current data, your sales are performing well this month with a 15% increase compared to last month. Your total revenue is $45,230 with 234 orders. Your top-selling product is 'Wireless Headphones' generating $12,450 in revenue.";
      actions = [
        {
          label: "View Sales Report",
          action: "navigate",
          data: { url: "/analytics/sales" },
        },
        { label: "Export Data", action: "export", data: { type: "sales" } },
      ];
    } else if (
      message.toLowerCase().includes("inventory") ||
      message.toLowerCase().includes("stock")
    ) {
      response =
        "You currently have 15 products with low stock levels that need attention. Your 'Bluetooth Speaker' is out of stock and 'Smart Watch' is running low with only 25 units remaining. I recommend reordering these items soon.";
      actions = [
        {
          label: "View Inventory",
          action: "navigate",
          data: { url: "/inventory" },
        },
        { label: "Create Purchase Order", action: "create_po" },
      ];
    } else if (message.toLowerCase().includes("customers")) {
      response =
        "You have 1,234 total customers with 156 VIP customers and 89 at-risk customers. Your customer retention rate is 78% and average customer lifetime value is $245. I suggest creating a re-engagement campaign for at-risk customers.";
      actions = [
        {
          label: "View Customer Journey",
          action: "navigate",
          data: { url: "/customers/journey" },
        },
        {
          label: "Create Campaign",
          action: "navigate",
          data: { url: "/marketing/campaigns" },
        },
      ];
    } else if (
      message.toLowerCase().includes("marketing") ||
      message.toLowerCase().includes("campaign")
    ) {
      response =
        "I can help you create effective marketing campaigns. Based on your customer data, I recommend targeting your VIP customers with a loyalty program and creating a win-back campaign for customers who haven't purchased in 60+ days.";
      actions = [
        {
          label: "Create Campaign",
          action: "navigate",
          data: { url: "/marketing/campaigns" },
        },
        {
          label: "View Templates",
          action: "navigate",
          data: { url: "/marketing/templates" },
        },
      ];
    } else {
      response =
        "I'm here to help you with your e-commerce business! I can provide insights about your sales, inventory, customers, marketing campaigns, and much more. What specific area would you like to explore?";
      actions = [
        {
          label: "Sales Analytics",
          action: "query",
          data: { query: "Show me my sales performance" },
        },
        {
          label: "Inventory Status",
          action: "query",
          data: { query: "Check my inventory levels" },
        },
        {
          label: "Customer Insights",
          action: "query",
          data: { query: "Tell me about my customers" },
        },
      ];
    }

    return NextResponse.json({
      success: true,
      response,
      actions,
    });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
