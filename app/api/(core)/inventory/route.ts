import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mock inventory data - in real implementation, this would come from database
    const inventoryData = [
      {
        id: "1",
        productId: "prod_1",
        productName: "Wireless Headphones",
        sku: "WH-001",
        warehouseId: "wh_1",
        warehouseName: "Main Warehouse",
        currentStock: 150,
        reservedStock: 25,
        availableStock: 125,
        reorderPoint: 50,
        maxStock: 500,
        costPerUnit: 45.0,
        lastUpdated: new Date().toISOString(),
        status: "in_stock" as const,
      },
      {
        id: "2",
        productId: "prod_2",
        productName: "Smart Watch",
        sku: "SW-002",
        warehouseId: "wh_1",
        warehouseName: "Main Warehouse",
        currentStock: 25,
        reservedStock: 10,
        availableStock: 15,
        reorderPoint: 30,
        maxStock: 200,
        costPerUnit: 120.0,
        lastUpdated: new Date().toISOString(),
        status: "low_stock" as const,
      },
      {
        id: "3",
        productId: "prod_3",
        productName: "Bluetooth Speaker",
        sku: "BS-003",
        warehouseId: "wh_2",
        warehouseName: "Secondary Warehouse",
        currentStock: 0,
        reservedStock: 0,
        availableStock: 0,
        reorderPoint: 20,
        maxStock: 100,
        costPerUnit: 35.0,
        lastUpdated: new Date().toISOString(),
        status: "out_of_stock" as const,
      },
    ];

    return NextResponse.json({
      success: true,
      data: inventoryData,
    });
  } catch (error) {
    console.error("Inventory API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
