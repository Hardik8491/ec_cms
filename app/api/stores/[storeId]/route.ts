import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
    request: NextRequest,
    { params }: { params: { storeId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const store = await prisma.store.findUnique({
            where: {
                id: params.storeId,
            },
            include: {
                agency: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        orders: true,
                        customers: true,
                    },
                },
            },
        });

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this store
        if (session.user.role === "AGENCY_USER") {
            const userStore = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                    stores: {
                        some: {
                            id: store.id,
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
            if (store.agencyId !== session.user.agencyId) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        return NextResponse.json({ store });
    } catch (error) {
        console.error("Error fetching store:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
                message: "An unexpected error occurred",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { storeId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { storeId } = params;
        const { name, description, logo, currency, active } =
            await request.json();

        // Get store
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this store
        if (session.user.role === "AGENCY_USER") {
            const userStore = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                    stores: {
                        some: {
                            id: store.id,
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
            if (store.agencyId !== session.user.agencyId) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        // Update store
        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: {
                name,
                description,
                logo,
                currency,
                active,
            },
        });

        return NextResponse.json({ store: updatedStore });
    } catch (error) {
        console.error("Update store error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { storeId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { storeId } = params;

        // Get store
        const store = await prisma.store.findUnique({
            where: { id: storeId },
        });

        if (!store) {
            return NextResponse.json(
                { error: "Store not found" },
                { status: 404 }
            );
        }

        // Check if user has access to this store
        if (session.user.role === "AGENCY_USER") {
            const userStore = await prisma.user.findFirst({
                where: {
                    id: session.user.id,
                    stores: {
                        some: {
                            id: store.id,
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
            if (store.agencyId !== session.user.agencyId) {
                return NextResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 }
                );
            }
        }

        // Delete store
        await prisma.store.delete({
            where: { id: storeId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete store error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
