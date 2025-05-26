import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { StoreService } from "@/services/store-service";
import { z } from "zod";

const createStoreSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    logo: z.string().url().optional().nullable(),
    subdomain: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/),
    currency: z.string().length(3),
    userId: z.string(),
    agencyId: z.string().optional().nullable(),
    vendorId: z.string().optional().nullable(),
    isMarketplace: z.boolean(),
    commissionRate: z.number().min(0).max(100),
    aiEnabled: z.boolean(),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = createStoreSchema.parse(body);

        const existingStore = await StoreService.getStoreBySubdomain(
            validatedData.subdomain
        );
        if (existingStore) {
            return NextResponse.json(
                { error: "Subdomain is already in use" },
                { status: 400 }
            );
        }

        const newStore = await StoreService.createStore(validatedData);

        return NextResponse.json(newStore);
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
