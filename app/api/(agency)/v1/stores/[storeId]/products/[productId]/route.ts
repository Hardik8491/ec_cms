import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateApiKey } from "@/lib/auth";

const prisma = new PrismaClient();

type RouteParams = {
  params:{ storeId: string; productId: string };
};

function setCorsHeaders(response: NextResponse) {
  response.headers.set("Access-Control-Allow-Origin", "http://localhost:3001");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, x-api-key"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

// GET single product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId, productId } = await params;

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
      include: {
        categories: { include: { category: true } },
        variants: true,
      },
    });

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const response = NextResponse.json(product);
    return setCorsHeaders(response);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH update product
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId, productId } = params;
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey)
      return NextResponse.json({ error: "API key required" }, { status: 401 });

    const validApiKey = await validateApiKey(apiKey);
    if (!validApiKey)
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

    if (validApiKey.storeId && validApiKey.storeId !== storeId)
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );

    const permissions = validApiKey.permissions as string[];
    if (!permissions.includes("write") && !permissions.includes("admin"))
      return NextResponse.json(
        { error: "API key lacks write permissions" },
        { status: 403 }
      );

    const data = await request.json();

    const updatedProduct = await prisma.product.updateMany({
      where: { id: productId, storeId },
      data,
    });

    if (updatedProduct.count === 0)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { categories: { include: { category: true } }, variants: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { storeId, productId } = params;
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey)
      return NextResponse.json({ error: "API key required" }, { status: 401 });

    const validApiKey = await validateApiKey(apiKey);
    if (!validApiKey)
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

    if (validApiKey.storeId && validApiKey.storeId !== storeId)
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );

    const permissions = validApiKey.permissions as string[];
    if (!permissions.includes("write") && !permissions.includes("admin"))
      return NextResponse.json(
        { error: "API key lacks write permissions" },
        { status: 403 }
      );

    await prisma.product.deleteMany({
      where: { id: productId, storeId },
    });

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
