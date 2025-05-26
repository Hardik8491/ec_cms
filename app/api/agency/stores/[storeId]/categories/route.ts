import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { z } from "zod"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/db"
import { CacheKeys } from "@/lib/cacheKeys"
import { redis } from "@/lib/redis"

const categorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    // Generate cache key
    const cacheKey = CacheKeys.categoryList(params.storeId, page, limit, search);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        ...JSON.parse(cachedData),
        cached: true,
      });
    }

    const where = {
      storeId: params.storeId,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: true,
          subcategories: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.count({ where }),
    ]);

    const responseData = {
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(responseData));

    return NextResponse.json({
      ...responseData,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        storeId: params.storeId,
      },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Invalidate relevant caches
    await Promise.all([
      redis.del(CacheKeys.storeCategories(params.storeId)),
      // Invalidate all paginated lists for this store
      redis.keys(`store:${params.storeId}:categories:page:*`).then(keys => {
        if (keys.length) return redis.del(...keys);
      }),
    ]);

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
