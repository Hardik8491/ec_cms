import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AgencyService } from "@/services/agency-service";
import { z } from "zod";

const createAgencySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    logo: z.string().url().optional().nullable(),
    website: z.string().url().optional().nullable(),
    subdomain: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/),
    userId: z.string(),
    aiEnabled: z.boolean(),
    aiCredits: z.number().min(0),
});

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = createAgencySchema.parse(body);

        const existingAgency = await AgencyService.getAgencyBySubdomain(
            validatedData.subdomain
        );
        if (existingAgency) {
            return NextResponse.json(
                { error: "Subdomainis already in use" },
                { status: 400 }
            );
        }
        const newAgency = await AgencyService.createAgency(validatedData);

        return NextResponse.json(newAgency);
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
