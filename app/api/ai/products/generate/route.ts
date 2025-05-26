import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { AIService } from "@/lib/ai";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
// Declare the prisma variable

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            productIdea,
            category,
            targetAudience,
            priceRange,
            style,
            features,
            imageUrl,
            competitorUrl,
        } = body;

        if (!productIdea) {
            return NextResponse.json(
                { error: "Product idea is required" },
                { status: 400 }
            );
        }

        // Generate comprehensive product data using AI
        // const productData = await AIService.generateProductTags({
        //     idea: productIdea,
        //     category,
        //     targetAudience,
        //     priceRange,
        //     style,
        //     features,
        //     imageUrl,
        //     competitorUrl,
        // });
        //Todo:complate this service
        const productData=""

        // Log AI interaction
        await prisma.aIInteraction.create({
            data: {
                userId: session.user.id,
                type: "generation",
                input: `Product generation: ${productIdea}`,
                output: JSON.stringify(productData),
                model: "gpt-4",
                tokens: 1500,
                cost: 0.05,
            },
        });

        return NextResponse.json({
            success: true,
            product: productData,
        });
    } catch (error) {
        console.error("Product generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
