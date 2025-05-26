import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { CacheKeys } from "@/lib/cacheKeys";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only agencies can create stores through this endpoint
    if (session.user.role !== "agency") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, description, currency = "USD" } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: "Store name is required" },
        { status: 400 }
      );
    }

    // Get agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    });

    if (!agency) {
      return NextResponse.json(
        { message: "Agency not found" },
        { status: 404 }
      );
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        description,
        currency,
        userId: session.user.id,
        agencyId: agency.id,
      },
    });

    // Invalidate the agency's stores cache
    await redis.del(CacheKeys.agencyStores(agency.id));

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only agencies can access this endpoint
    if (session.user.role !== "agency") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get agency
    const agency = await prisma.agency.findUnique({
      where: { userId: session.user.id },
    });

    if (!agency) {
      return NextResponse.json(
        { message: "Agency not found" },
        { status: 404 }
      );
    }

    // Check cache first
    const cacheKey = CacheKeys.agencyStores(agency.id);
    const cachedStores = await redis.get(cacheKey);

    if (cachedStores) {
      return NextResponse.json({
        data: cachedStores,
        cached: true,
      });
    }

    // Get stores for this agency
    const stores = await prisma.store.findMany({
      where: { agencyId: agency.id },
      include: {
        _count: {
          select: {
            products: true,
            orders: true,
            customers: true,
          },
        },
      },
    });

    // Cache stores for 5 minutes
    await redis.setex(cacheKey, 300, stores);

    return NextResponse.json({
      data: stores,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
