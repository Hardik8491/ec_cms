import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock campaign data
    const campaigns = [
      {
        id: "1",
        name: "Summer Sale 2024",
        type: "email",
        status: "active",
        audience: "all",
        startDate: "2024-06-01",
        endDate: "2024-06-30",
        budget: 5000,
        spent: 3200,
        impressions: 45000,
        clicks: 2250,
        conversions: 180,
        revenue: 18000,
        ctr: 5.0,
        conversionRate: 8.0,
        roas: 5.6,
      },
      {
        id: "2",
        name: "VIP Customer Loyalty",
        type: "email",
        status: "active",
        audience: "vip",
        startDate: "2024-05-15",
        budget: 2000,
        spent: 1800,
        impressions: 12000,
        clicks: 960,
        conversions: 96,
        revenue: 9600,
        ctr: 8.0,
        conversionRate: 10.0,
        roas: 5.3,
      },
      {
        id: "3",
        name: "Win-Back Campaign",
        type: "sms",
        status: "paused",
        audience: "at_risk",
        startDate: "2024-05-01",
        budget: 1500,
        spent: 750,
        impressions: 5000,
        clicks: 400,
        conversions: 32,
        revenue: 1600,
        ctr: 8.0,
        conversionRate: 8.0,
        roas: 2.1,
      },
    ];

    return NextResponse.json({
      success: true,
      campaigns,
    });
  } catch (error) {
    console.error("Campaigns API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaignData = await request.json();

    // In real implementation, save to database
    const newCampaign = {
      id: Date.now().toString(),
      ...campaignData,
      status: "draft",
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      ctr: 0,
      conversionRate: 0,
      roas: 0,
    };

    return NextResponse.json({
      success: true,
      campaign: newCampaign,
    });
  } catch (error) {
    console.error("Create Campaign API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
