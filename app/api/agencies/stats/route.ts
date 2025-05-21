import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const agencyId = session.user.agencyId;

        if (!agencyId) {
            return NextResponse.json(
                { error: "Agency ID not found" },
                { status: 400 }
            );
        }

        // Get total stores
        const totalStores = await prisma.store.count({
            where: { agencyId },
        });

        // Get total revenue (sum of all order totals)
        const totalRevenue = await prisma.order.aggregate({
            where: {
                store: {
                    agencyId,
                },
                status: "COMPLETED",
            },
            _sum: {
                total: true,
            },
        });

        // Get total customers
        const totalCustomers = await prisma.customer.count({
            where: {
                store: {
                    agencyId,
                },
            },
        });

        // Get active subscriptions
        const activeSubscriptions = await prisma.subscription.count({
            where: {
                agencyId,
                status: "ACTIVE",
            },
        });

        return NextResponse.json({
            totalStores,
            totalRevenue: totalRevenue._sum.total || 0,
            totalCustomers,
            activeSubscriptions,
        });
    } catch (error) {
        console.error("Error fetching agency stats:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
