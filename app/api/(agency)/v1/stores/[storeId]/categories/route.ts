import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

// Define schema for a single category
const singleCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
});

// Accept single object or array of category objects
const categorySchema = z.union([
  singleCategorySchema,
  z.array(singleCategorySchema),
]);

// GET: fetch paginated + searchable categories
export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: Promise<string> } }
) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const storeId = await params.storeId;
    const where = {
      storeId: storeId,
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

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: create one or many categories
// export async function POST(request: NextRequest, { params }: { params: { storeId: string } }) {
//   try {
//     // Uncomment when auth required
//     // const session = await getServerSession(authOptions)
//     // if (!session) {
//     //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     // }

//     const storeId= await params.storeId
//     const body = await request.json()
//     const validated = categorySchema.parse(body)

//     // If array, bulk create
//     if (Array.isArray(validated)) {
//       const created = await prisma.$transaction(
//         validated.map((cat) =>
//           prisma.category.create({
//             data: {
//               ...cat,
//             storeId,
//             },
//           })
//         )
//       )
//       return NextResponse.json(created, { status: 201 })
//     }

//     // Else, create single category
//     const created = await prisma.category.create({
//       data: {
//         ...validated,
//         storeId: params.storeId,
//       },
//       include: {
//         parent: true,
//         subcategories: true,
//         _count: {
//           select: { products: true },
//         },
//       },
//     })

//     return NextResponse.json(created, { status: 201 })
//   } catch (error) {
//     console.error("Error creating category:", error)
//     if (error instanceof z.ZodError) {
//       return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
//     }
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: Promise<string> } }
) {
  try {
    const storeId = await params.storeId;
    const body = await request.json();
    const validated = categorySchema.parse(body);

    // Handle hierarchical category creation
    if (Array.isArray(validated)) {
      const createdCategories = [];

      for (const categoryData of validated) {
        // Create parent category
        const parent = await prisma.category.create({
          data: {
            name: categoryData.name,
            description: categoryData.description,
            parentId: categoryData.parentId,
            storeId,
          },
        });

        // Create children if they exist
        if (categoryData.children && categoryData.children.length > 0) {
          const children = await prisma.$transaction(
            categoryData.children.map((child) =>
              prisma.category.create({
                data: {
                  name: child.name,
                  parentId: parent.id,
                  storeId,
                },
              })
            )
          );
          createdCategories.push({ ...parent, children });
        } else {
          createdCategories.push(parent);
        }
      }

      return NextResponse.json(createdCategories, { status: 201 });
    }

    // Single category creation (with potential children)
    const created = await prisma.category.create({
      data: {
        name: validated.name,
        description: validated.description,
        parentId: validated.parentId,
        storeId,
      },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
