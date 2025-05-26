import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateApiKey } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteParams = {
  params: { storeId: string; productId: string };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Expose-Headers": "X-User-Id, X-Store-Id, X-Permissions",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
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

    return NextResponse.json(product, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
    
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
