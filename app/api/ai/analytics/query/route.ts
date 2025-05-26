import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { AIService } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { query } = await request.json();

        if (!query) {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        // Get user's analytics data
        const analyticsData = await prisma.analytics.findMany({
            where: {
                store: {
                    userId: session.user.id,
                },
            },
            include: {
                store: true,
            },
            take: 100,
            orderBy: {
                createdAt: "desc",
            },
        });

        // Query AI with the analytics data
        const response = await AIService.queryAnalytics(query, analyticsData);

        // Log AI interaction
        await prisma.aIInteraction.create({
            data: {
                userId: session.user.id,
                type: "query",
                input: query,
                output: response,
                model: "gpt-4",
                tokens: 500,
                cost: 0.02,
            },
        });

        return NextResponse.json({
            success: true,
            response,
        });
    } catch (error) {
        console.error("AI Analytics Query error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
