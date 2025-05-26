import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

const categoryUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { storeId: string; categoryId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const category = await prisma.category.findFirst({
            where: {
                id: params.categoryId,
                storeId: params.storeId,
            },
            include: {
                parent: true,
                subcategories: true,
                products: {
                    include: {
                        product: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "Category not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { storeId: string; categoryId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = categoryUpdateSchema.parse(body);

        const category = await prisma.category.update({
            where: {
                id: params.categoryId,
                storeId: params.storeId,
            },
            data: validatedData,
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

        return NextResponse.json(category);
    } catch (error) {
        console.error("Error updating category:", error);
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { storeId: string; categoryId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await prisma.category.delete({
            where: {
                id: params.categoryId,
                storeId: params.storeId,
            },
        });

        return NextResponse.json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
