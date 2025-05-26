import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { StoreService } from "@/services/store-service";
import { z } from "zod";

const updateStoreSchema = z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional().nullable(),
    logo: z.string().url().optional().nullable(),
    subdomain: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/)
        .optional(),
    currency: z.string().length(3).optional(),
    userId: z.string().optional(),
    agencyId: z.string().optional().nullable(),
    vendorId: z.string().optional().nullable(),
    isMarketplace: z.boolean().optional(),
    commissionRate: z.number().min(0).max(100).optional(),
    aiEnabled: z.boolean().optional(),
});

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = updateStoreSchema.parse(body);

        if (validatedData.subdomain) {
            const existingStore = await StoreService.getStoreBySubdomain(
                validatedData.subdomain
            );
            if (existingStore && existingStore.id !== params.id) {
                return NextResponse.json(
                    { error: "Subdomain is already in use" },
                    { status: 400 }
                );
            }
        }

        const updatedStore = await StoreService.updateStore(
            params.id,
            validatedData
        );

        return NextResponse.json(updatedStore);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
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
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await StoreService.deleteStore(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
