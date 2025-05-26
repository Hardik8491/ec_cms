import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock warehouse data
    const warehouseData = [
      {
        id: "wh_1",
        name: "Main Warehouse",
        location: "New York, NY",
        totalProducts: 1250,
        totalValue: 125000,
        lowStockItems: 15,
      },
      {
        id: "wh_2",
        name: "Secondary Warehouse",
        location: "Los Angeles, CA",
        totalProducts: 850,
        totalValue: 85000,
        lowStockItems: 8,
      },
      {
        id: "wh_3",
        name: "Distribution Center",
        location: "Chicago, IL",
        totalProducts: 2100,
        totalValue: 210000,
        lowStockItems: 23,
      },
    ];

    return NextResponse.json({
      success: true,
      data: warehouseData,
    });
  } catch (error) {
    console.error("Warehouses API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
