import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { subDays } from "date-fns";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "30d";

        // Calculate date range
        const now = new Date();
        let startDate: Date;
        switch (range) {
            case "7d":
                startDate = subDays(now, 7);
                break;
            case "30d":
                startDate = subDays(now, 30);
                break;
            case "90d":
                startDate = subDays(now, 90);
                break;
            default:
                startDate = subDays(now, 30);
        }

        // Get AI interactions and insights
        const aiInteractions = await prisma.aIInteraction.findMany({
            where: {
                userId: session.user.id,
                createdAt: {
                    gte: startDate,
                    lte: now,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Generate mock AI insights (in production, these would come from actual AI analysis)
        const insights = [
            {
                id: "1",
                type: "opportunity",
                title: "Revenue Growth Opportunity",
                description:
                    "Your electronics category shows 23% higher conversion rates. Consider expanding inventory.",
                impact: "high",
                confidence: 0.87,
                actionable: true,
                category: "Revenue",
                timestamp: new Date().toISOString(),
            },
            {
                id: "2",
                type: "warning",
                title: "Customer Churn Risk",
                description:
                    "15% of premium customers haven't purchased in 60 days. Implement retention campaign.",
                impact: "medium",
                confidence: 0.92,
                actionable: true,
                category: "Customer Retention",
                timestamp: new Date().toISOString(),
            },
            {
                id: "3",
                type: "prediction",
                title: "Seasonal Demand Forecast",
                description:
                    "AI predicts 34% increase in winter clothing demand next month.",
                impact: "high",
                confidence: 0.78,
                actionable: true,
                category: "Inventory",
                timestamp: new Date().toISOString(),
            },
        ];

        // Mock predictions data
        const predictions = {
            revenue: [
                {
                    date: "2024-01-01",
                    actual: 12000,
                    predicted: 11800,
                    confidence: 0.85,
                },
                {
                    date: "2024-01-02",
                    actual: 13500,
                    predicted: 13200,
                    confidence: 0.87,
                },
                {
                    date: "2024-01-03",
                    actual: 11200,
                    predicted: 11500,
                    confidence: 0.82,
                },
            ],
            customerChurn: [
                {
                    segment: "Premium",
                    current: 5,
                    predicted: 8,
                    risk: "medium",
                },
                {
                    segment: "Regular",
                    current: 12,
                    predicted: 15,
                    risk: "high",
                },
                { segment: "New", current: 25, predicted: 22, risk: "low" },
            ],
            productDemand: [
                {
                    product: "Wireless Headphones",
                    currentSales: 150,
                    predictedSales: 200,
                    trend: "up",
                },
                {
                    product: "Smart Watch",
                    currentSales: 89,
                    predictedSales: 120,
                    trend: "up",
                },
                {
                    product: "Phone Case",
                    currentSales: 200,
                    predictedSales: 180,
                    trend: "down",
                },
            ],
        };

        // Mock recommendations
        const recommendations = [
            {
                id: "1",
                type: "Marketing",
                title: "Implement Retargeting Campaign",
                description:
                    "Target customers who viewed products but didn't purchase with personalized ads.",
                expectedImpact: "+15% conversion rate",
                effort: "Low",
                priority: 1,
            },
            {
                id: "2",
                type: "Inventory",
                title: "Optimize Stock Levels",
                description:
                    "Reduce overstock in slow-moving categories and increase fast-moving inventory.",
                expectedImpact: "+$25k revenue",
                effort: "Medium",
                priority: 2,
            },
        ];

        // Calculate overview metrics
        const overview = {
            totalInsights: insights.length,
            highImpactInsights: insights.filter((i) => i.impact === "high")
                .length,
            automatedActions: 12,
            aiAccuracy: 0.87,
        };

        // AI usage statistics
        const aiUsage = {
            totalQueries: aiInteractions.length,
            successRate: 0.94,
            avgResponseTime: 1200,
            topFeatures: [
                { feature: "Product Generation", usage: 45 },
                { feature: "Analytics Query", usage: 32 },
                { feature: "Price Optimization", usage: 28 },
                { feature: "Customer Insights", usage: 21 },
            ],
        };

        return NextResponse.json({
            success: true,
            data: {
                overview,
                insights,
                predictions,
                recommendations,
                aiUsage,
            },
        });
    } catch (error) {
        console.error("AI Analytics API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
