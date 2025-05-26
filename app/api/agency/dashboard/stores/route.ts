import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { subDays } from "date-fns";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (
        session.user.role !== "AGENCY_OWNER" &&
        session.user.role !== "AGENCY_ADMIN" &&
        session.user.role !== "admin" &&
        session.user.role !== "agency" && 
        session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "revenue";
    const sortOrder = searchParams.get("sortOrder") || "desc";

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

    // Get agency ID
    let agencyId: string | null = null;
    if (
      session.user.role === "AGENCY_OWNER" ||
      session.user.role === "AGENCY_ADMIN"
    ) {
      const agency = await prisma.agency.findFirst({
        where: {
          OR: [
            { ownerId: session.user.id },
            { users: { some: { id: session.user.id } } },
          ],
        },
      });
      agencyId = agency?.id || null;
    }

    const whereClause = {
      ...(agencyId && { agencyId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { domain: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    // Get stores with metrics
    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        orders: {
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: startDate,
              lte: now,
            },
          },
        },
        _count: {
          select: {
            products: true,
            customers: true,
            orders: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate metrics for each store
    const storesWithMetrics = stores.map((store) => {
      const revenue = store.orders.reduce((sum, order) => sum + order.total, 0);
      const orders = store.orders.length;
      const avgOrderValue = orders > 0 ? revenue / orders : 0;

      return {
        id: store.id,
        name: store.name,
        domain: store.domain,
        status: store.status,
        createdAt: store.createdAt,
        revenue,
        orders,
        avgOrderValue,
        products: store._count.products,
        customers: store._count.customers,
        totalOrders: store._count.orders,
      };
    });

    // Sort stores based on sortBy parameter
    storesWithMetrics.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a] as number;
      const bValue = b[sortBy as keyof typeof b] as number;

      if (sortOrder === "desc") {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Get total count for pagination
    const totalStores = await prisma.store.count({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      data: {
        stores: storesWithMetrics,
        pagination: {
          page,
          limit,
          total: totalStores,
          pages: Math.ceil(totalStores / limit),
        },
        filters: {
          range,
          search,
          sortBy,
          sortOrder,
        },
      },
    });
  } catch (error) {
    console.error("Agency stores API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
