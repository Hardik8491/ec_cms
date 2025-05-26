import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

const variantSchema = z.object({
  name: z.string().min(1),
  options: z.record(z.any()),
  price: z.number().positive(),
  quantity: z.number().int().min(0),
  sku: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        productId: params.productId,
        product: {
          storeId: params.storeId,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(variants);
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = variantSchema.parse(body);

    const variant = await prisma.productVariant.create({
      data: {
        ...validatedData,
        productId: params.productId,
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("Error creating variant:", error);
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
