import { type NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { validateApiKey } from "@/lib/auth";

const prisma = new PrismaClient();

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://localhost:3001", // your frontend origin
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Expose-Headers": "X-User-Id, X-Store-Id, X-Permissions", // <== THIS
};

// Handle CORS preflight OPTIONS request
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET /api/v1/stores/:storeId/products
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { storeId } = params;
    const url = new URL(request.url);
    const limit = Number.parseInt(url.searchParams.get("limit") || "50");
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") || "desc";

    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");

    const where: any = { storeId };

    // 🏷 Category filter
    if (category) {
      where.categories = {
        some: {
          category: {
            id: category,
          },
        },
      };
    }

    // 🔍 Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 💸 Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        images: true,
        sku: true,
        description: true,
        price: true,
        comparePrice: true,
        cost: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                storeId: true,
                parentId: true,
                aiTags: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        variants: {
          // return empty array or add fields like size, color, etc. if needed
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json(
      {
        products,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/v1/stores/:storeId/products
export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const storeId = params.storeId;

    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      cost,
      sku,
      barcode,
      images,
      categories,
      variants,
      quantity,
      vendorId,
      isActive,
      isFeatured,
      aiTags,
      seoTitle,
      seoDescription,
      salesVelocity,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (variants && variants.length > 0) {
      for (const variant of variants) {
        if (!variant.name || !variant.options || variant.price === undefined) {
          return NextResponse.json(
            { error: "Each variant must include name, options, and price" },
            { status: 400, headers: corsHeaders }
          );
        }
      }
    }

    if (categories && categories.length > 0) {
      for (const categoryId of categories) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });
        if (!category) {
          return NextResponse.json(
            { error: `Category with ID ${categoryId} not found` },
            { status: 400, headers: corsHeaders }
          );
        }
      }
    }

    const [createdProduct] = await prisma.$transaction([
      prisma.product.create({
        data: {
          name,
          description,
          price,
          comparePrice,
          cost,
          sku,
          barcode,
          images: images || [],
          quantity: quantity || 0,
          storeId,
          vendorId: vendorId || null,
          isActive: isActive !== undefined ? isActive : true,
          isFeatured: isFeatured || false,
          aiTags: aiTags || null,
          seoTitle: seoTitle || null,
          seoDescription: seoDescription || null,
          salesVelocity: salesVelocity || null,
        },
      }),
    ]);

    if (categories && categories.length > 0) {
      await prisma.productCategory.createMany({
        data: categories.map((categoryId: string) => ({
          productId: createdProduct.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    if (variants && variants.length > 0) {
      await prisma.productVariant.createMany({
        data: variants.map((variant: any) => ({
          productId: createdProduct.id,
          name: variant.name,
          options: variant.options,
          price: variant.price,
          quantity: variant.quantity || 0,
          sku: variant.sku || null,
        })),
      });
    }

    const productWithRelations = await prisma.product.findUnique({
      where: { id: createdProduct.id },
      include: {
        categories: {
          include: { category: true },
        },
        variants: true,
        vendor: true,
      },
    });

    return NextResponse.json(productWithRelations, {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.message?.includes("Category with ID")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
