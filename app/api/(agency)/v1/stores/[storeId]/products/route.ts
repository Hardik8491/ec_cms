import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { validateApiKey } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/v1/stores/:storeId/products - Get all products for a store
export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const { storeId } = params

    // Check API key from headers
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    const validApiKey = await validateApiKey(apiKey)
    if (!validApiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    // Check if API key has access to this store
    if (validApiKey.storeId && validApiKey.storeId !== storeId) {
      return NextResponse.json({ error: "Unauthorized access to this store" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const category = url.searchParams.get("category")
    const search = url.searchParams.get("search")
    const sort = url.searchParams.get("sort") || "createdAt"
    const order = url.searchParams.get("order") || "desc"

    // Build where clause
    const where: any = { storeId }

    if (category) {
      where.categories = {
        some: {
          category: {
            id: category,
          },
        },
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        variants: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sort]: order,
      },
    })

    // Get total count
    const total = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/v1/stores/:storeId/products - Create a new product
export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const storeId = await params.storeId;

    // Get request body
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

    // Basic validation
    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }

    // Validate variant structure if provided
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        if (!variant.name || !variant.options || variant.price === undefined) {
          return NextResponse.json(
            { error: 'Each variant must include name, options, and price' },
            { status: 400 }
          );
        }
      }
    }

    // Validate categories exist
    if (categories && categories.length > 0) {
      for (const categoryId of categories) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!category) {
          return NextResponse.json(
            { error: `Category with ID ${categoryId} not found` },
            { status: 400 }
          );
        }
      }
    }

    // Create product inside a transaction
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

    // Create category relationships
    if (categories && categories.length > 0) {
      await prisma.productCategory.createMany({
        data: categories.map((categoryId: string) => ({
          productId: createdProduct.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    // Create variants
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

    // Return product with all relations
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

    return NextResponse.json(productWithRelations, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.message?.includes('Category with ID')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}