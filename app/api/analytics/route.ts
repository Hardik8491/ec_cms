import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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
        const storeId = searchParams.get("storeId");

        if (!storeId) {
            return NextResponse.json(
                { error: "Store ID is required" },
                { status: 400 }
            );
        }

        // Check if user has access to this store
        if (session.user.role === "AGENCY_USER") {
            const userStore = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                    stores: {
                        some: {
                            id: storeId,
                        },
                    },
                },
            });

            if (!userStore) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        } else if (session.user.role === "AGENCY_ADMIN") {
            const store = await prisma.store.findUnique({
                where: { id: storeId },
            });

            if (!store || store.agencyId !== session.user.agencyId) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        // Get store statistics
        const [totalOrders, totalRevenue] = await Promise.all([
            prisma.order.count({
                where: { storeId },
            }),
            prisma.order.aggregate({
                where: { storeId },
                _sum: { total: true },
            }),
        ]);

        return NextResponse.json({
            totalOrders,
            totalRevenue: totalRevenue._sum.total || 0,
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}
