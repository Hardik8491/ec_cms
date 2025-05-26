import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { storeId, productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          select: {
            category: {
              select: {
                id: true,
              },
            },
          },
        },
        variants: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const categoryIds = product.categories.map((c) => c.category.id);
    const variantNames = product.variants.map((v) => v.name);
    const price = product.price;

    const minPrice = price * 0.8;
    const maxPrice = price * 1.2;

    const relatedProducts = await prisma.product.findMany({
      where: {
        storeId,
        id: { not: productId },
        price: { gte: minPrice, lte: maxPrice },
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
        ...(variantNames.length > 0 && {
          variants: {
            some: {
              name: { in: variantNames },
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        variants: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      take: 6,
    });

    return NextResponse.json(
      { relatedProducts },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
