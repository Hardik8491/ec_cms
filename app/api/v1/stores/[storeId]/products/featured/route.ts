import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type RouteParams = {
  params: { storeId: string };
};

function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// GET featured products
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId } = params;

    const products = await prisma.product.findMany({
      where: { storeId, isFeatured: true },
      include: {
        categories: { include: { category: true } },
        variants: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response = NextResponse.json({ products });
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
